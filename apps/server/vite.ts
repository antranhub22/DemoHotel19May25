import { logger } from '@shared/utils/logger';
import express, { type Express } from 'express';
import fs from 'fs';
import type { Server } from 'http';
import { nanoid } from 'nanoid';
import path from 'path';
import { createLogger, createServer as createViteServer } from 'vite';

const viteLogger = createLogger();

export function log(_source = 'express') {
  logger.debug('${formattedTime} [${source}] ${message}', 'Component');
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
  };

  // Add CSP middleware
  app.use((_req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://c.daily.co https://*.daily.co https://replit.com https://*.replit.com https://cdn.jsdelivr.net https://unpkg.com; " +
        "connect-src 'self' https://c.daily.co https://*.daily.co wss://*.daily.co https://api.daily.co https://*.vapi.ai wss://*.vapi.ai https://api.vapi.ai https://demohotel19may25.onrender.com https://minhnhotelben.onrender.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: blob: https://*.daily.co https://unpkg.com; " +
        "media-src 'self' blob: https://*.daily.co; " +
        "frame-src 'self' https://*.daily.co; " +
        "worker-src 'self' blob: data:; " +
        "object-src 'none';"
    );
    next();
  });

  const vite = await createViteServer({
    configFile: path.resolve(process.cwd(), 'vite.config.ts'),
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: 'custom',
  });

  app.use(vite.middlewares);

  // ✅ FIXED: Only serve index.html for non-asset requests
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    // ✅ IMPORTANT: Skip index.html serving for asset requests
    if (
      url.startsWith('/assets/') ||
      url.startsWith('/src/') ||
      url.startsWith('/@') ||
      url.endsWith('.js') ||
      url.endsWith('.css') ||
      url.endsWith('.map') ||
      url.endsWith('.ico') ||
      url.endsWith('.png') ||
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.svg') ||
      url.endsWith('.woff') ||
      url.endsWith('.woff2') ||
      url.endsWith('.ttf')
    ) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        process.cwd(),
        'apps',
        'client',
        'index.html'
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, 'utf-8');
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      (res as any).status(200).set({ 'Content-Type': 'text/html' }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // ✅ FIX: Handle both local development and production paths
  let distPath: string;

  if (process.env.NODE_ENV === 'production') {
    // Production: /opt/render/project/src/dist/public
    distPath = path.resolve(process.cwd(), 'dist/public');
  } else {
    // Local development: dist/public (from project root)
    distPath = path.resolve(process.cwd(), 'dist/public');
  }

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Add CSP headers for static files too
  app.use((_req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://c.daily.co https://*.daily.co https://replit.com https://*.replit.com https://cdn.jsdelivr.net https://unpkg.com; " +
        "connect-src 'self' https://c.daily.co https://*.daily.co wss://*.daily.co https://api.daily.co https://*.vapi.ai wss://*.vapi.ai https://api.vapi.ai https://demohotel19may25.onrender.com https://minhnhotelben.onrender.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: blob: https://*.daily.co https://unpkg.com; " +
        "media-src 'self' blob: https://*.daily.co; " +
        "frame-src 'self' https://*.daily.co; " +
        "worker-src 'self' blob: data:; " +
        "object-src 'none';"
    );
    next();
  });

  // Serve static assets; cache hashed assets long-term but always revalidate HTML
  app.use(
    express.static(distPath, {
      maxAge: '1y',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
        // Force no-cache for JavaScript and CSS files during debugging
        if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    })
  );

  // fall through to index.html for SPA routing; ensure no-cache of HTML
  // BUT exclude API routes AND asset requests to avoid serving HTML instead of proper files
  app.use('*', (req, res) => {
    const url = req.originalUrl;

    // Don't intercept API routes
    if (url.startsWith('/api/') || url.startsWith('/ws/')) {
      // Enhanced logging for debugging API endpoint issues
      console.warn(`❌ [API] Endpoint not found: ${req.method} ${url}`, {
        host: req.get('host'),
        userAgent: req.get('user-agent'),
        referer: req.get('referer'),
        timestamp: new Date().toISOString(),
      });

      return (res as any).status(404).json({
        error: 'API endpoint not found',
        path: url,
        method: req.method,
        suggestion: 'Ensure your API calls start with /api/ prefix',
      });
    }

    // ✅ FIX: Don't intercept asset requests - let express.static handle them
    if (
      url.startsWith('/assets/') ||
      url.endsWith('.js') ||
      url.endsWith('.css') ||
      url.endsWith('.map') ||
      url.endsWith('.ico') ||
      url.endsWith('.png') ||
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.svg') ||
      url.endsWith('.woff') ||
      url.endsWith('.woff2') ||
      url.endsWith('.ttf')
    ) {
      // Let this fall through to 404 instead of serving index.html
      return (res as any).status(404).send('Asset not found');
    }

    // Serve index.html for SPA routing (HTML pages only)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

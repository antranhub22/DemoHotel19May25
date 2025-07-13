import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server }
  };

  // Add CSP middleware
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://c.daily.co https://*.daily.co; " +
      "connect-src 'self' https://c.daily.co https://*.daily.co wss://*.daily.co https://api.daily.co; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob: https://*.daily.co; " +
      "media-src 'self' blob: https://*.daily.co; " +
      "frame-src 'self' https://*.daily.co; " +
      "worker-src 'self' blob:;"
    );
    next();
  });

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname || process.cwd(),
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname || process.cwd(), "..", "dist/public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Add CSP headers for static files too
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://c.daily.co https://*.daily.co; " +
      "connect-src 'self' https://c.daily.co https://*.daily.co wss://*.daily.co https://api.daily.co; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob: https://*.daily.co; " +
      "media-src 'self' blob: https://*.daily.co; " +
      "frame-src 'self' https://*.daily.co; " +
      "worker-src 'self' blob:;"
    );
    next();
  });

  // Serve static assets; cache hashed assets long-term but always revalidate HTML
  app.use(express.static(distPath, {
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
    }
  }));

  // fall through to index.html for SPA routing; ensure no-cache of HTML
  // BUT exclude API routes to avoid serving HTML instead of JSON
  app.use("*", (req, res) => {
    // Don't intercept API routes
    if (req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/ws/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

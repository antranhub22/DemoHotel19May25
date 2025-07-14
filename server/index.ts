import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupSocket } from './socket';
import { runAutoDbFix } from './startup/auto-database-fix';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Fixed CSP configuration - v1.5 - FORCE REBUILD with embedded database setup
// Force rebuild v1.6 - with authentication routes fix

const app = express();

// Trust proxy for deployment on Render/Heroku/etc
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://replit.com"],
      connectSrc: [
        "'self'", 
        "https://api.openai.com", 
        "https://api.vapi.ai",
        "https://minhonmuine.talk2go.online",
        "https://*.talk2go.online",
        "https://*.onrender.com",
        "https://demohotel19may25.onrender.com",
        "https://minhnhotelben.onrender.com",
        "wss:", 
        "ws:",
        "wss://demohotel19may25.onrender.com",
        "wss://minhnhotelben.onrender.com",
        "ws://localhost:*",
        "wss://localhost:*",
        "http://localhost:*",
        "https://localhost:*"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Enhanced CORS configuration for SaaS dashboard
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, allow subdomains of talk2go.online
    const allowedDomains = [
      'talk2go.online',
      'localhost',
      '127.0.0.1'
    ];
    
    const isAllowed = allowedDomains.some(domain => 
      origin.includes(domain) || origin.endsWith(`.${domain}`)
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-ID'],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining']
}));

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  }
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Strict rate limiting for dashboard routes
const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs for dashboard
  message: 'Too many dashboard requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === 'development';
  }
});

// Apply stricter rate limiting to dashboard routes
app.use('/api/dashboard', dashboardLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  // Setup WebSocket server for real-time notifications and save instance on Express app
  const io = setupSocket(server);
  app.set('io', io);

  // Auto-fix database on startup (can be disabled with AUTO_DB_FIX=false)
  if (process.env.AUTO_DB_FIX !== 'false') {
    console.log('🔧 Running auto database fix...');
    await runAutoDbFix();
  } else {
    console.log('⚠️ Auto database fix disabled by environment variable');
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 10000;
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();

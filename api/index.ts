import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import path from 'path';
import fs from 'fs';
import type { registerRoutes as RegisterRoutesType } from '../server/routes';

let app: express.Application | null = null;
let registerRoutesFn: typeof RegisterRoutesType | null = null;

async function loadRegisterRoutes() {
  if (registerRoutesFn) return registerRoutesFn;

  const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const modulePath = isProd ? '../server-build/server/routes.js' : '../server/routes';

  try {
    const mod = await import(modulePath);
    registerRoutesFn = mod.registerRoutes as typeof RegisterRoutesType;
  } catch (error) {
    console.error(`Failed to load registerRoutes from ${modulePath}`, error);
    throw error;
  }

  return registerRoutesFn!;
}

async function getApp(): Promise<express.Application> {
  if (app) return app;

  const expressApp = express();
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: false }));

  // CORS headers for Vercel - Restrict origins based on environment
  expressApp.use((req, res, next) => {
    // In production, restrict to specific domains
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:5000', 'http://localhost:5173']; // Development defaults
    
    const origin = req.headers.origin;
    
    // Allow requests from allowed origins or same-origin requests
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      // Same-origin requests (no Origin header)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Register API routes FIRST (before static file serving)
  const registerRoutes = await loadRegisterRoutes();
  const httpServer = await registerRoutes(expressApp);

  // Serve static files in production (only for non-API routes)
  // We need to set up static serving but make sure API routes take precedence
  const staticMiddleware = express.static(path.resolve(process.cwd(), "dist", "public"), { fallthrough: true });
  expressApp.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next(); // Skip static serving for API routes
    }
    staticMiddleware(req, res, next);
  });

  // Fallback to index.html for non-API routes (SPA routing)
  expressApp.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next(); // Don't serve index.html for API routes
    }
    const indexPath = path.resolve(process.cwd(), "dist", "public", "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      next();
    }
  });

  // Error handler (must be last)
  expressApp.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error('Express error handler:', err);
    res.status(status).json({ message, error: err.message });
  });

  app = expressApp;
  return app;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const expressApp = await getApp();
    // Vercel passes the full URL path, so we need to handle it correctly
    return expressApp(req as any, res as any);
  } catch (error: any) {
    console.error('Handler error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

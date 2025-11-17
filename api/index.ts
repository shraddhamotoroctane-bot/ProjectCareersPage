import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/vite';

let app: express.Application | null = null;

async function getApp(): Promise<express.Application> {
  if (app) return app;

  const expressApp = express();
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: false }));

  // Register API routes
  const httpServer = await registerRoutes(expressApp);

  // Error handler
  expressApp.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Serve static files in production
  serveStatic(expressApp);

  app = expressApp;
  return app;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const expressApp = await getApp();
  return expressApp(req, res);
}

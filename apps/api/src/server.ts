/**
 * @file server.ts
 * Express application factory.
 */

import express, { type Express } from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api.routes.js';
import { demoRouter } from './routes/demo.routes.js';
import path from 'node:path';

export function createServer(): Express {
  const app = express();

  // Middleware
  app.use(cors({ origin: '*' }));
  app.use(express.json({ limit: '10mb' }));

  // Request logger middleware
  app.use((req, _res, next) => {
    if (process.env['NODE_ENV'] !== 'test') {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Mount API & Demo routes
  app.use('/api', apiRouter);
  app.use('/demo', demoRouter);
  

  // Root welcome & architecture manifest
  app.get('/api/info', (_req, res) => {
    res.json({
      name: 'KAVACH API Gateway',
      prototype: 'SIH 2026',
      team: 'Aurelis',
      version: '0.1.0',
      status: 'ONLINE',
      endpoints: [
        'GET /api/health',
        'GET /api/privacy/status',
        'POST /api/privacy/verify-sample',
        'GET /api/audit/logs',
        'GET /api/audit/proofs',
      ],
    });
  });

  // Production: serve the built React frontend from the same Express server
const webDistPath = path.resolve(process.cwd(), 'apps/web/dist');

app.use(express.static(webDistPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(webDistPath, 'index.html'));
});

  return app;
}

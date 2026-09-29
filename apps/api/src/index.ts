/**
 * @file index.ts
 * API server entry point.
 */

import { createServer } from './server.js';
import { globalAuditLogger } from '@drishti/audit-logger';

const PORT = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3001;
const app = createServer();

const server = app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  DRISHTI // Privacy-Preserving Browser Vision Agent   `);
  console.log(`  Team Aurelis - Smart India Hackathon 2026 Prototype  `);
  console.log(`  API Gateway listening on http://localhost:${PORT}     `);
  console.log(`=======================================================`);

  globalAuditLogger.log({
    category: 'SYSTEM',
    severity: 'INFO',
    message: `Drishti API Server initialized on port ${PORT}`,
    metadata: { port: PORT, env: process.env['NODE_ENV'] ?? 'development' },
  });
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

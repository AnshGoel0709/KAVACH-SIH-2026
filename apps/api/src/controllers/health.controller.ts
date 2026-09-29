/**
 * @file health.controller.ts
 * Health check controller providing system status and component maturity indicators.
 */

import type { Request, Response } from 'express';
import { PrivacyGuard } from '@drishti/privacy-guard';
import { DemoVisionEngine } from '@drishti/vision-engine';
import { globalAuditLogger } from '@drishti/audit-logger';

export function getHealthStatus(_req: Request, res: Response): void {
  const uptimeSeconds = Math.floor(process.uptime());

  res.status(200).json({
    status: 'HEALTHY',
    project: 'Drishti',
    subtitle: 'Privacy-Preserving Browser Vision Agent',
    team: 'Team Aurelis (Smart India Hackathon 2026)',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
    },
    modules: {
      core: {
        name: '@drishti/core',
        status: 'REAL',
        description: 'Type-safe privacy boundary contracts, branded types, and domain models',
        version: '0.1.0',
      },
      privacyGuard: {
        name: '@drishti/privacy-guard',
        status: 'REAL',
        description: 'Sensitive data detector and redaction engine with cryptographic digests',
        version: PrivacyGuard.VERSION,
      },
      auditLogger: {
        name: '@drishti/audit-logger',
        status: 'REAL',
        description: 'Append-only tamper-evident event log and privacy proof ledger',
        eventCount: globalAuditLogger.getEventCount(),
      },
      visionEngine: {
        name: '@drishti/vision-engine',
        status: 'SIMULATED',
        description: 'DemoVisionEngine enforcing SanitizedFrame consumption before VLM integration',
        engineId: new DemoVisionEngine().engineId,
      },
      browserAgent: {
        name: 'services/browser-agent',
        status: 'PLANNED',
        description: 'Playwright headless/headed browser session controller and screenshot capture',
      },
      taskPlanner: {
        name: 'services/task-planner',
        status: 'PLANNED',
        description: 'Autonomous goal decomposition, action sequencing, and verification engine',
      },
    },
  });
}

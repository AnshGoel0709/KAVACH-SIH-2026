/**
 * @file audit.controller.ts
 * Endpoints for retrieving tamper-evident audit logs and privacy proof records.
 */

import type { Request, Response } from 'express';
import { globalAuditLogger } from '@drishti/audit-logger';

export function getAuditLogs(req: Request, res: Response): void {
  const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 50;
  const events = globalAuditLogger.getEvents(limit);

  res.status(200).json({
    totalCount: globalAuditLogger.getEventCount(),
    returnedCount: events.length,
    events,
  });
}

export function getPrivacyProofs(_req: Request, res: Response): void {
  const proofs = globalAuditLogger.getAllProofs();
  res.status(200).json({
    count: proofs.length,
    proofs,
  });
}

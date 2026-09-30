/**
 * @file api.routes.ts
 * Main API route definitions for Drishti backend.
 */

import { Router } from 'express';
import { getHealthStatus } from '../controllers/health.controller.js';
import { getPrivacyStatus, verifySample } from '../controllers/privacy.controller.js';
import { getAuditLogs, getPrivacyProofs } from '../controllers/audit.controller.js';
import { getAgentState, runAgentTask, resetAgentState } from '../controllers/agent.controller.js';

export const apiRouter = Router();

// System Health & Component Status
apiRouter.get('/health', getHealthStatus);

// Browser Agent Control & State
apiRouter.get('/agent/state', getAgentState);
apiRouter.post('/agent/run', runAgentTask);
apiRouter.post('/agent/reset', resetAgentState);

// Privacy Guard
apiRouter.get('/privacy/status', getPrivacyStatus);
apiRouter.post('/privacy/verify-sample', verifySample);

// Audit & Verification Ledger
apiRouter.get('/audit/logs', getAuditLogs);
apiRouter.get('/audit/proofs', getPrivacyProofs);

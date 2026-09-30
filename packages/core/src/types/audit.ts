/**
 * @file audit.ts
 * Types for tamper-evident audit logging and privacy proof verification.
 */

import type { SensitiveCategory, EntityPolicyRecord } from './privacy.js';

export type AuditSeverity = 'DEBUG' | 'INFO' | 'WARNING' | 'CRITICAL' | 'SECURITY';

export type AuditCategory =
  | 'PRIVACY_GUARD'
  | 'VISION_ENGINE'
  | 'BROWSER_AGENT'
  | 'TASK_PLANNER'
  | 'SECURITY_BOUNDARY'
  | 'SYSTEM';

export interface AuditEvent {
  readonly eventId: string;
  readonly timestamp: number;
  readonly severity: AuditSeverity;
  readonly category: AuditCategory;
  readonly message: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  /** SHA-256 chain hash for tamper-evident event ordering */
  readonly eventHash: string;
}

export interface PrivacyProofRecord {
  readonly proofId: string;
  readonly frameId: string;
  readonly timestamp: number;
  readonly rawFrameDigest: string;
  readonly sanitizedDigest: string;
  readonly sensitiveRegionsDetectedCount: number;
  readonly sensitiveCategoriesFound: readonly SensitiveCategory[];
  readonly redactionsAppliedCount: number;
  readonly allowedByPolicyCount?: number;
  readonly preservedNonSensitiveCount?: number;
  readonly consentStatus?: 'NOT_REQUIRED' | 'APPROVED' | 'DENIED';
  readonly policyDecisionSummary?: string;
  readonly policyBreakdown?: readonly EntityPolicyRecord[];
  readonly isRedactionComplete: boolean;
  readonly directRawFrameToAiBlocked: true; // Invariant proof
  readonly processingLatencyMs: number;
}

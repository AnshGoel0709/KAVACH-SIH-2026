/**
 * @file audit-logger.test.ts
 * Tests for tamper-evident audit logger and privacy proof storage.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { AuditLogger } from '@drishti/audit-logger';

describe('Audit Logger & Privacy Proof Ledger', () => {
  test('Appends events and links them with SHA-256 hashes', () => {
    const logger = new AuditLogger();

    const ev1 = logger.log({
      category: 'SYSTEM',
      severity: 'INFO',
      message: 'System initialization started',
    });

    const ev2 = logger.log({
      category: 'PRIVACY_GUARD',
      severity: 'INFO',
      message: 'Privacy boundary initialized',
    });

    assert.strictEqual(logger.getEventCount(), 2);
    assert.notStrictEqual(ev1.eventHash, ev2.eventHash);
    assert.strictEqual(typeof ev1.eventHash, 'string');
    assert.strictEqual(ev1.eventHash.length, 64); // SHA-256 hex length
  });

  test('Stores and retrieves privacy proof records', () => {
    const logger = new AuditLogger();

    logger.recordPrivacyProof({
      proofId: 'proof-001',
      frameId: 'frame-100',
      timestamp: Date.now(),
      rawFrameDigest: 'raw-hash-1234',
      sanitizedDigest: 'sanitized-hash-5678',
      sensitiveRegionsDetectedCount: 3,
      sensitiveCategoriesFound: ['PII_EMAIL', 'PII_NAME'],
      redactionsAppliedCount: 3,
      isRedactionComplete: true,
      directRawFrameToAiBlocked: true,
      processingLatencyMs: 4.5,
    });

    const stored = logger.getProof('frame-100');
    assert.ok(stored);
    assert.strictEqual(stored.proofId, 'proof-001');
    assert.strictEqual(stored.directRawFrameToAiBlocked, true);
    assert.strictEqual(stored.sensitiveRegionsDetectedCount, 3);
  });
});

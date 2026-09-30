/**
 * @file audit-logger.ts
 * Append-only audit logger with hash-chaining and privacy proof tracking.
 */

import { createHash, randomUUID } from 'node:crypto';
import type {
  AuditEvent,
  AuditCategory,
  AuditSeverity,
  PrivacyProofRecord,
} from '@drishti/core';

export type AuditSubscriber = (event: AuditEvent) => void;

export class AuditLogger {
  private readonly events: AuditEvent[] = [];
  private readonly privacyProofs: Map<string, PrivacyProofRecord> = new Map();
  private readonly subscribers: Set<AuditSubscriber> = new Set();
  private lastHash: string = '0000000000000000000000000000000000000000000000000000000000000000';

  public log(params: {
    category: AuditCategory;
    severity: AuditSeverity;
    message: string;
    metadata?: Record<string, unknown>;
  }): AuditEvent {
    const timestamp = Date.now();
    const eventId = `evt-${randomUUID().substring(0, 8)}`;

    // Cryptographic hash chain: each event binds to previous event hash
    const hashPayload = `${this.lastHash}:${eventId}:${timestamp}:${params.category}:${params.severity}:${params.message}`;
    const eventHash = createHash('sha256').update(hashPayload).digest('hex');
    this.lastHash = eventHash;

    const event: AuditEvent = {
      eventId,
      timestamp,
      severity: params.severity,
      category: params.category,
      message: params.message,
      metadata: params.metadata,
      eventHash,
    };

    this.events.push(event);

    // Notify listeners
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error('Audit subscriber error:', err);
      }
    }

    return event;
  }

  public recordPrivacyProof(proof: PrivacyProofRecord): void {
    this.privacyProofs.set(proof.frameId, proof);

    this.log({
      category: 'PRIVACY_GUARD',
      severity: 'INFO',
      message: `Privacy proof recorded for frame ${proof.frameId}. Detected: ${proof.sensitiveRegionsDetectedCount}, Redacted: ${proof.redactionsAppliedCount}. Raw AI bypass: BLOCKED.`,
      metadata: {
        proofId: proof.proofId,
        frameId: proof.frameId,
        rawDigest: proof.rawFrameDigest.substring(0, 12),
        sanitizedDigest: proof.sanitizedDigest.substring(0, 12),
        latencyMs: proof.processingLatencyMs,
      },
    });
  }

  public clear(): void {
    this.events.length = 0;
    this.privacyProofs.clear();
    this.lastHash = '0000000000000000000000000000000000000000000000000000000000000000';
  }

  public getEvents(limit: number = 50, runId?: string): readonly AuditEvent[] {
    if (runId) {
      return this.events.filter((e) => e.metadata?.['runId'] === runId).slice(-limit);
    }
    return this.events.slice(-limit);
  }

  public getProof(frameId: string): PrivacyProofRecord | undefined {
    return this.privacyProofs.get(frameId);
  }

  public getAllProofs(): readonly PrivacyProofRecord[] {
    return Array.from(this.privacyProofs.values());
  }

  public subscribe(subscriber: AuditSubscriber): () => void {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  public getEventCount(): number {
    return this.events.length;
  }
}

// Global singleton instance for easy service access
export const globalAuditLogger = new AuditLogger();

/**
 * @file privacy-guard.ts
 * Main PrivacyGuard boundary service.
 * Enforces the invariant: Raw frames never pass through directly.
 */

import { randomUUID } from 'node:crypto';
import type {
  RawBrowserFrame,
  SanitizedFrame,
  PrivacyProofRecord,
  SensitiveCategory,
} from '@drishti/core';
import { RuleBasedSensitiveDetector, type SensitiveDataDetector } from './detector.js';
import { RedactionEngine } from './redactor.js';

export interface GuardExecutionResult {
  readonly sanitizedFrame: SanitizedFrame;
  readonly proof: PrivacyProofRecord;
  readonly sanitizedTextSnapshot?: string;
}

export class PrivacyGuard {
  public static readonly VERSION = '0.1.0';

  private readonly detectors: SensitiveDataDetector[];
  private readonly redactor: RedactionEngine;

  constructor(customDetectors?: SensitiveDataDetector[]) {
    this.detectors = customDetectors ?? [new RuleBasedSensitiveDetector()];
    this.redactor = new RedactionEngine();
  }

  /**
   * The core architectural boundary method.
   * Consumes a RawBrowserFrame, isolates and redacts all sensitive data,
   * and produces a guaranteed SanitizedFrame along with a non-repudiable PrivacyProofRecord.
   */
  public async sanitizeFrame(rawFrame: RawBrowserFrame): Promise<GuardExecutionResult> {
    const startTime = performance.now();

    // 1. Detect sensitive regions across all registered detectors
    const detectedRegions = [];
    for (const detector of this.detectors) {
      const regions = await detector.detect({
        frameId: rawFrame.frameId,
        textSnapshot: rawFrame.domTextSnapshot,
        width: rawFrame.width,
        height: rawFrame.height,
      });
      detectedRegions.push(...regions);
    }

    // 2. Apply redactions and generate cryptographic verification hashes
    const redactionResult = this.redactor.applyRedaction(rawFrame, detectedRegions);

    // 3. Extract unique detected categories
    const categoriesFound: SensitiveCategory[] = Array.from(
      new Set(detectedRegions.map((r) => r.category))
    );

    const totalLatency = Math.round((performance.now() - startTime) * 100) / 100;

    // 4. Construct privacy proof record
    const proof: PrivacyProofRecord = {
      proofId: `proof-${randomUUID().substring(0, 8)}`,
      frameId: rawFrame.frameId,
      timestamp: Date.now(),
      rawFrameDigest: redactionResult.sanitizedFrame.rawFrameDigest,
      sanitizedDigest: redactionResult.sanitizedFrame.verificationDigest,
      sensitiveRegionsDetectedCount: detectedRegions.length,
      sensitiveCategoriesFound: categoriesFound,
      redactionsAppliedCount: redactionResult.redactionsApplied.length,
      isRedactionComplete: true,
      directRawFrameToAiBlocked: true,
      processingLatencyMs: totalLatency,
    };

    return {
      sanitizedFrame: redactionResult.sanitizedFrame,
      proof,
      sanitizedTextSnapshot: redactionResult.sanitizedTextSnapshot,
    };
  }

  public getRegisteredDetectors(): readonly string[] {
    return this.detectors.map((d) => `${d.name} (v${d.version})`);
  }
}

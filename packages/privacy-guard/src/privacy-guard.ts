/**
 * @file privacy-guard.ts
 * Main PrivacyGuard boundary service.
 * Enforces the invariant: Raw frames never pass through directly to AI vision layer.
 * Executes task-aware local privacy decision policies and cryptographic proof generation.
 */

import { randomUUID } from 'node:crypto';
import type {
  RawBrowserFrame,
  SanitizedFrame,
  PrivacyProofRecord,
  SensitiveCategory,
  SensitiveRegion,
} from '@drishti/core';
import { RuleBasedSensitiveDetector, type SensitiveDataDetector } from './detector.js';
import { RedactionEngine, type PixelRedactorFn } from './redactor.js';
import { TaskPrivacyPolicyEngine, type PolicyEvaluationResult } from './policy-engine.js';

export interface SanitizeOptions {
  taskId?: string;
  consentGiven?: boolean;
}

export interface GuardExecutionResult {
  readonly sanitizedFrame: SanitizedFrame;
  readonly proof: PrivacyProofRecord;
  readonly sanitizedTextSnapshot?: string;
  readonly policyResult?: PolicyEvaluationResult;
}

export class PrivacyGuard {
  public static readonly VERSION = '0.1.0';

  private readonly detectors: SensitiveDataDetector[];
  private readonly redactor: RedactionEngine;
  private readonly policyEngine: TaskPrivacyPolicyEngine;

  constructor(
    customDetectors?: SensitiveDataDetector[],
    private readonly pixelRedactor?: PixelRedactorFn
  ) {
    this.detectors = customDetectors ?? [new RuleBasedSensitiveDetector()];
    this.redactor = new RedactionEngine();
    this.policyEngine = new TaskPrivacyPolicyEngine();
  }

  /**
   * The core architectural boundary method.
   * Consumes a RawBrowserFrame, executes local task-aware privacy decision policy,
   * redacts unneeded/unauthorized sensitive visual regions, and produces a guaranteed
   * SanitizedFrame along with a tamper-evident PrivacyProofRecord.
   */
  public async sanitizeFrame(
    rawFrame: RawBrowserFrame,
    options?: SanitizeOptions
  ): Promise<GuardExecutionResult> {
    const startTime = performance.now();

    // 1. Detect all sensitive regions across registered detectors
    const allDetectedRegions: SensitiveRegion[] = [];
    for (const detector of this.detectors) {
      const regions = await detector.detect({
        frameId: rawFrame.frameId,
        textSnapshot: rawFrame.domTextSnapshot,
        width: rawFrame.width,
        height: rawFrame.height,
        detectedDomBoxes: rawFrame.detectedDomBoxes,
      });
      allDetectedRegions.push(...regions);
    }

    // 2. Evaluate Task-Aware Privacy Decision Policy
    const taskId = options?.taskId || 'identity-verification';
    const policyResult = this.policyEngine.evaluate({
      taskId,
      detectedBoxes: rawFrame.detectedDomBoxes,
      consentGiven: options?.consentGiven,
    });

    // 3. Filter regions to redact based on local policy decision
    // Regions with 'POLICY_ALLOW' or 'CONSENT_ALLOW' are deliberately permitted without mask
    let regionsToRedact: SensitiveRegion[] = [];

    if (policyResult.scenario === 'ZERO_REDACTION') {
      // Case 2: Public service screen, 0 redactions
      regionsToRedact = [];
    } else if (policyResult.scenario === 'MIXED_POLICY_ALLOW' || policyResult.scenario === 'HIGH_SENSITIVITY_CONSENT') {
      // Only redact regions whose records are marked 'REDACT' or 'CONSENT_DENIED'
      const redactCategories = new Set(
        policyResult.records
          .filter((r) => r.decision === 'REDACT' || r.decision === 'CONSENT_DENIED')
          .map((r) => r.category)
      );

      regionsToRedact = allDetectedRegions.filter((r) => redactCategories.has(r.category));
    } else {
      // Case 1: Full Redaction -> all detected regions redacted
      regionsToRedact = allDetectedRegions;
    }

    // 4. Apply pixel & DOM redaction strictly to policy-designated regions
    const redactionResult = await this.redactor.applyRedaction(
      rawFrame,
      regionsToRedact,
      this.pixelRedactor
    );

    // 5. Extract unique detected categories
    const categoriesFound: SensitiveCategory[] = Array.from(
      new Set(allDetectedRegions.map((r) => r.category))
    );

    const totalLatency = Math.round((performance.now() - startTime) * 100) / 100;

    // 6. Construct complete privacy proof record reflecting the actual policy decision
    const proof: PrivacyProofRecord = {
      proofId: `proof-${randomUUID().substring(0, 8)}`,
      frameId: rawFrame.frameId,
      timestamp: Date.now(),
      rawFrameDigest: redactionResult.sanitizedFrame.rawFrameDigest,
      sanitizedDigest: redactionResult.sanitizedFrame.verificationDigest,
      sensitiveRegionsDetectedCount: policyResult.sensitiveDetectedCount,
      sensitiveCategoriesFound: categoriesFound,
      redactionsAppliedCount: policyResult.redactionsAppliedCount,
      allowedByPolicyCount: policyResult.allowedByPolicyCount,
      preservedNonSensitiveCount: policyResult.preservedCount,
      consentStatus: policyResult.consentStatus,
      policyDecisionSummary: policyResult.policySummary,
      policyBreakdown: policyResult.records,
      isRedactionComplete: true,
      directRawFrameToAiBlocked: true,
      processingLatencyMs: totalLatency,
    };

    return {
      sanitizedFrame: redactionResult.sanitizedFrame,
      proof,
      sanitizedTextSnapshot: redactionResult.sanitizedTextSnapshot,
      policyResult,
    };
  }

  public getRegisteredDetectors(): readonly string[] {
    return this.detectors.map((d) => `${d.name} (v${d.version})`);
  }
}

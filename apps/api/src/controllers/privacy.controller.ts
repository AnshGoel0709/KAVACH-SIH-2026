/**
 * @file privacy.controller.ts
 * Privacy Guard inspection and live synthetic verification test controller.
 */

import type { Request, Response } from 'express';
import { createRawBrowserFrame } from '@drishti/core';
import { PrivacyGuard } from '@drishti/privacy-guard';
import { DemoVisionEngine } from '@drishti/vision-engine';
import { globalAuditLogger } from '@drishti/audit-logger';

const privacyGuard = new PrivacyGuard();
const demoVisionEngine = new DemoVisionEngine();

export function getPrivacyStatus(_req: Request, res: Response): void {
  res.status(200).json({
    engine: 'Drishti Privacy Guard',
    version: PrivacyGuard.VERSION,
    status: 'ACTIVE',
    registeredDetectors: privacyGuard.getRegisteredDetectors(),
    boundaryInvariant: 'Raw browser frames are strictly quarantined and never exposed to vision reasoning.',
    redactionMethodsSupported: ['SOLID_MASK', 'SYNTHETIC_TOKEN', 'BLUR'],
  });
}

/**
 * Executes a live verification cycle on synthetic test data.
 * Demonstrates the full sequence:
 * RAW FRAME -> PRIVACY GUARD -> REDACTION -> SANITIZED FRAME -> DEMO VISION ENGINE -> AUDIT PROOF
 */
export async function verifySample(req: Request, res: Response): Promise<void> {
  const { sampleText, customGoal } = req.body || {};

  // Standard SIH test benchmark if not provided
  const benchmarkText =
    sampleText ||
    `User Profile Verification Form:
Name: AURELIS_TEST_NAME
Email: test@example.local
Phone: +91 9000000000
Identifier: AURELIS-ID-12345
Session Note: Internal authorization test token`;

  const frameId = `frame-test-${Date.now().toString(36)}`;

  // 1. Create simulated raw browser frame
  const rawFrame = createRawBrowserFrame({
    frameId,
    imageBase64: Buffer.from(`RAW_PIXELS_CONTAINING:[${benchmarkText}]`).toString('base64'),
    width: 1280,
    height: 800,
    sourceUrl: 'https://test.local/aurelis-privacy-benchmark',
    domTextSnapshot: benchmarkText,
  });

  // 2. Pass frame through Privacy Guard
  const guardResult = await privacyGuard.sanitizeFrame(rawFrame);

  // 3. Record proof in tamper-evident audit logger
  globalAuditLogger.recordPrivacyProof(guardResult.proof);

  // 4. Pass ONLY the sanitized frame to the vision engine
  const visionGoal = {
    goal: customGoal || 'Locate the verification submit button and proceed',
  };

  const visionResult = await demoVisionEngine.processSanitizedFrame(
    guardResult.sanitizedFrame,
    visionGoal
  );

  // 5. Verification checks: confirm raw PII never reached the vision engine
  const containsRawName = visionResult.visualSummary.includes('AURELIS_TEST_NAME');
  const containsRawId = visionResult.visualSummary.includes('AURELIS-ID-12345');
  const containsRawEmail = visionResult.visualSummary.includes('test@example.local');
  const leakDetected = containsRawName || containsRawId || containsRawEmail;

  res.status(200).json({
    success: true,
    benchmarkVerified: !leakDetected,
    proofOfPrivacy: {
      proofId: guardResult.proof.proofId,
      frameId: guardResult.proof.frameId,
      rawFrameDigest: guardResult.proof.rawFrameDigest,
      sanitizedDigest: guardResult.proof.sanitizedDigest,
      sensitiveRegionsDetected: guardResult.proof.sensitiveRegionsDetectedCount,
      sensitiveCategoriesFound: guardResult.proof.sensitiveCategoriesFound,
      redactionsAppliedCount: guardResult.proof.redactionsAppliedCount,
      directRawFrameToAiBlocked: guardResult.proof.directRawFrameToAiBlocked,
      processingLatencyMs: guardResult.proof.processingLatencyMs,
    },
    rawInputSnapshot: rawFrame.domTextSnapshot,
    sanitizedTextSnapshot: guardResult.sanitizedTextSnapshot,
    sanitizedFramePayload: {
      frameId: guardResult.sanitizedFrame.frameId,
      verificationDigest: guardResult.sanitizedFrame.verificationDigest,
      redactionsCount: guardResult.sanitizedFrame.redactionsApplied.length,
      redactionsApplied: guardResult.sanitizedFrame.redactionsApplied,
    },
    visionEngineResponse: {
      engineId: visionResult.engineId,
      isSimulated: visionResult.isSimulated,
      visualSummary: visionResult.visualSummary,
      recommendedAction: visionResult.recommendedAction,
      rawFrameBypassed: visionResult.rawFrameBypassed,
    },
  });
}

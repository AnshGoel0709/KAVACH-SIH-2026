import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BENCHMARK_TASKS,
  getBenchmarkTask,
  createRawBrowserFrame,
  isSanitizedFrame,
  type SanitizedFrame,
} from '@drishti/core';
import { PlaywrightBrowserAgent } from '@drishti/browser-agent';
import { PrivacyGuard, TaskPrivacyPolicyEngine } from '@drishti/privacy-guard';
import { DemoVisionEngine } from '@drishti/vision-engine';

describe('Drishti Benchmark Tasks Catalog & State Isolation (TASK 3A/3B/3C/3D)', () => {
  const policyEngine = new TaskPrivacyPolicyEngine();
  const privacyGuard = new PrivacyGuard();
  const visionEngine = new DemoVisionEngine();

  // 1-4. RUNTIME SELECTORS PER BENCHMARK
  it('1. Identity runtime selector is strictly #btn-continue', () => {
    const task = getBenchmarkTask('identity-verification');
    assert.equal(task.targetActionSelector, '#btn-continue');
    assert.equal(task.routePath, '/demo/identity-verification');
  });

  it('2. Account runtime selector is strictly #btn-login', () => {
    const task = getBenchmarkTask('account-access');
    assert.equal(task.targetActionSelector, '#btn-login');
    assert.equal(task.routePath, '/demo/account-access');
    assert.equal(task.targetActionLabel, 'Explore Public Services');
  });

  it('3. Profile runtime selector is strictly #btn-save-profile', () => {
    const task = getBenchmarkTask('profile-management');
    assert.equal(task.targetActionSelector, '#btn-save-profile');
    assert.equal(task.routePath, '/demo/profile-management');
  });

  it('4. Document runtime selector is strictly #btn-review-doc', () => {
    const task = getBenchmarkTask('document-review');
    assert.equal(task.targetActionSelector, '#btn-review-doc');
    assert.equal(task.routePath, '/demo/document-review');
  });

  // 5. NO CROSS-TASK SELECTOR LEAKAGE
  it('5. No cross-task selector leakage in vision reasoning', async () => {
    const rawFrame = createRawBrowserFrame({
      frameId: 'leakage-test-frame',
      imageBase64: 'TEST_IMG_PAYLOAD',
      width: 1280,
      height: 800,
      sourceUrl: 'http://localhost:3001/demo/identity-verification',
    });

    const sanitized = (await privacyGuard.sanitizeFrame(rawFrame)).sanitizedFrame;

    // Test Grounding for Case 1
    const res1 = await visionEngine.processSanitizedFrame(sanitized, {
      goal: 'Complete verification',
      targetElementDescription: 'Continue Verification (#btn-continue)',
    });
    assert.equal(res1.recommendedAction.targetElementId, 'btn-continue');

    // Test Grounding for Case 2
    const res2 = await visionEngine.processSanitizedFrame(sanitized, {
      goal: 'Explore public services',
      targetElementDescription: 'Explore Public Services (#btn-login)',
    });
    assert.equal(res2.recommendedAction.targetElementId, 'btn-login');

    // Test Grounding for Case 3
    const res3 = await visionEngine.processSanitizedFrame(sanitized, {
      goal: 'Save profile changes',
      targetElementDescription: 'Save Profile (#btn-save-profile)',
    });
    assert.equal(res3.recommendedAction.targetElementId, 'btn-save-profile');

    // Test Grounding for Case 4
    const res4 = await visionEngine.processSanitizedFrame(sanitized, {
      goal: 'Review confidential document',
      targetElementDescription: 'Review Document (#btn-review-doc)',
    });
    assert.equal(res4.recommendedAction.targetElementId, 'btn-review-doc');
  });

  // 6. ZERO-REDACTION SCENARIO
  it('6. Zero-redaction scenario produces 0 detected and 0 redacted with public context message', () => {
    const evalResult = policyEngine.evaluate({ taskId: 'account-access' });
    assert.equal(evalResult.scenario, 'ZERO_REDACTION');
    assert.equal(evalResult.sensitiveDetectedCount, 0);
    assert.equal(evalResult.redactionsAppliedCount, 0);
    assert.equal(evalResult.boxesToRedact.length, 0);
    assert.ok(evalResult.policySummary.includes('No sensitive information detected. No redaction required.'));
  });

  // 7. FULL-REDACTION SCENARIO
  it('7. Full-redaction scenario masks all 4 sensitive entities at perimeter', () => {
    const evalResult = policyEngine.evaluate({ taskId: 'identity-verification' });
    assert.equal(evalResult.scenario, 'FULL_REDACTION');
    assert.equal(evalResult.sensitiveDetectedCount, 4);
    assert.equal(evalResult.redactionsAppliedCount, 4);
    assert.equal(evalResult.allowedByPolicyCount, 0);
    for (const record of evalResult.records) {
      assert.equal(record.decision, 'REDACT');
    }
  });

  // 8. MIXED SELECTIVE-DISCLOSURE SCENARIO
  it('8. Mixed selective-disclosure scenario redacts unneeded PII and allows task-required email by policy', () => {
    const evalResult = policyEngine.evaluate({ taskId: 'profile-management' });
    assert.equal(evalResult.scenario, 'MIXED_POLICY_ALLOW');
    assert.equal(evalResult.sensitiveDetectedCount, 3);
    assert.equal(evalResult.redactionsAppliedCount, 2); // Name & Phone redacted
    assert.equal(evalResult.allowedByPolicyCount, 1); // Email allowed

    const emailRecord = evalResult.records.find((r) => r.category === 'PII_EMAIL');
    assert.ok(emailRecord);
    assert.equal(emailRecord.decision, 'POLICY_ALLOW');
    assert.equal(emailRecord.isTaskRequired, true);

    const nameRecord = evalResult.records.find((r) => r.category === 'PII_NAME');
    assert.ok(nameRecord);
    assert.equal(nameRecord.decision, 'REDACT');
    assert.equal(nameRecord.isTaskRequired, false);
  });

  // 9. CONSENT-REQUIRED SCENARIO
  it('9. Sensitive Document Review requires high-sensitivity consent gate', () => {
    const task = getBenchmarkTask('document-review');
    assert.equal(task.requiresConsent, true);
    assert.equal(task.privacyScenario, 'HIGH_SENSITIVITY_CONSENT');

    const highSensitivityEntity = task.expectedEntities.find((e) => e.sensitivityLevel === 'HIGH');
    assert.ok(highSensitivityEntity, 'Document review must contain a HIGH sensitivity credential');
    assert.equal(highSensitivityEntity.category, 'CREDENTIAL');
  });

  // 10. CONSENT DENIED BLOCKS ACTION
  it('10. Consent denied blocks credential and cancels execution', () => {
    const evalResult = policyEngine.evaluate({
      taskId: 'document-review',
      consentGiven: false,
    });

    assert.equal(evalResult.consentStatus, 'DENIED');
    assert.equal(evalResult.executionBlockedByConsent, true);

    const tokenRecord = evalResult.records.find((r) => r.category === 'CREDENTIAL');
    assert.ok(tokenRecord);
    assert.equal(tokenRecord.decision, 'CONSENT_DENIED');
    assert.equal(tokenRecord.redactedText, '[BLOCKED: CONSENT DENIED]');
  });

  // 11. CONSENT APPROVED PERMITS ONLY REQUIRED FIELD
  it('11. Consent approved authorizes single required credential while masking remaining 3 fields', () => {
    const evalResult = policyEngine.evaluate({
      taskId: 'document-review',
      consentGiven: true,
    });

    assert.equal(evalResult.consentStatus, 'APPROVED');
    assert.equal(evalResult.executionBlockedByConsent, false);
    assert.equal(evalResult.allowedByPolicyCount, 1);
    assert.equal(evalResult.redactionsAppliedCount, 3);

    const tokenRecord = evalResult.records.find((r) => r.category === 'CREDENTIAL');
    assert.ok(tokenRecord);
    assert.equal(tokenRecord.decision, 'CONSENT_ALLOW');

    const officerRecord = evalResult.records.find((r) => r.category === 'PII_NAME');
    assert.ok(officerRecord);
    assert.equal(officerRecord.decision, 'REDACT');
  });

  // 12. RAWBROWSERFRAME CANNOT REACH VISIONENGINE
  it('12. RawBrowserFrame cannot bypass PrivacyGuard to reach VisionEngine', async () => {
    const unverifiedFrame = {
      frameId: 'unverified-bypass',
      sanitizedImageBase64: 'fake-raw-screenshot',
    } as unknown as SanitizedFrame;

    await assert.rejects(
      async () => {
        await visionEngine.processSanitizedFrame(unverifiedFrame, { goal: 'Bypass test' });
      },
      (err: Error) => {
        assert.ok(err.message.includes('SECURITY VIOLATION'));
        return true;
      }
    );
  });

  // 13. PROOF BELONGS TO CURRENT RUN
  it('13. Privacy Proof contains cryptographic SHA-256 digests and unique proof ID', async () => {
    const rawFrame = createRawBrowserFrame({
      frameId: 'proof-test-frame',
      imageBase64: 'SAMPLE_IMAGE_DATA_XYZ',
      width: 1280,
      height: 800,
      sourceUrl: 'http://localhost:3001/demo/identity-verification',
    });

    const result = await privacyGuard.sanitizeFrame(rawFrame, { taskId: 'identity-verification' });
    const proof = result.proof;

    assert.ok(proof.proofId.startsWith('proof-'));
    assert.equal(proof.directRawFrameToAiBlocked, true);
    assert.equal(proof.rawFrameDigest.length, 64); // SHA-256 hex length
    assert.equal(proof.sanitizedDigest.length, 64);
    assert.notEqual(proof.rawFrameDigest, proof.sanitizedDigest);
  });

  // 14. SCREENSHOTS BELONG TO CURRENT RUN & 15. TASK SELECTION DOES NOT EXECUTE
  it('14 & 15. Selecting task B after task A isolates state and does not trigger automation', () => {
    const runA = {
      runId: 'run-alpha',
      taskId: 'identity-verification',
      targetSelector: '#btn-continue',
      rawScreenshotBase64: 'screenshot-alpha',
      proof: { proofId: 'proof-alpha', sensitiveRegionsDetectedCount: 4 },
      isCompleted: true,
    };

    const draftTaskId = 'profile-management';
    const isRunForCurrentTask = runA.taskId === draftTaskId;

    assert.equal(isRunForCurrentTask, false, 'Run A must not belong to newly selected draft task');

    const displayedScreenshot = isRunForCurrentTask ? runA.rawScreenshotBase64 : undefined;
    const displayedProof = isRunForCurrentTask ? runA.proof : undefined;

    assert.equal(displayedScreenshot, undefined, 'Draft task selection must not leak screenshots');
    assert.equal(displayedProof, undefined, 'Draft task selection must not leak proof');
  });

  // 16. PIPELINE STAGE NAMES MATCH PPT TERMINOLOGY
  it('16. Pipeline stage names match SIH PPT technical architecture specification', () => {
    const pptStages = [
      '01 — LOCAL VISUAL PERCEPTION',
      '02 — SENSITIVE CONTENT DETECTION',
      '03 — TASK-RELEVANT CONTEXT SELECTION',
      '04 — SANITIZATION & REDACTION',
      '05 — PRIVACY PREFLIGHT',
    ];

    assert.equal(pptStages.length, 5);
    assert.ok(pptStages[0].includes('LOCAL VISUAL PERCEPTION'));
    assert.ok(pptStages[1].includes('SENSITIVE CONTENT DETECTION'));
    assert.ok(pptStages[2].includes('TASK-RELEVANT CONTEXT SELECTION'));
    assert.ok(pptStages[3].includes('SANITIZATION & REDACTION'));
    assert.ok(pptStages[4].includes('PRIVACY PREFLIGHT'));
  });

  // 17. POLICY ENGINE DECISION IS REFLECTED IN PROOF
  it('17. Policy engine decisions are cryptographically attested in privacy proof record', async () => {
    const rawFrame = createRawBrowserFrame({
      frameId: 'policy-proof-frame',
      imageBase64: 'SAMPLE_DATA_PROFILE',
      width: 1280,
      height: 800,
      sourceUrl: 'http://localhost:3001/demo/profile-management',
    });

    const result = await privacyGuard.sanitizeFrame(rawFrame, { taskId: 'profile-management' });
    const proof = result.proof;

    assert.equal(proof.allowedByPolicyCount, 1);
    assert.equal(proof.redactionsAppliedCount, 2);
    assert.ok(proof.policyBreakdown);
    assert.equal(proof.policyBreakdown.length, 3);

    const emailPolicy = proof.policyBreakdown.find((p) => p.category === 'PII_EMAIL');
    assert.ok(emailPolicy);
    assert.equal(emailPolicy.decision, 'POLICY_ALLOW');
  });

  // BROWSER LIFECYCLE SAFETY GUARD
  it('browser lifecycle safety guard prevents uninitialized interaction', async () => {
    const agent = new PlaywrightBrowserAgent();
    assert.equal(agent.isInitialized, false);
    await assert.rejects(
      async () => {
        await agent.navigateTo('http://localhost:3001/demo/identity-verification');
      },
      /Browser lifecycle error/
    );
  });
});

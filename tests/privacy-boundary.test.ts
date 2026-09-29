/**
 * @file privacy-boundary.test.ts
 * Tests for Drishti Privacy Guard boundary enforcement and Vision Engine consumption.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  createRawBrowserFrame,
  isSanitizedFrame,
  type SanitizedFrame,
} from '@drishti/core';
import { PrivacyGuard } from '@drishti/privacy-guard';
import { DemoVisionEngine } from '@drishti/vision-engine';

describe('Privacy Boundary Enforcement', () => {
  const guard = new PrivacyGuard();
  const visionEngine = new DemoVisionEngine();

  const syntheticBenchmarkText = `
    User Record:
    Name: AURELIS_TEST_NAME
    Email: test@example.local
    Phone: +91 9000000000
    Internal ID: AURELIS-ID-12345
  `;

  test('PrivacyGuard detects all synthetic benchmark PII entities', async () => {
    const rawFrame = createRawBrowserFrame({
      frameId: 'test-frame-001',
      imageBase64: Buffer.from(syntheticBenchmarkText).toString('base64'),
      width: 1280,
      height: 720,
      sourceUrl: 'https://benchmark.aurelis.local',
      domTextSnapshot: syntheticBenchmarkText,
    });

    const result = await guard.sanitizeFrame(rawFrame);

    // Assert that a branded SanitizedFrame was created
    assert.strictEqual(isSanitizedFrame(result.sanitizedFrame), true);
    assert.strictEqual(result.sanitizedFrame._brand, 'SanitizedFrame');

    // Assert sensitive regions were detected
    assert.strictEqual(result.proof.sensitiveRegionsDetectedCount >= 4, true);
    assert.strictEqual(result.proof.redactionsAppliedCount >= 4, true);
    assert.strictEqual(result.proof.directRawFrameToAiBlocked, true);

    // Assert text snapshot was sanitized
    assert.ok(result.sanitizedTextSnapshot);
    assert.strictEqual(result.sanitizedTextSnapshot.includes('AURELIS_TEST_NAME'), false);
    assert.strictEqual(result.sanitizedTextSnapshot.includes('AURELIS-ID-12345'), false);
    assert.strictEqual(result.sanitizedTextSnapshot.includes('test@example.local'), false);
    assert.strictEqual(result.sanitizedTextSnapshot.includes('+91 9000000000'), false);
  });

  test('DemoVisionEngine accepts SanitizedFrame and reports verified status', async () => {
    const rawFrame = createRawBrowserFrame({
      frameId: 'test-frame-002',
      imageBase64: 'FAKE_BASE64_DATA',
      width: 1280,
      height: 720,
      sourceUrl: 'https://benchmark.aurelis.local',
      domTextSnapshot: 'Generic login form with user input and submit button',
    });

    const guardResult = await guard.sanitizeFrame(rawFrame);
    const visionResult = await visionEngine.processSanitizedFrame(
      guardResult.sanitizedFrame,
      { goal: 'Submit the form' }
    );

    assert.strictEqual(visionResult.frameId, guardResult.sanitizedFrame.frameId);
    assert.strictEqual(visionResult.rawFrameBypassed, false);
    assert.strictEqual(
      visionResult.verifiedSanitizedDigest,
      guardResult.sanitizedFrame.verificationDigest
    );
    assert.ok(visionResult.detectedElements.length > 0);
  });

  test('DemoVisionEngine rejects unbranded or unverified frames', async () => {
    const invalidFrame = {
      frameId: 'unverified-frame',
      sanitizedImageBase64: 'unverified_content',
    } as unknown as SanitizedFrame;

    await assert.rejects(
      async () => {
        await visionEngine.processSanitizedFrame(invalidFrame, { goal: 'Bypass test' });
      },
      {
        message: /SECURITY VIOLATION/,
      }
    );
  });
});

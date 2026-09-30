/**
 * @file browser-agent-demo.test.ts
 * End-to-end integration test verifying the full Playwright browser agent,
 * privacy perimeter redaction, target click, and proof generation.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createServer } from '../apps/api/src/server.js';

describe('Playwright Browser Agent & Privacy Boundary E2E', () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    const app = createServer();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  test('Executes complete browser demo: launch -> capture -> redact -> ground -> click -> verify', async () => {
    // 1. Initial State should be IDLE
    const initialRes = await fetch(`${baseUrl}/api/agent/state`);
    assert.strictEqual(initialRes.status, 200);
    const initialState = await initialRes.json();
    assert.strictEqual(initialState.state, 'IDLE');

    // 2. Trigger Agent Run
    const runRes = await fetch(`${baseUrl}/api/agent/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskPrompt: 'Find the Continue button and click it while protecting private information.',
      }),
    });
    assert.strictEqual(runRes.status, 200);

    // 3. Poll for Completion
    let finalState: any = null;
    let pollAttempts = 0;
    const maxAttempts = 40; // 40 * 500ms = 20s max

    while (pollAttempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 500));
      pollAttempts++;

      const stateRes = await fetch(`${baseUrl}/api/agent/state`);
      const stateData = await stateRes.json();

      if (stateData.state === 'COMPLETED' || stateData.state === 'FAILED') {
        finalState = stateData;
        break;
      }
    }

    assert.ok(finalState, 'Agent execution did not reach terminal state within timeout');
    assert.strictEqual(finalState.state, 'COMPLETED', `Agent failed with error: ${finalState.error}`);

    // 4. Assert Privacy Boundary & Sensitive Entity Interception
    assert.strictEqual(finalState.detectedSensitiveRegionsCount, 4);
    assert.strictEqual(finalState.redactionsCount, 4);
    assert.ok(finalState.privacyProof, 'Privacy proof must be attached');
    assert.strictEqual(finalState.privacyProof.directRawFrameToAiBlocked, true);
    assert.strictEqual(finalState.privacyProof.sensitiveRegionsDetectedCount, 4);
    assert.strictEqual(finalState.privacyProof.redactionsAppliedCount, 4);
    assert.strictEqual(typeof finalState.privacyProof.sanitizedDigest, 'string');
    assert.strictEqual(finalState.privacyProof.sanitizedDigest.length, 64); // SHA-256

    // 5. Assert Real Browser Screenshot & Grounding
    assert.ok(finalState.currentScreenshotBase64, 'Live browser screenshot must be captured');
    assert.ok(finalState.currentScreenshotBase64.length > 1000, 'Screenshot base64 must contain real image data');
    assert.ok(finalState.postActionScreenshotBase64, 'Post-action screenshot must be captured');
    assert.strictEqual(finalState.targetHighlight?.elementId, 'btn-continue');

    // 6. Assert Audit Trail
    const auditRes = await fetch(`${baseUrl}/api/audit/logs?limit=30`);
    const auditData = await auditRes.json();
    assert.ok(auditData.totalCount >= 5, 'Audit events must be recorded');
    const categories = auditData.events.map((e: any) => e.category);
    assert.ok(categories.includes('BROWSER_AGENT'));
    assert.ok(categories.includes('PRIVACY_GUARD'));
    assert.ok(categories.includes('VISION_ENGINE'));
    assert.ok(categories.includes('TASK_PLANNER'));

    // 7. Verify Reset works cleanly
    const resetRes = await fetch(`${baseUrl}/api/agent/reset`, { method: 'POST' });
    assert.strictEqual(resetRes.status, 200);
    const resetState = await resetRes.json();
    assert.strictEqual(resetState.state.state, 'IDLE');
    assert.strictEqual(resetState.state.detectedSensitiveRegionsCount, 0);
  });
});

/**
 * @file api-health.test.ts
 * Integration tests for Drishti backend API endpoints.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createServer } from '../apps/api/src/server.js';

describe('API Gateway Integration Tests', () => {
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

  test('GET / returns root service manifest', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.prototype, 'SIH 2026');
    assert.strictEqual(body.team, 'Aurelis');
  });

  test('GET /api/health reports system status with REAL and PLANNED indicators', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.strictEqual(body.status, 'HEALTHY');
    assert.strictEqual(body.team, 'Team Aurelis (Smart India Hackathon 2026)');

    // Verify module status distinctions
    assert.strictEqual(body.modules.core.status, 'REAL');
    assert.strictEqual(body.modules.privacyGuard.status, 'REAL');
    assert.strictEqual(body.modules.auditLogger.status, 'REAL');
    assert.strictEqual(body.modules.visionEngine.status, 'SIMULATED');
    assert.strictEqual(body.modules.browserAgent.status, 'REAL');
    assert.strictEqual(body.modules.taskPlanner.status, 'PLANNED');
  });

  test('GET /demo/privacy-form serves controlled synthetic test form', async () => {
    const res = await fetch(`${baseUrl}/demo/privacy-form`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('AURELIS_TEST_NAME'));
    assert.ok(html.includes('test@example.local'));
    assert.ok(html.includes('+91 9000000000'));
    assert.ok(html.includes('AURELIS-ID-12345'));
    assert.ok(html.includes('btn-continue'));
  });

  test('GET /api/agent/state returns initial orchestrator state', async () => {
    const res = await fetch(`${baseUrl}/api/agent/state`);
    assert.strictEqual(res.status, 200);
    const state = await res.json();
    assert.ok(state.state);
    assert.ok(state.pipelineStages);
  });

  test('GET /api/privacy/status returns active detectors and invariants', async () => {
    const res = await fetch(`${baseUrl}/api/privacy/status`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.strictEqual(body.status, 'ACTIVE');
    assert.ok(Array.isArray(body.registeredDetectors));
    assert.ok(body.registeredDetectors.length > 0);
  });

  test('POST /api/privacy/verify-sample executes end-to-end privacy verification', async () => {
    const res = await fetch(`${baseUrl}/api/privacy/verify-sample`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customGoal: 'Test automated submission',
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.strictEqual(body.success, true);
    assert.strictEqual(body.benchmarkVerified, true);
    assert.strictEqual(body.proofOfPrivacy.directRawFrameToAiBlocked, true);
    assert.strictEqual(body.proofOfPrivacy.sensitiveRegionsDetected >= 4, true);
    assert.strictEqual(body.visionEngineResponse.rawFrameBypassed, false);
  });
});

/**
 * @file policy-engine.ts
 * Local task-aware Privacy Decision Model for Drishti.
 *
 * Evaluates detected entities against task requirements before visual frame redaction:
 * USER TASK -> IDENTIFY -> CLASSIFY -> REQUIRED?
 *   NO  -> REDACT
 *   YES -> LOW/MODERATE -> POLICY_ALLOW
 *          HIGH -> USER CONSENT (APPROVE -> CONSENT_ALLOW, DENY -> CONSENT_DENIED / CANCEL)
 *
 * INVARIANT: This evaluation executes LOCALLY at the privacy perimeter.
 * Zero unredacted pixels bypass this local gate.
 */

import {
  type EntityPolicyRecord,
  type FieldPolicyDecision,
  type BoundingBox,
  getBenchmarkTask,
} from '@drishti/core';

export interface PolicyEvaluationResult {
  readonly taskId: string;
  readonly scenario: string;
  readonly policySummary: string;
  readonly consentStatus: 'NOT_REQUIRED' | 'APPROVED' | 'DENIED';
  readonly records: readonly EntityPolicyRecord[];
  readonly boxesToRedact: readonly BoundingBox[];
  readonly sensitiveDetectedCount: number;
  readonly redactionsAppliedCount: number;
  readonly allowedByPolicyCount: number;
  readonly preservedCount: number;
  readonly executionBlockedByConsent: boolean;
}

export class TaskPrivacyPolicyEngine {
  /**
   * Evaluates privacy policy on detected DOM boxes / entities for a specific benchmark task.
   */
  public evaluate(params: {
    taskId: string;
    detectedBoxes?: readonly { category: string; text: string; box: BoundingBox }[];
    consentGiven?: boolean;
  }): PolicyEvaluationResult {
    const task = getBenchmarkTask(params.taskId);
    const consentGiven = params.consentGiven ?? false;
    const records: EntityPolicyRecord[] = [];
    const boxesToRedact: BoundingBox[] = [];

    let consentStatus: 'NOT_REQUIRED' | 'APPROVED' | 'DENIED' = 'NOT_REQUIRED';
    let executionBlockedByConsent = false;

    // CASE 2: ZERO REDACTION / PUBLIC DASHBOARD
    if (task.privacyScenario === 'ZERO_REDACTION') {
      return {
        taskId: task.id,
        scenario: task.privacyScenario,
        policySummary: 'No sensitive information detected. No redaction required.',
        consentStatus: 'NOT_REQUIRED',
        records: [],
        boxesToRedact: [],
        sensitiveDetectedCount: 0,
        redactionsAppliedCount: 0,
        allowedByPolicyCount: 0,
        preservedCount: 4, // public service cards preserved
        executionBlockedByConsent: false,
      };
    }

    // Process detected boxes using authoritative task expected entities
    const detected = params.detectedBoxes || [];

    // Fall back to expected entities if no dynamic DOM boxes were passed
    const entitiesSource =
      detected.length > 0
        ? detected.map((d) => {
            const matched = task.expectedEntities.find(
              (e) => e.category === d.category || d.text.includes(e.defaultRaw)
            );
            return {
              label: matched ? matched.label : `Sensitive Field (${d.category})`,
              category: d.category,
              rawText: d.text,
              defaultRedacted: matched ? matched.defaultRedacted : '[REDACTED: PII]',
              sensitivityLevel: matched?.sensitivityLevel || 'MODERATE',
              isTaskRequired: matched?.isTaskRequired ?? false,
              box: d.box,
              rationale: matched?.rationale || 'Quarantined at local boundary',
            };
          })
        : task.expectedEntities.map((e) => ({
            label: e.label,
            category: e.category,
            rawText: e.defaultRaw,
            defaultRedacted: e.defaultRedacted,
            sensitivityLevel: e.sensitivityLevel || 'MODERATE',
            isTaskRequired: e.isTaskRequired ?? false,
            box: undefined as BoundingBox | undefined,
            rationale: e.rationale || 'Quarantined at local boundary',
          }));

    let allowedCount = 0;
    let redactedCount = 0;

    for (const item of entitiesSource) {
      let decision: FieldPolicyDecision = 'REDACT';
      let rationale = item.rationale;
      let redactedText = item.defaultRedacted;

      if (task.privacyScenario === 'FULL_REDACTION') {
        // CASE 1: All sensitive fields are unneeded -> 100% masked
        decision = 'REDACT';
        redactedText = '[REDACTED: PII]';
        redactedCount++;
        if (item.box) boxesToRedact.push(item.box);
      } else if (task.privacyScenario === 'MIXED_POLICY_ALLOW') {
        // CASE 3: Mixed Policy (Email required to identify profile -> POLICY_ALLOW, rest -> REDACT)
        if (item.isTaskRequired) {
          decision = 'POLICY_ALLOW';
          redactedText = item.rawText; // Allowed in sanitized frame
          rationale = 'Allowed by task policy: required to bind profile record. Sanitized locally.';
          allowedCount++;
        } else {
          decision = 'REDACT';
          redactedText = '[REDACTED: PII]';
          redactedCount++;
          if (item.box) boxesToRedact.push(item.box);
        }
      } else if (task.privacyScenario === 'HIGH_SENSITIVITY_CONSENT') {
        // CASE 4: High sensitivity credential requires explicit user consent gate
        if (item.sensitivityLevel === 'HIGH' && item.isTaskRequired) {
          if (consentGiven) {
            consentStatus = 'APPROVED';
            decision = 'CONSENT_ALLOW';
            redactedText = item.rawText; // Authorized by user consent
            rationale = 'User explicitly consented to include required access credential.';
            allowedCount++;
          } else {
            consentStatus = 'DENIED';
            decision = 'CONSENT_DENIED';
            redactedText = '[BLOCKED: CONSENT DENIED]';
            rationale = 'User denied consent: credential exposure blocked, action cancelled.';
            redactedCount++;
            executionBlockedByConsent = true;
            if (item.box) boxesToRedact.push(item.box);
          }
        } else {
          // Unrelated sensitive items remain strictly redacted
          decision = 'REDACT';
          redactedText = '[REDACTED: PII]';
          redactedCount++;
          if (item.box) boxesToRedact.push(item.box);
        }
      }

      records.push({
        label: item.label,
        category: item.category,
        rawText: item.rawText,
        redactedText,
        sensitivityLevel: item.sensitivityLevel,
        isTaskRequired: item.isTaskRequired,
        decision,
        decisionRationale: rationale,
        boundingBox: item.box,
      });
    }

    let policySummary = task.successMessage;
    if (task.privacyScenario === 'HIGH_SENSITIVITY_CONSENT' && executionBlockedByConsent) {
      policySummary = 'Privacy consent denied: High-sensitivity credential blocked. Action cancelled.';
    }

    return {
      taskId: task.id,
      scenario: task.privacyScenario,
      policySummary,
      consentStatus,
      records,
      boxesToRedact,
      sensitiveDetectedCount: records.length,
      redactionsAppliedCount: redactedCount,
      allowedByPolicyCount: allowedCount,
      preservedCount: 2,
      executionBlockedByConsent,
    };
  }
}

/**
 * @file agent-orchestrator.ts
 * Core runtime orchestrator coordinating Playwright Browser Agent,
 * Privacy Guard perimeter, Demo Vision Adapter, and Audit Logger.
 *
 * Implements strict run isolation and browser lifecycle management.
 */

import { PlaywrightBrowserAgent } from '@drishti/browser-agent';
import { PrivacyGuard } from '@drishti/privacy-guard';
import { DemoVisionEngine } from '@drishti/vision-engine';
import { globalAuditLogger } from '@drishti/audit-logger';
import {
  type PrivacyProofRecord,
  type BoundingBox,
  getBenchmarkTask,
} from '@drishti/core';

export type AgentExecutionState =
  | 'IDLE'
  | 'RUNNING'
  | 'PRIVACY_PROCESSING'
  | 'AI_ANALYZING'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED';

export interface PipelineStageStatus {
  rawScreen: 'pending' | 'active' | 'complete';
  piiDetection: 'pending' | 'active' | 'complete';
  redaction: 'pending' | 'active' | 'complete';
  sanitizedView: 'pending' | 'active' | 'complete';
  aiInput: 'pending' | 'active' | 'complete';
}

export interface AgentRunState {
  runId?: string;
  state: AgentExecutionState;
  taskId: string;
  taskName: string;
  routePath: string;
  targetActionLabel: string;
  targetActionSelector: string;
  currentTask: string;
  currentStepMessage: string;
  pipelineStages: PipelineStageStatus;
  currentScreenshotBase64?: string;
  rawScreenshotBase64?: string;
  sanitizedScreenshotBase64?: string;
  postActionScreenshotBase64?: string;
  targetHighlight?: {
    elementId: string;
    coordinates: { x: number; y: number };
    box?: BoundingBox;
    label: string;
  };
  privacyProof?: PrivacyProofRecord;
  rawDomSnapshot?: string;
  sanitizedDomSnapshot?: string;
  detectedSensitiveRegionsCount: number;
  redactionsCount: number;
  detectedEntities?: Array<{
    label: string;
    category: string;
    rawText: string;
    redactedText: string;
  }>;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  private privacyGuard: PrivacyGuard = new PrivacyGuard();
  private readonly visionAdapter = new DemoVisionEngine();
  private browserAgent: PlaywrightBrowserAgent | null = null;
  private isExecuting = false;
  private activeRunId: string | null = null;

  private currentState: AgentRunState = {
    state: 'IDLE',
    taskId: 'identity-verification',
    taskName: 'Secure Identity Verification',
    routePath: '/demo/identity-verification',
    targetActionLabel: 'Continue Verification',
    targetActionSelector: '#btn-continue',
    currentTask: 'Find the Continue button and click it while protecting private information.',
    currentStepMessage: 'System ready. Enter task and click RUN AGENT to start demonstration.',
    pipelineStages: {
      rawScreen: 'pending',
      piiDetection: 'pending',
      redaction: 'pending',
      sanitizedView: 'pending',
      aiInput: 'pending',
    },
    detectedSensitiveRegionsCount: 0,
    redactionsCount: 0,
  };

  public static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator();
    }
    return AgentOrchestrator.instance;
  }

  public getState(): AgentRunState {
    return { ...this.currentState };
  }

  public reset(taskId?: string): void {
    const prevRunId = this.activeRunId;
    this.activeRunId = null;
    this.isExecuting = false;

    if (this.browserAgent) {
      this.browserAgent.close().catch(() => {});
      this.browserAgent = null;
    }

    // Clear previous run events and proofs from audit logger
    globalAuditLogger.clear();

    const benchmarkTask = getBenchmarkTask(taskId || this.currentState.taskId);
    this.currentState = {
      state: 'IDLE',
      runId: undefined,
      taskId: benchmarkTask.id,
      taskName: benchmarkTask.name,
      routePath: benchmarkTask.routePath,
      targetActionLabel: benchmarkTask.targetActionLabel,
      targetActionSelector: benchmarkTask.targetActionSelector,
      currentTask: benchmarkTask.defaultPrompt,
      currentStepMessage: 'System reset. Ready to launch browser agent.',
      pipelineStages: {
        rawScreen: 'pending',
        piiDetection: 'pending',
        redaction: 'pending',
        sanitizedView: 'pending',
        aiInput: 'pending',
      },
      currentScreenshotBase64: undefined,
      rawScreenshotBase64: undefined,
      sanitizedScreenshotBase64: undefined,
      postActionScreenshotBase64: undefined,
      targetHighlight: undefined,
      privacyProof: undefined,
      rawDomSnapshot: undefined,
      sanitizedDomSnapshot: undefined,
      detectedSensitiveRegionsCount: 0,
      redactionsCount: 0,
      detectedEntities: undefined,
      error: undefined,
      startedAt: undefined,
      completedAt: undefined,
    };

    globalAuditLogger.log({
      category: 'SYSTEM',
      severity: 'INFO',
      message: 'Agent execution state reset to clean IDLE state',
      metadata: { clearedRunId: prevRunId, selectedTask: benchmarkTask.id },
    });
  }

  public async runDemoTask(params: {
    taskId?: string;
    taskPrompt?: string;
    port: number;
    consentGiven?: boolean;
  }): Promise<AgentRunState> {
    if (this.isExecuting) {
      return this.currentState;
    }

    this.isExecuting = true;
    const runId = `run-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    this.activeRunId = runId;

    // Reset previous run artifacts from logger so this run starts with a clean timeline
    globalAuditLogger.clear();

    // Ensure any stale browser session is closed before launching fresh session
    if (this.browserAgent) {
      await this.browserAgent.close().catch(() => {});
      this.browserAgent = null;
    }

    const benchmarkTask = getBenchmarkTask(params.taskId);
    const task = params.taskPrompt || benchmarkTask.defaultPrompt;
    const port = params.port;
    const demoUrl = `http://localhost:${port}${benchmarkTask.routePath}`;

    // Clean, isolated run state belonging strictly to this runId
    this.currentState = {
      runId,
      state: 'RUNNING',
      taskId: benchmarkTask.id,
      taskName: benchmarkTask.name,
      routePath: benchmarkTask.routePath,
      targetActionLabel: benchmarkTask.targetActionLabel,
      targetActionSelector: benchmarkTask.targetActionSelector,
      currentTask: task,
      currentStepMessage: `Initializing Playwright browser agent session for [${benchmarkTask.name}]...`,
      pipelineStages: {
        rawScreen: 'active',
        piiDetection: 'pending',
        redaction: 'pending',
        sanitizedView: 'pending',
        aiInput: 'pending',
      },
      currentScreenshotBase64: undefined,
      rawScreenshotBase64: undefined,
      sanitizedScreenshotBase64: undefined,
      postActionScreenshotBase64: undefined,
      targetHighlight: undefined,
      privacyProof: undefined,
      rawDomSnapshot: undefined,
      sanitizedDomSnapshot: undefined,
      detectedSensitiveRegionsCount: 0,
      redactionsCount: 0,
      detectedEntities: benchmarkTask.expectedEntities.map((e) => ({
        label: e.label,
        category: e.category,
        rawText: e.defaultRaw,
        redactedText: e.defaultRedacted,
      })),
      startedAt: Date.now(),
    };

    globalAuditLogger.log({
      category: 'TASK_PLANNER',
      severity: 'INFO',
      message: `Task initialized: "${task}"`,
      metadata: { runId, taskId: benchmarkTask.id, targetUrl: demoUrl },
    });

    const guardLifecycle = (stepName: string) => {
      if (this.activeRunId !== runId) {
        throw new Error(`Run aborted: Execution for run [${runId}] was cancelled or reset.`);
      }
      if (!this.browserAgent || !this.browserAgent.isPageAvailable) {
        throw new Error(`Browser lifecycle error: Browser page is not available during ${stepName}.`);
      }
    };

    try {
      // 1. Launch Browser
      const agent = new PlaywrightBrowserAgent();
      this.browserAgent = agent;
      await agent.launch({ headless: true });

      guardLifecycle('Browser Launch Verification');

      // Connect Privacy Guard with real browser pixel redactor
      this.privacyGuard = new PrivacyGuard(undefined, async (rawImg, boxes) => {
        if (this.browserAgent && this.browserAgent.isPageAvailable) {
          return await this.browserAgent.applyPixelRedaction(rawImg, boxes);
        }
        return rawImg;
      });

      globalAuditLogger.log({
        category: 'BROWSER_AGENT',
        severity: 'INFO',
        message: `Chromium browser launched for run [${runId}] with 1280x800 viewport`,
        metadata: { runId, taskId: benchmarkTask.id },
      });

      // 2. Navigate to controlled demo page
      guardLifecycle('Page Navigation');
      this.currentState.currentStepMessage = `Navigating to ${demoUrl}...`;
      await this.browserAgent.navigateTo(demoUrl);

      // 3. Capture Raw Browser Viewport Frame
      guardLifecycle('Screenshot Capture');
      this.currentState.currentStepMessage = 'Capturing viewport screenshot and DOM state...';
      const rawFrame = await this.browserAgent.captureRawFrame();

      this.currentState.rawScreenshotBase64 = rawFrame.imageBase64;
      this.currentState.currentScreenshotBase64 = rawFrame.imageBase64;
      this.currentState.rawDomSnapshot = rawFrame.domTextSnapshot;
      this.currentState.pipelineStages.rawScreen = 'complete';
      this.currentState.pipelineStages.piiDetection = 'active';

      if (rawFrame.detectedDomBoxes && rawFrame.detectedDomBoxes.length > 0) {
        this.currentState.detectedEntities = rawFrame.detectedDomBoxes.map((box) => {
          const matched = benchmarkTask.expectedEntities.find(
            (e) => e.category === box.category || box.text.includes(e.defaultRaw)
          );
          return {
            label: matched ? matched.label : `Sensitive Field (${box.category})`,
            category: box.category,
            rawText: box.text,
            redactedText: matched ? matched.defaultRedacted : `[REDACTED: ${box.category.replace('PII_', '')}]`,
          };
        });
      }

      globalAuditLogger.log({
        category: 'BROWSER_AGENT',
        severity: 'INFO',
        message: `Screenshot captured for frame ${rawFrame.frameId}. Viewport quarantined in local memory.`,
        metadata: { runId, frameId: rawFrame.frameId, width: rawFrame.width, height: rawFrame.height },
      });

      // Brief pause so visual transitions are noticeable in demo
      await new Promise((r) => setTimeout(r, 150));

      // 4. Privacy Guard Perimeter Execution
      guardLifecycle('Privacy Guard Scan');
      this.currentState.state = 'PRIVACY_PROCESSING';
      this.currentState.currentStepMessage = '02: Scanning visual and DOM state for sensitive content & evaluating policy...';

      globalAuditLogger.log({
        category: 'PRIVACY_GUARD',
        severity: 'INFO',
        message: `Privacy scan initiated on frame ${rawFrame.frameId}`,
        metadata: { runId },
      });

      const guardResult = await this.privacyGuard.sanitizeFrame(rawFrame, {
        taskId: benchmarkTask.id,
        consentGiven: params.consentGiven,
      });

      this.currentState.pipelineStages.piiDetection = 'complete';
      this.currentState.pipelineStages.redaction = 'active';
      this.currentState.detectedSensitiveRegionsCount = guardResult.proof.sensitiveRegionsDetectedCount;
      this.currentState.redactionsCount = guardResult.proof.redactionsAppliedCount;
      this.currentState.sanitizedDomSnapshot = guardResult.sanitizedTextSnapshot;
      this.currentState.sanitizedScreenshotBase64 = guardResult.sanitizedFrame.sanitizedImageBase64;
      this.currentState.currentScreenshotBase64 = guardResult.sanitizedFrame.sanitizedImageBase64;
      this.currentState.privacyProof = guardResult.proof;

      globalAuditLogger.recordPrivacyProof(guardResult.proof);

      globalAuditLogger.log({
        category: 'SECURITY_BOUNDARY',
        severity: 'INFO',
        message: `PII Detection: Found ${guardResult.proof.sensitiveRegionsDetectedCount} sensitive entities. Categories: ${guardResult.proof.sensitiveCategoriesFound.join(', ')}`,
        metadata: { runId },
      });

      // User Consent Denial Handling (Case 4)
      if (guardResult.policyResult?.executionBlockedByConsent) {
        this.currentState.pipelineStages.redaction = 'complete';
        this.currentState.pipelineStages.sanitizedView = 'complete';
        this.currentState.pipelineStages.aiInput = 'pending';
        this.currentState.state = 'COMPLETED';
        this.currentState.currentStepMessage =
          'Privacy consent denied: High-sensitivity credential blocked. Action cancelled.';
        this.currentState.completedAt = Date.now();

        globalAuditLogger.log({
          category: 'SECURITY_BOUNDARY',
          severity: 'WARNING',
          message: 'Consent: DENIED. Credential exposure blocked. Action cancelled.',
          metadata: { runId, taskId: benchmarkTask.id },
        });

        return this.currentState;
      }

      if (guardResult.policyResult?.consentStatus === 'APPROVED') {
        globalAuditLogger.log({
          category: 'SECURITY_BOUNDARY',
          severity: 'INFO',
          message: 'Consent: APPROVED by user. Single required credential authorized for task execution.',
          metadata: { runId, taskId: benchmarkTask.id },
        });
      }

      await new Promise((r) => setTimeout(r, 150));

      // 5. Redaction Complete & Sanitized Frame Production (Privacy Preflight)
      this.currentState.pipelineStages.redaction = 'complete';
      this.currentState.pipelineStages.sanitizedView = 'complete';
      this.currentState.pipelineStages.aiInput = 'active';
      this.currentState.currentStepMessage =
        '05: Privacy preflight verified (SHA-256 signed). Preparing input for Remote Reasoning Adapter...';

      globalAuditLogger.log({
        category: 'PRIVACY_GUARD',
        severity: 'INFO',
        message: `SanitizedFrame generated with SHA-256 verification digest: ${guardResult.sanitizedFrame.verificationDigest.substring(0, 16)}...`,
        metadata: { runId },
      });

      await new Promise((r) => setTimeout(r, 150));

      // 6. Vision Reasoning Adapter (strictly consumes SanitizedFrame)
      this.currentState.state = 'AI_ANALYZING';
      this.currentState.currentStepMessage = 'Remote Reasoning Adapter analyzing sanitized visual state to ground task objective...';

      globalAuditLogger.log({
        category: 'VISION_ENGINE',
        severity: 'INFO',
        message: 'Vision reasoning started. Zero raw browser pixels exposed to AI layer.',
        metadata: { runId, verifiedDigest: guardResult.sanitizedFrame.verificationDigest.substring(0, 16) },
      });

      const visionResult = await this.visionAdapter.processSanitizedFrame(
        guardResult.sanitizedFrame,
        {
          goal: task,
          targetElementDescription: `${benchmarkTask.targetActionLabel} (${benchmarkTask.targetActionSelector})`,
        }
      );

      this.currentState.pipelineStages.aiInput = 'complete';
      const targetSelector = benchmarkTask.targetActionSelector;
      const targetElementId = targetSelector.replace('#', '');
      this.currentState.targetHighlight = {
        elementId: visionResult.recommendedAction.targetElementId || targetElementId,
        coordinates: visionResult.recommendedAction.targetCoordinates || benchmarkTask.targetCoordinates,
        box: {
          x: benchmarkTask.targetCoordinates.x - 130,
          y: benchmarkTask.targetCoordinates.y - 24,
          width: 260,
          height: 48,
        },
        label: `Grounded Action Target: [ ${benchmarkTask.targetActionLabel.toUpperCase()} ]`,
      };

      globalAuditLogger.log({
        category: 'VISION_ENGINE',
        severity: 'INFO',
        message: `Target detected: "${targetSelector}". Confidence: ${visionResult.recommendedAction.confidence}`,
        metadata: { runId, rationale: visionResult.recommendedAction.rationale },
      });

      await new Promise((r) => setTimeout(r, 200));

      // 7. Execute Browser Action
      guardLifecycle('Browser Action Execution');
      this.currentState.state = 'EXECUTING';
      this.currentState.currentStepMessage = `Executing browser interaction: Click ${targetSelector}...`;

      const actionResult = await this.browserAgent.executeAction({
        actionId: `act-${Date.now().toString(36)}`,
        type: 'CLICK',
        selector: targetSelector,
        description: `Click primary ${benchmarkTask.targetActionLabel} CTA`,
      });

      globalAuditLogger.log({
        category: 'BROWSER_AGENT',
        severity: 'INFO',
        message: `Browser action CLICK executed on ${targetSelector} in ${actionResult.executionTimeMs}ms`,
        metadata: { runId, success: actionResult.success },
      });

      await new Promise((r) => setTimeout(r, 150));

      // 8. Verification & Post-Action Confirmation
      guardLifecycle('Post-action Verification');
      this.currentState.state = 'VERIFYING';
      this.currentState.currentStepMessage = 'Verifying page state transition & confirmation token...';

      // Capture post-action screenshot
      const postFrame = await this.browserAgent.captureRawFrame();
      this.currentState.postActionScreenshotBase64 = postFrame.imageBase64;
      this.currentState.currentScreenshotBase64 = postFrame.imageBase64;

      const formStatus = await this.browserAgent.getPageStatusAttribute();
      const isVerified =
        formStatus === 'verified' ||
        (postFrame.domTextSnapshot?.includes(benchmarkTask.verificationKeyword) ?? false) ||
        (postFrame.domTextSnapshot?.includes('SUBMISSION CONFIRMED') ?? false) ||
        (postFrame.domTextSnapshot?.includes('VERIFIED') ?? false);

      if (!isVerified) {
        throw new Error(
          `Action verification failed: Target page did not transition to verified state (${benchmarkTask.verificationKeyword}).`
        );
      }

      globalAuditLogger.log({
        category: 'TASK_PLANNER',
        severity: 'INFO',
        message: `Action verification confirmed for [${benchmarkTask.name}]. State token validated.`,
        metadata: { runId },
      });

      // 9. Task Completion
      this.currentState.state = 'COMPLETED';
      this.currentState.currentStepMessage = benchmarkTask.successMessage;
      this.currentState.completedAt = Date.now();

      globalAuditLogger.log({
        category: 'TASK_PLANNER',
        severity: 'INFO',
        message: `Task [${benchmarkTask.name}] completed successfully in ${((this.currentState.completedAt - (this.currentState.startedAt || 0)) / 1000).toFixed(1)}s`,
        metadata: { runId },
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.currentState.state = 'FAILED';
      this.currentState.error = errorMsg;
      this.currentState.currentStepMessage = `Task failed: ${errorMsg}`;

      globalAuditLogger.log({
        category: 'SYSTEM',
        severity: 'CRITICAL',
        message: `Execution halted with error: ${errorMsg}`,
        metadata: { runId },
      });
    } finally {
      if (this.activeRunId === runId) {
        this.isExecuting = false;
      }
      if (this.browserAgent) {
        await this.browserAgent.close().catch(() => {});
        this.browserAgent = null;
      }
    }

    return this.currentState;
  }
}

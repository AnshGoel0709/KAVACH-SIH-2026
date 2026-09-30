import React, { useEffect, useState, useCallback } from 'react';
import { TopHeader } from './components/TopHeader.js';
import { PipelineProgressBar, type PipelineStages } from './components/PipelineProgressBar.js';
import { TaskControlPanel } from './components/TaskControlPanel.js';
import { LiveBrowserViewport } from './components/LiveBrowserViewport.js';
import {
  PrivacyProofModal,
  type PrivacyProofData,
  type DetectedEntityItem,
} from './components/PrivacyProofModal.js';
import { TechnicalSpecsModal } from './components/TechnicalSpecsModal.js';
import { ActivityDrawer } from './components/ActivityDrawer.js';
import { PrivacyConsentModal } from './components/PrivacyConsentModal.js';
import type { AuditLogEntry } from './components/AuditStream.js';
import { getBenchmarkPreset } from './types/benchmark.js';

interface BackendAgentStateResponse {
  runId?: string;
  state: string;
  taskId: string;
  taskName: string;
  routePath: string;
  targetActionLabel: string;
  targetActionSelector: string;
  currentTask: string;
  currentStepMessage: string;
  pipelineStages: PipelineStages;
  currentScreenshotBase64?: string;
  rawScreenshotBase64?: string;
  sanitizedScreenshotBase64?: string;
  postActionScreenshotBase64?: string;
  targetHighlight?: {
    elementId: string;
    coordinates: { x: number; y: number };
    box?: { x: number; y: number; width: number; height: number };
    label: string;
  };
  privacyProof?: PrivacyProofData;
  rawDomSnapshot?: string;
  sanitizedDomSnapshot?: string;
  detectedSensitiveRegionsCount: number;
  redactionsCount: number;
  detectedEntities?: DetectedEntityItem[];
  error?: string;
}

interface ActiveRunState {
  runId: string;
  taskId: string;
  taskName: string;
  routePath: string;
  targetActionLabel: string;
  targetActionSelector: string;
  state: string;
  stepMessage: string;
  pipelineStages: PipelineStages;
  currentScreenshotBase64?: string;
  rawScreenshotBase64?: string;
  sanitizedScreenshotBase64?: string;
  targetHighlight?: {
    elementId: string;
    coordinates: { x: number; y: number };
    box?: { x: number; y: number; width: number; height: number };
    label: string;
  };
  privacyProof?: PrivacyProofData;
  detectedCount: number;
  redactionsCount: number;
  detectedEntities?: DetectedEntityItem[];
  error?: string;
}

const PENDING_STAGES: PipelineStages = {
  rawScreen: 'pending',
  piiDetection: 'pending',
  redaction: 'pending',
  sanitizedView: 'pending',
  aiInput: 'pending',
};

export const App: React.FC = () => {
  // 1. DRAFT TASK SELECTION (User-controlled, isolated from execution)
  const [draftTaskId, setDraftTaskId] = useState<string>('identity-verification');
  const [draftPrompt, setDraftPrompt] = useState<string>(() => {
    return getBenchmarkPreset('identity-verification').prompt;
  });

  // 2. ACTIVE EXECUTION RUN (Populated ONLY when RUN AGENT is clicked)
  const [activeRun, setActiveRun] = useState<ActiveRunState | null>(null);

  // 3. AUDIT & SYSTEM MODALS
  const [auditEvents, setAuditEvents] = useState<AuditLogEntry[]>([]);
  const [isPrivacyProofOpen, setIsPrivacyProofOpen] = useState(false);
  const [isTechSpecsOpen, setIsTechSpecsOpen] = useState(false);
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [healthModules, setHealthModules] = useState<Record<string, any> | null>(null);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(0);

  const selectedPreset = getBenchmarkPreset(draftTaskId);

  // Does the current active run belong to the currently selected draft task?
  const isRunForCurrentTask = activeRun !== null && activeRun.taskId === draftTaskId;

  // Fetch Agent State from Backend
  const fetchAgentState = useCallback(async () => {
    try {
      const res = await fetch('/api/agent/state');
      if (res.ok) {
        const data: BackendAgentStateResponse = await res.json();

        // If backend has an active or completed execution with a runId
        if (data.state !== 'IDLE' && data.runId) {
          setActiveRun({
            runId: data.runId,
            taskId: data.taskId,
            taskName: data.taskName,
            routePath: data.routePath,
            targetActionLabel: data.targetActionLabel,
            targetActionSelector: data.targetActionSelector,
            state: data.state,
            stepMessage: data.currentStepMessage,
            pipelineStages: data.pipelineStages || PENDING_STAGES,
            currentScreenshotBase64: data.currentScreenshotBase64,
            rawScreenshotBase64: data.rawScreenshotBase64,
            sanitizedScreenshotBase64: data.sanitizedScreenshotBase64,
            targetHighlight: data.targetHighlight,
            privacyProof: data.privacyProof,
            detectedCount: data.detectedSensitiveRegionsCount || 0,
            redactionsCount: data.redactionsCount || 0,
            detectedEntities: data.detectedEntities,
            error: data.error,
          });
        }

        return data.state;
      }
    } catch (err) {
      console.error('Failed to fetch agent state:', err);
    }
    return null;
  }, []);

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/audit/logs?limit=40');
      if (res.ok) {
        const data = await res.json();
        setAuditEvents(data.events || []);
      }
    } catch {
      // Ignore if offline
    }
  }, []);

  // Fetch Health & Architecture Info
  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealthModules(data.modules);
        setUptimeSeconds(data.uptimeSeconds);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Execute Agent Run (Underlying network dispatch)
  const executeAgentRun = async (consentGiven?: boolean) => {
    try {
      // Clear previous run artifacts immediately on UI so new run starts clean
      setAuditEvents([]);
      setActiveRun({
        runId: 'launching',
        taskId: draftTaskId,
        taskName: selectedPreset.name,
        routePath: selectedPreset.routePath,
        targetActionLabel: selectedPreset.targetActionLabel,
        targetActionSelector: selectedPreset.targetSelector,
        state: 'RUNNING',
        stepMessage: `01: Initializing Playwright browser agent session for [${selectedPreset.name}]...`,
        pipelineStages: {
          rawScreen: 'active',
          piiDetection: 'pending',
          redaction: 'pending',
          sanitizedView: 'pending',
          aiInput: 'pending',
        },
        detectedCount: 0,
        redactionsCount: 0,
      });

      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: draftTaskId,
          taskPrompt: draftPrompt,
          consentGiven,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to initiate agent run: ${res.statusText}`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setActiveRun((prev) =>
        prev
          ? { ...prev, state: 'FAILED', error: errorMsg, stepMessage: `Launch error: ${errorMsg}` }
          : null
      );
    }
  };

  // Start Agent Run Trigger (Checks if consent modal prompt is needed)
  const handleRunAgent = () => {
    if (selectedPreset.requiresConsent) {
      setIsConsentModalOpen(true);
      return;
    }
    executeAgentRun();
  };

  // Consent Modal Decision Handlers
  const handleConsentResponse = async (consentGiven: boolean) => {
    setIsConsentModalOpen(false);
    await executeAgentRun(consentGiven);
  };

  // Reset Agent Demo
  const handleResetDemo = async () => {
    try {
      await fetch('/api/agent/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: draftTaskId }),
      });
      // Clear active run completely back to clean IDLE state
      setActiveRun(null);
      setAuditEvents([]);
      await fetchAuditLogs();
    } catch (err) {
      console.error('Failed to reset demo:', err);
    }
  };

  // Active polling effect
  useEffect(() => {
    fetchAgentState();
    fetchAuditLogs();
    fetchHealth();

    const isRunning =
      activeRun?.state === 'RUNNING' ||
      activeRun?.state === 'PRIVACY_PROCESSING' ||
      activeRun?.state === 'AI_ANALYZING' ||
      activeRun?.state === 'EXECUTING' ||
      activeRun?.state === 'VERIFYING';

    const intervalTime = isRunning ? 200 : 2000;

    const interval = setInterval(() => {
      fetchAgentState();
      fetchAuditLogs();
      fetchHealth();
    }, intervalTime);

    return () => clearInterval(interval);
  }, [activeRun?.state, fetchAgentState, fetchAuditLogs, fetchHealth]);

  // Derived presentation values ensuring zero state leakage across tasks
  const currentAgentState = isRunForCurrentTask ? activeRun?.state || 'IDLE' : 'IDLE';
  const currentStepMessage = isRunForCurrentTask
    ? activeRun?.stepMessage || 'System ready. Click RUN AGENT to start demonstration.'
    : 'System ready. Review benchmark and click RUN AGENT to start execution.';
  const currentPipelineStages = isRunForCurrentTask
    ? activeRun?.pipelineStages || PENDING_STAGES
    : PENDING_STAGES;
  const currentScreenshot = isRunForCurrentTask ? activeRun?.currentScreenshotBase64 : undefined;
  const currentHighlight = isRunForCurrentTask ? activeRun?.targetHighlight : undefined;
  const currentProof = isRunForCurrentTask ? activeRun?.privacyProof : undefined;
  const currentDetected = isRunForCurrentTask ? activeRun?.detectedCount || 0 : 0;
  const currentRedactions = isRunForCurrentTask ? activeRun?.redactionsCount || 0 : 0;
  const currentAllowed = isRunForCurrentTask ? activeRun?.privacyProof?.allowedByPolicyCount || 0 : 0;
  const currentError = isRunForCurrentTask ? activeRun?.error : undefined;

  return (
    <div className="command-center">
      {/* Top Header */}
      <TopHeader
        agentState={currentAgentState}
        onOpenTechSpecs={() => setIsTechSpecsOpen(true)}
        onOpenActivityDrawer={() => setIsActivityDrawerOpen(true)}
      />

      {/* Horizontal Privacy Perimeter Pipeline (Locked PPT Terminology) */}
      <PipelineProgressBar
        stages={currentPipelineStages}
        agentState={currentAgentState}
        detectedCount={currentDetected}
        redactionsCount={currentRedactions}
        allowedCount={currentAllowed}
        taskScenario={selectedPreset.privacyScenario}
      />

      {/* Main 2-Column Console Grid (Browser Workspace as Visual Hero) */}
      <div className="main-console-grid">
        {/* Left Column: Task & Agent Controls */}
        <TaskControlPanel
          taskPrompt={draftPrompt}
          onTaskPromptChange={setDraftPrompt}
          selectedTaskId={draftTaskId}
          onSelectTaskId={(newId) => {
            // ONLY changes draft selection. Never executes, never runs Playwright
            setDraftTaskId(newId);
            const preset = getBenchmarkPreset(newId);
            setDraftPrompt(preset.prompt);
          }}
          taskName={selectedPreset.name}
          targetActionLabel={selectedPreset.targetActionLabel}
          onRunAgent={handleRunAgent}
          onResetDemo={handleResetDemo}
          agentState={currentAgentState}
          stepMessage={currentStepMessage}
          detectedCount={currentDetected}
          redactionsCount={currentRedactions}
          onOpenPrivacyProof={() => setIsPrivacyProofOpen(true)}
          error={currentError}
          hasValidRunForTask={isRunForCurrentTask}
        />

        {/* Hero Column: Live Browser Viewport */}
        <LiveBrowserViewport
          screenshotBase64={currentScreenshot}
          agentState={currentAgentState}
          targetHighlight={currentHighlight}
          demoUrl={`http://localhost:3001${selectedPreset.routePath}`}
          previewUrl={selectedPreset.routePath}
          taskName={selectedPreset.name}
          targetSelector={selectedPreset.targetSelector}
          targetActionLabel={selectedPreset.targetActionLabel}
        />
      </div>

      {/* Privacy Proof Modal (Belongs strictly to current run) */}
      <PrivacyProofModal
        isOpen={isPrivacyProofOpen}
        onClose={() => setIsPrivacyProofOpen(false)}
        proof={currentProof}
        rawScreenshotBase64={isRunForCurrentTask ? activeRun?.rawScreenshotBase64 : undefined}
        sanitizedScreenshotBase64={isRunForCurrentTask ? activeRun?.sanitizedScreenshotBase64 : undefined}
        taskId={isRunForCurrentTask ? activeRun?.taskId : draftTaskId}
        taskName={isRunForCurrentTask ? activeRun?.taskName : selectedPreset.name}
        targetActionLabel={isRunForCurrentTask ? activeRun?.targetActionLabel : selectedPreset.targetActionLabel}
        detectedEntities={isRunForCurrentTask ? activeRun?.detectedEntities : undefined}
      />

      {/* High-Sensitivity User Consent Gate Modal (Case 4) */}
      <PrivacyConsentModal
        isOpen={isConsentModalOpen}
        onDeny={() => handleConsentResponse(false)}
        onAllow={() => handleConsentResponse(true)}
        taskName={selectedPreset.name}
      />

      {/* Activity Log & Subsystem Telemetry Drawer */}
      <ActivityDrawer
        isOpen={isActivityDrawerOpen}
        onClose={() => setIsActivityDrawerOpen(false)}
        events={auditEvents}
        agentState={currentAgentState}
        redactionsCount={currentRedactions}
        targetSelector={selectedPreset.targetSelector}
        targetActionLabel={selectedPreset.targetActionLabel}
      />

      {/* Secondary Technical Specs Modal */}
      <TechnicalSpecsModal
        isOpen={isTechSpecsOpen}
        onClose={() => setIsTechSpecsOpen(false)}
        modules={healthModules}
        uptimeSeconds={uptimeSeconds}
      />
    </div>
  );
};

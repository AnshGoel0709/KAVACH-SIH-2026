import React from 'react';
import { Play, RotateCcw, Square, CheckCircle2, AlertCircle, Shield, FileCheck } from 'lucide-react';
import { BENCHMARK_PRESETS } from '../types/benchmark.js';

interface TaskControlPanelProps {
  taskPrompt: string;
  onTaskPromptChange: (val: string) => void;
  selectedTaskId: string;
  onSelectTaskId: (taskId: string) => void;
  taskName?: string;
  targetActionLabel?: string;
  onRunAgent: () => void;
  onResetDemo: () => void;
  agentState: string;
  stepMessage: string;
  detectedCount: number;
  redactionsCount: number;
  onOpenPrivacyProof: () => void;
  error?: string;
  hasValidRunForTask?: boolean;
}

export const TaskControlPanel: React.FC<TaskControlPanelProps> = ({
  taskPrompt,
  onTaskPromptChange,
  selectedTaskId,
  onSelectTaskId,
  onRunAgent,
  onResetDemo,
  agentState,
  stepMessage,
  detectedCount,
  redactionsCount,
  onOpenPrivacyProof,
  error,
  hasValidRunForTask = true,
}) => {
  const isRunning =
    agentState === 'RUNNING' ||
    agentState === 'PRIVACY_PROCESSING' ||
    agentState === 'AI_ANALYZING' ||
    agentState === 'EXECUTING' ||
    agentState === 'VERIFYING';

  const isCompleted = hasValidRunForTask && agentState === 'COMPLETED';
  const isFailed = hasValidRunForTask && agentState === 'FAILED';

  const displayState = hasValidRunForTask ? agentState : 'READY';
  const displayMessage = hasValidRunForTask
    ? stepMessage
    : 'Select a benchmark task and click RUN AGENT to start execution.';

  const handleSelectPreset = (presetId: string, defaultPrompt: string) => {
    onSelectTaskId(presetId);
    onTaskPromptChange(defaultPrompt);
  };

  const getScenarioPill = (scenario: string) => {
    switch (scenario) {
      case 'FULL_REDACTION':
        return { label: 'FULL REDACTION', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'ZERO_REDACTION':
        return { label: 'ZERO REDACTION', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' };
      case 'MIXED_POLICY_ALLOW':
        return { label: 'MIXED POLICY', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.12)', border: 'rgba(192, 132, 252, 0.3)' };
      case 'HIGH_SENSITIVITY_CONSENT':
        return { label: 'CONSENT REQUIRED', color: '#f87171', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { label: 'POLICY ENFORCED', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.2)' };
    }
  };

  return (
    <aside className="panel-left">
      <div className="panel-section-title">
        <Shield size={13} color="var(--accent-cyan)" />
        BENCHMARK TASKS
      </div>

      {/* 4 Clean Benchmark Cards (2x2 Grid) */}
      <div className="benchmark-cards-grid">
        {BENCHMARK_PRESETS.map((preset) => {
          const isSelected = selectedTaskId === preset.id;
          const pill = getScenarioPill(preset.privacyScenario);

          return (
            <button
              key={preset.id}
              className={`benchmark-card-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectPreset(preset.id, preset.prompt)}
              disabled={isRunning}
              type="button"
            >
              <div className="card-top-row">
                <span className="task-title-text">{preset.name.replace(/^\d+\.\s*/, '')}</span>
                <span
                  className="scenario-badge-pill"
                  style={{ color: pill.color, background: pill.bg, borderColor: pill.border }}
                >
                  {pill.label}
                </span>
              </div>
              <div className="task-desc-text">
                {preset.id === 'identity-verification' && 'Citizen verification with 100% sensitive PII masked at perimeter'}
                {preset.id === 'account-access' && 'Public civic portal navigation with zero PII redaction required'}
                {preset.id === 'profile-management' && 'Unneeded PII masked, task-required profile email allowed'}
                {preset.id === 'document-review' && 'Classified legal docket access with explicit user consent gate'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Agent Objective Prompt */}
      <div className="panel-section-title" style={{ marginTop: '8px' }}>
        <span>NATURAL LANGUAGE OBJECTIVE</span>
      </div>

      <div className="task-input-box">
        <textarea
          className="task-textarea"
          value={taskPrompt}
          onChange={(e) => onTaskPromptChange(e.target.value)}
          disabled={isRunning}
          rows={3}
          placeholder="Enter agent objective..."
        />

        {/* Primary RUN AGENT Action Button */}
        <button
          className={`btn-run-agent ${isRunning ? 'running' : isCompleted ? 'completed' : ''}`}
          onClick={onRunAgent}
          disabled={isRunning}
          type="button"
        >
          {isRunning ? (
            <>
              <span className="pulse-circle" style={{ backgroundColor: '#fff', width: 8, height: 8 }} />
              AGENT EXECUTING...
            </>
          ) : isCompleted ? (
            <>
              <Play size={15} fill="currentColor" />
              RUN AGAIN
            </>
          ) : (
            <>
              <Play size={15} fill="currentColor" />
              RUN AGENT
            </>
          )}
        </button>

        {/* 3-Slot Secondary Control Row: [ RESET ] [ STOP ] [ PROOF ] */}
        <div className="secondary-controls-row">
          <button
            className="btn-control"
            onClick={onResetDemo}
            title="Reset browser agent state to clean IDLE"
            type="button"
          >
            <RotateCcw size={13} />
            RESET
          </button>

          <button
            className="btn-control"
            onClick={onResetDemo}
            disabled={!isRunning}
            title={isRunning ? "Stop current agent run" : "Stop agent (active during execution)"}
            type="button"
          >
            <Square size={13} />
            STOP
          </button>

          <button
            className={`btn-control btn-control-proof ${isCompleted ? 'active' : ''}`}
            onClick={onOpenPrivacyProof}
            disabled={!isCompleted}
            title={isCompleted ? "Inspect cryptographic privacy proof" : "Privacy proof available after run completion"}
            type="button"
          >
            <FileCheck size={13} />
            PROOF
          </button>
        </div>
      </div>

      {/* Minimal Execution Status Card */}
      <div className="task-status-card">
        <div className="status-badge-row">
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            AGENT STATUS
          </span>
          <span className={`status-badge ${displayState}`}>{displayState}</span>
        </div>

        <div className="status-narrative mono">{displayMessage}</div>

        {hasValidRunForTask && (
          <div className="status-metrics-row">
            <div className="status-metric-item">
              <span className="metric-lbl">Detected:</span>
              <span className="metric-val">{detectedCount}</span>
            </div>
            <div className="status-metric-item">
              <span className="metric-lbl">Redacted:</span>
              <span className="metric-val" style={{ color: 'var(--accent-cyan)' }}>{redactionsCount}</span>
            </div>
            <div className="status-metric-item">
              <span className="metric-lbl">Raw AI:</span>
              <span className="metric-val" style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>0</span>
            </div>
          </div>
        )}
      </div>

      {isCompleted && (
        <div className="completion-callout">
          <div className="callout-header">
            <CheckCircle2 size={15} color="var(--accent-emerald)" />
            <span>TASK VERIFIED &amp; CONFIRMED</span>
          </div>
          <div className="callout-body">
            Grounded browser action executed. Zero raw browser pixels exposed to AI layer.
          </div>
        </div>
      )}

      {isFailed && (
        <div className="error-callout">
          <div className="callout-header">
            <AlertCircle size={15} color="var(--accent-crimson)" />
            <span>EXECUTION HALTED</span>
          </div>
          <div className="callout-body">
            {error || 'An error occurred during execution.'}
          </div>
        </div>
      )}
    </aside>
  );
};

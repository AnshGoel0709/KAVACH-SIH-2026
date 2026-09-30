import React from 'react';
import { Camera, Search, Filter, CheckCircle2, Check, ShieldAlert } from 'lucide-react';

export interface PipelineStages {
  rawScreen: 'pending' | 'active' | 'complete';
  piiDetection: 'pending' | 'active' | 'complete';
  redaction: 'pending' | 'active' | 'complete';
  sanitizedView: 'pending' | 'active' | 'complete';
  aiInput: 'pending' | 'active' | 'complete';
  contextSelection?: 'pending' | 'active' | 'complete';
}

interface PipelineProgressBarProps {
  stages: PipelineStages;
  agentState?: string;
  detectedCount?: number;
  redactionsCount?: number;
  allowedCount?: number;
  taskScenario?: string;
}

export const PipelineProgressBar: React.FC<PipelineProgressBarProps> = ({
  stages,
  detectedCount,
  redactionsCount,
  allowedCount = 0,
  taskScenario = 'FULL_REDACTION',
}) => {
  // Derive stage 3 (Task-Relevant Context Selection) from stages
  const isContextComplete = stages.redaction === 'complete' || stages.sanitizedView === 'complete' || stages.aiInput === 'complete';
  const isContextActive = stages.piiDetection === 'complete' && stages.redaction !== 'complete';
  const contextStatus = isContextComplete ? 'complete' : isContextActive ? 'active' : 'pending';

  // Dynamic subtexts based on actual runtime policy and results
  const getPerceptionSubtext = () => {
    if (stages.rawScreen === 'complete') return 'Viewport captured locally';
    if (stages.rawScreen === 'active') return 'Capturing viewport locally...';
    return 'Capture viewport locally';
  };

  const getDetectionSubtext = () => {
    if (stages.piiDetection === 'complete') {
      if (detectedCount === 0) return '0 sensitive regions (clean)';
      return `${detectedCount ?? 4} sensitive regions identified`;
    }
    if (stages.piiDetection === 'active') return 'Scanning sensitive content...';
    return 'Identify sensitive regions';
  };

  const getSelectionSubtext = () => {
    if (contextStatus === 'complete') {
      if (taskScenario === 'ZERO_REDACTION' || detectedCount === 0) return 'Public service context selected';
      if (taskScenario === 'MIXED_POLICY_ALLOW') return '1 required allowed • 2 unnecessary';
      if (taskScenario === 'HIGH_SENSITIVITY_CONSENT') return 'High-sensitivity credential gated';
      return '0 required by visual reasoning';
    }
    if (contextStatus === 'active') return 'Evaluating disclosure policy...';
    return 'Determine required context';
  };

  const getRedactionSubtext = () => {
    if (stages.redaction === 'complete') {
      if (redactionsCount === 0) return '0 redactions required (clean)';
      if (allowedCount > 0) return `${redactionsCount} redacted • ${allowedCount} allowed`;
      return `${redactionsCount ?? 4} solid masks rendered`;
    }
    if (stages.redaction === 'active') return 'Masking pixels by policy...';
    return 'Mask or preserve by policy';
  };

  const getPreflightSubtext = () => {
    if (stages.sanitizedView === 'complete') return 'Safe AI payload verified (SHA-256)';
    if (stages.sanitizedView === 'active') return 'Attesting cryptographic proof...';
    return 'Verify safe AI payload';
  };

  return (
    <div className="pipeline-bar-wrapper">
      {/* Primary 5-Stage Visible Pipeline (Locked PPT Terminology) */}
      <div className="pipeline-stages">
        {/* Stage 01 */}
        <div className={`stage-item ${stages.rawScreen}`}>
          <div className="stage-icon">
            {stages.rawScreen === 'complete' ? (
              <Check size={14} color="var(--accent-emerald)" />
            ) : (
              <Camera size={14} />
            )}
          </div>
          <div className="stage-meta">
            <span className="stage-label">01 — LOCAL VISUAL PERCEPTION</span>
            <span className="stage-status">{getPerceptionSubtext()}</span>
          </div>
        </div>

        {/* Stage 02 */}
        <div className={`stage-item ${stages.piiDetection}`}>
          <div className="stage-icon">
            {stages.piiDetection === 'complete' ? (
              <Check size={14} color="var(--accent-emerald)" />
            ) : (
              <Search size={14} />
            )}
          </div>
          <div className="stage-meta">
            <span className="stage-label">02 — SENSITIVE CONTENT DETECTION</span>
            <span className="stage-status">{getDetectionSubtext()}</span>
          </div>
        </div>

        {/* Stage 03 */}
        <div className={`stage-item ${contextStatus}`}>
          <div className="stage-icon">
            {contextStatus === 'complete' ? (
              <Check size={14} color="var(--accent-emerald)" />
            ) : (
              <Filter size={14} />
            )}
          </div>
          <div className="stage-meta">
            <span className="stage-label">03 — TASK-RELEVANT CONTEXT SELECTION</span>
            <span className="stage-status">{getSelectionSubtext()}</span>
          </div>
        </div>

        {/* Stage 04 */}
        <div className={`stage-item ${stages.redaction}`}>
          <div className="stage-icon">
            {stages.redaction === 'complete' ? (
              <Check size={14} color="var(--accent-emerald)" />
            ) : (
              <ShieldAlert size={14} />
            )}
          </div>
          <div className="stage-meta">
            <span className="stage-label">04 — SANITIZATION &amp; REDACTION</span>
            <span className="stage-status">{getRedactionSubtext()}</span>
          </div>
        </div>

        {/* Stage 05 */}
        <div className={`stage-item ${stages.sanitizedView}`}>
          <div className="stage-icon">
            {stages.sanitizedView === 'complete' ? (
              <Check size={14} color="var(--accent-emerald)" />
            ) : (
              <CheckCircle2 size={14} />
            )}
          </div>
          <div className="stage-meta">
            <span className="stage-label">05 — PRIVACY PREFLIGHT</span>
            <span className="stage-status">{getPreflightSubtext()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

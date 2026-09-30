import React from 'react';
import { ShieldCheck, Lock, Activity, Cpu } from 'lucide-react';

interface TopHeaderProps {
  agentState: string;
  onOpenTechSpecs: () => void;
  onOpenActivityDrawer?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  agentState,
  onOpenTechSpecs,
  onOpenActivityDrawer,
}) => {
  const getStateColor = () => {
    switch (agentState) {
      case 'RUNNING':
        return 'var(--accent-cyan)';
      case 'PRIVACY_PROCESSING':
        return 'var(--accent-amber)';
      case 'AI_ANALYZING':
        return '#c084fc';
      case 'EXECUTING':
        return '#60a5fa';
      case 'VERIFYING':
        return '#facc15';
      case 'COMPLETED':
        return 'var(--accent-emerald)';
      case 'FAILED':
        return 'var(--accent-crimson)';
      default:
        return 'var(--text-muted)';
    }
  };

  const getStateLabel = () => {
    switch (agentState) {
      case 'RUNNING':
        return 'PERIMETER ACTIVE';
      case 'PRIVACY_PROCESSING':
        return 'SCANNING VIEWPORT';
      case 'AI_ANALYZING':
        return 'GROUNDING TARGET';
      case 'EXECUTING':
        return 'DISPATCHING COMMAND';
      case 'VERIFYING':
        return 'CONFIRMING TOKEN';
      case 'COMPLETED':
        return 'TASK COMPLETED';
      case 'FAILED':
        return 'EXECUTION HALTED';
      default:
        return 'STANDBY';
    }
  };

  return (
    <header className="top-header">
      <div className="brand-section">
        <div className="brand-icon">
          <ShieldCheck size={22} color="var(--accent-cyan)" />
        </div>
        <div className="brand-text">
          <h1>KAVACH</h1>
          <p>Privacy-Preserving Browser Vision Agent</p>
        </div>
      </div>

      <div className="header-center-status">
        <div className="task-state-pill" style={{ borderColor: getStateColor() }}>
          <span
            className="pulse-circle"
            style={{
              backgroundColor: getStateColor(),
              boxShadow: `0 0 8px ${getStateColor()}`,
            }}
          />
          <span style={{ color: getStateColor(), letterSpacing: '0.05em', fontWeight: 600 }}>
            {getStateLabel()}
          </span>
        </div>
      </div>

      <div className="header-actions">
        <span
          style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
            paddingRight: '6px',
            borderRight: '1px solid var(--border-subtle)',
          }}
        >
          Team Aurelis &bull; SIH 2026
        </span>

        <div className="badge-tag badge-online">
          <span className="pulse-circle" />
          AGENT ONLINE
        </div>

        <div className="badge-tag badge-privacy">
          <Lock size={12} />
          PRIVACY ACTIVE
        </div>

        {onOpenActivityDrawer && (
          <button
            className="btn-header-secondary"
            onClick={onOpenActivityDrawer}
            title="Inspect audit trail and event stream"
          >
            <Activity size={14} />
            ACTIVITY
          </button>
        )}

        <button
          className="btn-header-secondary"
          onClick={onOpenTechSpecs}
          title="Inspect architecture specification and maturity ledger"
        >
          <Cpu size={14} />
          SYSTEM
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { Activity, Cpu } from 'lucide-react';
import type { AuditLogEntry } from './AuditStream.js';

interface AgentStatusPanelProps {
  agentState: string;
  auditEvents: AuditLogEntry[];
  targetSelector?: string;
  targetActionLabel?: string;
  redactionsCount?: number;
  onOpenActivityDrawer?: () => void;
}

export const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({
  agentState,
  auditEvents,
  targetSelector = '#btn-action',
  targetActionLabel = 'Action',
  redactionsCount,
  onOpenActivityDrawer,
}) => {
  const getSubsystemStatus = (subsystem: string) => {
    switch (subsystem) {
      case 'VISION':
        if (agentState === 'AI_ANALYZING') {
          return { label: 'ANALYZING SANITIZED VIEW', color: '#c084fc', pulse: true };
        }
        if (agentState === 'EXECUTING' || agentState === 'VERIFYING' || agentState === 'COMPLETED') {
          return { label: 'GROUNDED (DEMO ADAPTER)', color: 'var(--accent-emerald)', pulse: false };
        }
        return { label: 'READY', color: 'var(--text-secondary)', pulse: false };

      case 'PLANNER':
        if (agentState === 'RUNNING' || agentState === 'PRIVACY_PROCESSING') {
          return { label: 'DECOMPOSING GOAL', color: 'var(--accent-cyan)', pulse: true };
        }
        if (agentState === 'COMPLETED') {
          return { label: 'COMPLETE', color: 'var(--accent-emerald)', pulse: false };
        }
        return { label: 'READY', color: 'var(--text-secondary)', pulse: false };

      case 'PRIVACY':
        if (agentState === 'PRIVACY_PROCESSING') {
          return { label: 'SCANNING VIEWPORT', color: 'var(--accent-amber)', pulse: true };
        }
        if (agentState === 'AI_ANALYZING' || agentState === 'EXECUTING' || agentState === 'COMPLETED') {
          const maskCount = redactionsCount !== undefined ? redactionsCount : 4;
          return {
            label: `PERIMETER ENFORCED (${maskCount} MASKED)`,
            color: 'var(--accent-emerald)',
            pulse: false,
          };
        }
        return { label: 'ACTIVE PERIMETER', color: 'var(--accent-cyan)', pulse: false };

      case 'ACTION':
        if (agentState === 'EXECUTING') {
          return { label: `CLICKING ${targetSelector}`, color: '#60a5fa', pulse: true };
        }
        if (agentState === 'VERIFYING' || agentState === 'COMPLETED') {
          return { label: `${targetActionLabel.toUpperCase()} CLICKED`, color: 'var(--accent-emerald)', pulse: false };
        }
        return { label: 'WAITING', color: 'var(--text-muted)', pulse: false };

      case 'VERIFICATION':
        if (agentState === 'VERIFYING') {
          return { label: 'CONFIRMING TOKEN', color: '#facc15', pulse: true };
        }
        if (agentState === 'COMPLETED') {
          return { label: 'VERIFIED & CONFIRMED', color: 'var(--accent-emerald)', pulse: false };
        }
        return { label: 'WAITING', color: 'var(--text-muted)', pulse: false };

      default:
        return { label: 'IDLE', color: 'var(--text-muted)', pulse: false };
    }
  };

  return (
    <aside className="panel-right">
      <div className="panel-section-title">
        <Cpu size={14} color="var(--accent-cyan)" />
        SUBSYSTEM STATUS MATRIX
      </div>

      <div className="subsystems-matrix">
        {['VISION', 'PLANNER', 'PRIVACY', 'ACTION', 'VERIFICATION'].map((sys) => {
          const status = getSubsystemStatus(sys);
          return (
            <div key={sys} className="subsystem-row">
              <span className="subsystem-name mono">{sys}</span>
              <span className="subsystem-status mono" style={{ color: status.color }}>
                {status.pulse && (
                  <span
                    className="pulse-circle"
                    style={{ backgroundColor: status.color, boxShadow: `0 0 6px ${status.color}` }}
                  />
                )}
                {status.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="panel-section-title" style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={14} color="var(--accent-emerald)" />
          <span>LIVE EXECUTION TIMELINE</span>
        </div>
        {onOpenActivityDrawer && (
          <button
            onClick={onOpenActivityDrawer}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontSize: '0.65rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Activity Drawer &rarr;
          </button>
        )}
      </div>

      <div className="timeline-feed">
        {auditEvents.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', padding: '12px 6px' }}>
            No agent events yet. Click <strong>RUN AGENT</strong> to observe live execution stream.
          </div>
        ) : (
          auditEvents.slice(-15).reverse().map((ev) => (
            <div key={ev.eventId} className={`timeline-item ${ev.category}`}>
              <div className="timeline-meta">
                <span className="mono">
                  [{new Date(ev.timestamp).toLocaleTimeString()}] {ev.category}
                </span>
                <span className="mono" style={{ color: 'var(--accent-cyan)' }}>
                  {ev.eventHash?.substring(0, 8)}...
                </span>
              </div>
              <div className="timeline-text">{ev.message}</div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

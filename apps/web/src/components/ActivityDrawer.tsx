import React, { useState } from 'react';
import { Activity, X, Search, Cpu } from 'lucide-react';
import type { AuditLogEntry } from './AuditStream.js';

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: AuditLogEntry[];
  agentState?: string;
  redactionsCount?: number;
  targetSelector?: string;
  targetActionLabel?: string;
}

export const ActivityDrawer: React.FC<ActivityDrawerProps> = ({
  isOpen,
  onClose,
  events,
  agentState = 'IDLE',
  redactionsCount = 0,
  targetSelector = '#btn-action',
  targetActionLabel = 'Action',
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = [
    'ALL',
    'SECURITY_BOUNDARY',
    'PRIVACY_GUARD',
    'VISION_ENGINE',
    'BROWSER_AGENT',
    'TASK_PLANNER',
    'SYSTEM',
  ];

  const getSubsystemStatus = (subsystem: string) => {
    switch (subsystem) {
      case 'VISION':
        if (agentState === 'AI_ANALYZING') {
          return { label: 'ANALYZING SANITIZED VIEW', color: '#c084fc', pulse: true };
        }
        if (agentState === 'EXECUTING' || agentState === 'VERIFYING' || agentState === 'COMPLETED') {
          return { label: 'GROUNDED (DEMO ADAPTER)', color: '#10b981', pulse: false };
        }
        return { label: 'READY', color: '#94a3b8', pulse: false };

      case 'PLANNER':
        if (agentState === 'RUNNING' || agentState === 'PRIVACY_PROCESSING') {
          return { label: 'DECOMPOSING GOAL', color: '#38bdf8', pulse: true };
        }
        if (agentState === 'COMPLETED') {
          return { label: 'COMPLETE', color: '#10b981', pulse: false };
        }
        return { label: 'READY', color: '#94a3b8', pulse: false };

      case 'PRIVACY':
        if (agentState === 'PRIVACY_PROCESSING') {
          return { label: 'SCANNING VIEWPORT', color: '#f59e0b', pulse: true };
        }
        if (agentState === 'AI_ANALYZING' || agentState === 'EXECUTING' || agentState === 'COMPLETED') {
          return {
            label: `PERIMETER ENFORCED (${redactionsCount} MASKED)`,
            color: '#10b981',
            pulse: false,
          };
        }
        return { label: 'ACTIVE PERIMETER', color: '#38bdf8', pulse: false };

      case 'ACTION':
        if (agentState === 'EXECUTING') {
          return { label: `CLICKING ${targetSelector}`, color: '#60a5fa', pulse: true };
        }
        if (agentState === 'VERIFYING' || agentState === 'COMPLETED') {
          return { label: `${targetActionLabel.toUpperCase()} CLICKED`, color: '#10b981', pulse: false };
        }
        return { label: 'WAITING', color: '#64748b', pulse: false };

      case 'VERIFICATION':
        if (agentState === 'VERIFYING') {
          return { label: 'CONFIRMING TOKEN', color: '#facc15', pulse: true };
        }
        if (agentState === 'COMPLETED') {
          return { label: 'VERIFIED & CONFIRMED', color: '#10b981', pulse: false };
        }
        return { label: 'WAITING', color: '#64748b', pulse: false };

      default:
        return { label: 'IDLE', color: '#64748b', pulse: false };
    }
  };

  const filteredEvents = events.filter((ev) => {
    const matchesCat = filterCategory === 'ALL' || ev.category === filterCategory;
    const matchesSearch =
      searchQuery === '' ||
      ev.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.eventHash && ev.eventHash.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog activity-drawer-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '92%',
          background: '#0c101c',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#080c16',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={18} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
                ACTIVITY LOG &bull; TAMPER-EVIDENT AUDIT TRAIL
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                SHA-256 chained event sequence from browser agent and privacy perimeter
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              className="mono"
              style={{
                fontSize: '0.7rem',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              {events.length} EVENTS RECORDED
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Subsystems Matrix Strip */}
        <div
          style={{
            padding: '10px 22px',
            background: '#090e1a',
            borderBottom: '1px solid #1e293b',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
          }}
        >
          {['VISION', 'PLANNER', 'PRIVACY', 'ACTION', 'VERIFICATION'].map((sys) => {
            const status = getSubsystemStatus(sys);
            return (
              <div
                key={sys}
                style={{
                  background: '#0c1222',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.62rem', color: '#64748b', fontWeight: 700 }}>
                  <Cpu size={10} color="#38bdf8" />
                  <span>{sys}</span>
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    color: status.color,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {status.pulse && (
                    <span
                      className="pulse-circle"
                      style={{ width: 5, height: 5, backgroundColor: status.color }}
                    />
                  )}
                  {status.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter Controls */}
        <div
          style={{
            padding: '12px 22px',
            background: 'rgba(255, 255, 255, 0.01)',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: filterCategory === cat ? '1px solid #38bdf8' : '1px solid #1e293b',
                  background: filterCategory === cat ? 'rgba(56, 189, 248, 0.15)' : '#0b111e',
                  color: filterCategory === cat ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#090d18',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '4px 10px',
            }}
          >
            <Search size={13} color="#64748b" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontSize: '0.72rem',
                outline: 'none',
                width: '150px',
              }}
            />
          </div>
        </div>

        {/* Event List */}
        <div
          style={{
            padding: '16px 22px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '0.8rem' }}>
              No audit events matching criteria.
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.eventId}
                style={{
                  background: '#080c17',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono" style={{ color: '#64748b' }}>
                      [{new Date(ev.timestamp).toLocaleTimeString()}]
                    </span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '3px',
                        fontWeight: 700,
                        fontSize: '0.62rem',
                        letterSpacing: '0.04em',
                        background:
                          ev.category === 'SECURITY_BOUNDARY'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : ev.category === 'PRIVACY_GUARD'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : ev.category === 'VISION_ENGINE'
                            ? 'rgba(192, 132, 252, 0.15)'
                            : 'rgba(56, 189, 248, 0.15)',
                        color:
                          ev.category === 'SECURITY_BOUNDARY'
                            ? '#f87171'
                            : ev.category === 'PRIVACY_GUARD'
                            ? '#f59e0b'
                            : ev.category === 'VISION_ENGINE'
                            ? '#c084fc'
                            : '#38bdf8',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {ev.category}
                    </span>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        color: ev.severity === 'CRITICAL' || ev.severity === 'WARNING' ? '#f87171' : '#10b981',
                        fontWeight: 600,
                      }}
                    >
                      {ev.severity}
                    </span>
                  </div>
                  <span className="mono" style={{ color: '#38bdf8', fontSize: '0.65rem' }}>
                    CHAIN HASH: {ev.eventHash ? `${ev.eventHash.substring(0, 12)}...` : 'n/a'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                  {ev.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

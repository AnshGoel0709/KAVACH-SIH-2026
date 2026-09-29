import React from 'react';
import { Activity } from 'lucide-react';

export interface AuditLogEntry {
  eventId: string;
  timestamp: number;
  severity: string;
  category: string;
  message: string;
  eventHash: string;
}

interface AuditStreamProps {
  logs: AuditLogEntry[];
  onRefresh?: () => void;
}

export const AuditStream: React.FC<AuditStreamProps> = ({ logs }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Activity size={18} color="var(--accent-cyan)" />
          Tamper-Evident Audit &amp; Event Stream
        </h2>
        <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {logs.length} EVENTS RECORDED
        </span>
      </div>

      {logs.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '12px 0' }}>
          No audit events recorded yet. Run a verification cycle to generate proof logs.
        </div>
      ) : (
        <div className="audit-stream">
          {logs.map((entry) => (
            <div key={entry.eventId} className={`audit-entry ${entry.category}`}>
              <div className="audit-meta">
                <span className="mono">
                  [{new Date(entry.timestamp).toLocaleTimeString()}] {entry.category}
                </span>
                <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)' }}>
                  HASH:{entry.eventHash.substring(0, 10)}...
                </span>
              </div>
              <div style={{ color: 'var(--text-primary)' }}>{entry.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

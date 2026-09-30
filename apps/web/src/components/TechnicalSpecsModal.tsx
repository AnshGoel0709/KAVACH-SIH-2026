import React from 'react';
import { Layers, X, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface ModuleStatus {
  name: string;
  status: 'REAL' | 'SIMULATED' | 'PLANNED';
  description: string;
  version?: string;
  engineId?: string;
}

interface TechnicalSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: Record<string, ModuleStatus> | null;
  uptimeSeconds?: number;
}

export const TechnicalSpecsModal: React.FC<TechnicalSpecsModalProps> = ({
  isOpen,
  onClose,
  modules,
  uptimeSeconds,
}) => {
  if (!isOpen) return null;

  const renderBadge = (status: 'REAL' | 'SIMULATED' | 'PLANNED') => {
    switch (status) {
      case 'REAL':
        return (
          <span className="badge-tag badge-online">
            <CheckCircle size={11} /> REAL (ACTIVE)
          </span>
        );
      case 'SIMULATED':
        return (
          <span className="badge-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', border: '1px solid var(--accent-amber)' }}>
            <AlertTriangle size={11} /> DEMO ADAPTER
          </span>
        );
      case 'PLANNED':
        return (
          <span className="badge-tag" style={{ background: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', border: '1px solid #475569' }}>
            <Clock size={11} /> PLANNED
          </span>
        );
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '840px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Layers size={18} color="var(--accent-cyan)" />
            <span>SYSTEM ARCHITECTURE &bull; TECHNICAL MATURITY LEDGER</span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Kavach enforces an unbreachable privacy perimeter separating the browser automation session
            from visual AI reasoning. Branded TypeScript nominal types (
            <code className="mono">RawBrowserFrame</code> vs <code className="mono">SanitizedFrame</code>)
            prevent compile-time raw frame leakage, while runtime SHA-256 verification hashes guarantee pixel payload integrity.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Subsystem Maturity Ledger
            </span>

            {modules ? (
              Object.entries(modules).map(([key, mod]) => (
                <div
                  key={key}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="mono" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {mod.name}
                      </span>
                      {mod.version && (
                        <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          v{mod.version}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {mod.description}
                    </div>
                  </div>
                  <div>{renderBadge(mod.status)}</div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Loading subsystem states...</p>
            )}
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Gateway Uptime: {uptimeSeconds ?? 0}s &bull; Environment: Windows Node.js 24</span>
            <span style={{ color: 'var(--accent-cyan)' }}>Strict Type Branding Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

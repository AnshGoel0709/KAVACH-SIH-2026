import React from 'react';
import { Layers, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface ModuleStatus {
  name: string;
  status: 'REAL' | 'SIMULATED' | 'PLANNED';
  description: string;
  version?: string;
  engineId?: string;
}

interface SystemStatusGridProps {
  modules: Record<string, ModuleStatus> | null;
}

export const SystemStatusGrid: React.FC<SystemStatusGridProps> = ({ modules }) => {
  if (!modules) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Layers size={18} />
            System Architecture Status
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading system modules...</p>
      </div>
    );
  }

  const renderBadge = (status: 'REAL' | 'SIMULATED' | 'PLANNED') => {
    switch (status) {
      case 'REAL':
        return (
          <span className="badge badge-live">
            <CheckCircle size={12} /> REAL (ACTIVE)
          </span>
        );
      case 'SIMULATED':
        return (
          <span className="badge badge-warning">
            <AlertTriangle size={12} /> SIMULATED SCAFFOLD
          </span>
        );
      case 'PLANNED':
        return (
          <span className="badge badge-simulated">
            <Clock size={12} /> PLANNED (NEXT TASK)
          </span>
        );
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Layers size={18} />
          Architectural Modules &amp; Maturity Ledger
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          SIH Prototype Integrity Check
        </span>
      </div>

      <div className="module-list">
        {Object.entries(modules).map(([key, mod]) => (
          <div key={key} className="module-item">
            <div className="module-left">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="module-name mono">{mod.name}</span>
                {mod.version && (
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    v{mod.version}
                  </span>
                )}
              </div>
              <span className="module-description">{mod.description}</span>
            </div>
            <div>{renderBadge(mod.status)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

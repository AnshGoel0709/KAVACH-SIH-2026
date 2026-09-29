import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

interface HeaderProps {
  apiOnline: boolean;
  uptimeSeconds?: number;
}

export const Header: React.FC<HeaderProps> = ({ apiOnline, uptimeSeconds }) => {
  return (
    <header className="header-bar">
      <div className="brand-wrapper">
        <div className="brand-icon-box">
          <ShieldCheck size={26} />
        </div>
        <div>
          <h1 className="brand-title">
            DRISHTI <span style={{ color: 'var(--accent-cyan)' }}>//</span> ARCHITECTURE SKELETON
          </h1>
          <p className="brand-subtitle">
            Smart India Hackathon 2026 Prototype &bull; Team Aurelis &bull; Privacy-Preserving Vision Agent
          </p>
        </div>
      </div>

      <div className="header-status-group">
        <div className={`badge ${apiOnline ? 'badge-live' : 'badge-warning'}`}>
          <span className="pulse-dot" />
          {apiOnline ? 'API GATEWAY ONLINE' : 'DISCONNECTED'}
        </div>

        {uptimeSeconds !== undefined && (
          <div className="badge badge-info mono">
            <Cpu size={12} />
            UPTIME: {uptimeSeconds}s
          </div>
        )}
      </div>
    </header>
  );
};

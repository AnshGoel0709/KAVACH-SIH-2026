import React from 'react';
import { ArrowRight, ShieldAlert, CheckCircle2, Eye, Lock, Globe } from 'lucide-react';

export const PrivacyPipelineBanner: React.FC = () => {
  return (
    <div className="privacy-flow-panel">
      <div className="section-label">
        <Lock size={14} color="var(--accent-amber)" />
        Core Architecture &bull; The Strict Privacy Perimeter
      </div>

      <div className="flow-nodes">
        {/* Node 1: Browser Session */}
        <div className="flow-node">
          <div className="node-title">
            <span>1. Browser Session</span>
            <Globe size={16} color="var(--accent-cyan)" />
          </div>
          <div className="node-desc">
            Local browser viewport with unredacted user/session state.
          </div>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            RAW PIXELS
          </span>
        </div>

        {/* Node 2: Privacy Guard (Quarantine) */}
        <div className="flow-node quarantine-zone">
          <div className="node-title" style={{ color: 'var(--accent-amber)' }}>
            <span>2. Privacy Guard</span>
            <ShieldAlert size={16} color="var(--accent-amber)" />
          </div>
          <div className="node-desc">
            Quarantine perimeter: Detects PII, secrets & sensitive areas. Applies solid masks.
          </div>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--accent-amber)' }}>
            BOUNDARY ENFORCED
          </span>
        </div>

        {/* Node 3: Sanitized Frame */}
        <div className="flow-node sanitized-zone">
          <div className="node-title" style={{ color: 'var(--accent-emerald)' }}>
            <span>3. Sanitized Frame</span>
            <CheckCircle2 size={16} color="var(--accent-emerald)" />
          </div>
          <div className="node-desc">
            Branded SanitizedFrame with cryptographic SHA-256 digest proof.
          </div>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)' }}>
            VERIFIED SECURE
          </span>
        </div>

        {/* Node 4: Vision Engine */}
        <div className="flow-node">
          <div className="node-title">
            <span>4. Vision / AI</span>
            <Eye size={16} color="var(--accent-cyan)" />
          </div>
          <div className="node-desc">
            Strictly accepts SanitizedFrame. Zero access to raw browser buffer.
          </div>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            GROUNDING ONLY
          </span>
        </div>

        {/* Node 5: Action & Audit */}
        <div className="flow-node">
          <div className="node-title">
            <span>5. Action & Audit</span>
            <ArrowRight size={16} color="var(--text-primary)" />
          </div>
          <div className="node-desc">
            Executes targeted interaction and records immutable proof to ledger.
          </div>
          <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            HASH-CHAINED
          </span>
        </div>
      </div>
    </div>
  );
};

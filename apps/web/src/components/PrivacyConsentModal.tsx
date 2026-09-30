import React from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onDeny: () => void;
  onAllow: () => void;
  taskName?: string;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  isOpen,
  onDeny,
  onAllow,
  taskName = 'Sensitive Document Review',
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onDeny}>
      <div
        className="modal-dialog consent-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '92%',
          background: '#0d111d',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={18} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f87171', letterSpacing: '0.04em' }}>
                PRIVACY CONSENT REQUIRED
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                High-Sensitivity Access Credential Gating
              </div>
            </div>
          </div>
          <button
            onClick={onDeny}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '0.82rem', color: '#f1f5f9', lineHeight: 1.5 }}>
            Completing this task requires access to a <strong>high-sensitivity credential</strong>:
          </div>

          <div
            style={{
              background: '#070a12',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span style={{ color: '#94a3b8' }}>Entity:</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>Review Access Credential Token</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span style={{ color: '#94a3b8' }}>Sample Value:</span>
              <span className="mono" style={{ color: '#f87171', fontWeight: 700 }}>SEC-KEY-99482-X</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span style={{ color: '#94a3b8' }}>Sensitivity Level:</span>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>HIGH</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <span style={{ color: '#94a3b8' }}>Task Target:</span>
              <span style={{ color: '#38bdf8' }}>{taskName}</span>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              borderLeft: '3px solid #f59e0b',
              padding: '10px 12px',
              fontSize: '0.72rem',
              color: '#cbd5e1',
              lineHeight: 1.4,
            }}
          >
            <strong>Zero Raw Exposure Invariant:</strong> Even if consented, only this specific credential token is permitted in the sanitized frame. All unrelated sensitive information (Document Number, Officer Name, Audit Email) remains strictly masked.
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button
              onClick={onDeny}
              style={{
                flex: 1,
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <X size={14} />
              DENY &amp; CANCEL
            </button>

            <button
              onClick={onAllow}
              style={{
                flex: 1,
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Check size={14} />
              ALLOW ONCE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

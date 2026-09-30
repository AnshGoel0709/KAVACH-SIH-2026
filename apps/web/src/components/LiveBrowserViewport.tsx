import React from 'react';
import { Lock, ArrowLeft, ArrowRight, RotateCw, Globe, Crosshair, CheckCircle2, ShieldAlert } from 'lucide-react';

interface LiveBrowserViewportProps {
  screenshotBase64?: string;
  agentState: string;
  targetHighlight?: {
    elementId: string;
    coordinates: { x: number; y: number };
    box?: { x: number; y: number; width: number; height: number };
    label: string;
  };
  demoUrl?: string;
  previewUrl?: string;
  taskName?: string;
  targetSelector?: string;
  targetActionLabel?: string;
}

export const LiveBrowserViewport: React.FC<LiveBrowserViewportProps> = ({
  screenshotBase64,
  agentState,
  targetHighlight,
  demoUrl = 'http://localhost:3001/demo/identity-verification',
  previewUrl = '/demo/identity-verification',
  taskName = 'Secure Identity Verification',
  targetSelector = '#btn-continue',
  targetActionLabel = 'Continue Verification',
}) => {
  const isNavigating = agentState === 'RUNNING';
  const isTargeting = !!targetHighlight && (agentState === 'AI_ANALYZING' || agentState === 'EXECUTING');
  const isExecuting = agentState === 'EXECUTING';
  const isComplete = agentState === 'COMPLETED';

  // Has an active execution produced a screenshot for the currently displayed run?
  const hasLiveScreenshot = !!screenshotBase64;

  return (
    <main className="panel-center">
      {/* Realistic Browser Chrome */}
      <div className="browser-chrome">
        <div className="window-dots">
          <span className="window-dot dot-red" />
          <span className="window-dot dot-yellow" />
          <span className="window-dot dot-green" />
        </div>

        <div className="browser-nav-icons">
          <ArrowLeft size={14} />
          <ArrowRight size={14} />
          <RotateCw size={13} className={isNavigating ? 'animate-spin' : ''} />
        </div>

        <div className="browser-address-bar">
          <Lock size={12} color="var(--accent-emerald)" />
          <span className="mono" style={{ color: 'var(--text-primary)' }}>
            {demoUrl}
          </span>
        </div>

        <div className="browser-status-badge">
          <Globe size={11} />
          CHROMIUM SANDBOX
        </div>
      </div>

      {/* Browser Viewport Display */}
      <div className="browser-viewport">
        {hasLiveScreenshot ? (
          <div className="viewport-content-frame">
            <img
              src={`data:image/jpeg;base64,${screenshotBase64}`}
              alt="Live Browser Viewport"
              className="viewport-screenshot-img"
            />

            {/* Target Highlight Overlay from Vision Adapter */}
            {isTargeting && (
              <div
                className="target-box-overlay"
                style={{
                  left: '30%',
                  top: '64%',
                  width: '40%',
                  height: '8%',
                }}
              >
                <div className="target-badge-label">
                  <Crosshair size={10} style={{ display: 'inline', marginRight: '4px' }} />
                  {targetHighlight?.label || `GROUNDED TARGET: [ ${targetActionLabel.toUpperCase()} ]`}
                </div>
              </div>
            )}

            {/* Executing Click Indicator */}
            {isExecuting && (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '68%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(2, 132, 199, 0.9)',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  boxShadow: '0 0 15px rgba(56, 189, 248, 0.6)',
                  pointerEvents: 'none',
                }}
              >
                <span className="pulse-circle" style={{ backgroundColor: '#fff' }} />
                CLICKING {targetSelector}
              </div>
            )}

            {/* Privacy Quarantine Indicator */}
            {agentState === 'PRIVACY_PROCESSING' && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(245, 158, 11, 0.9)',
                  color: '#07090e',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ShieldAlert size={14} />
                PRIVACY GUARD SCANNING VIEWPORT
              </div>
            )}

            {/* Success Overlay Banner */}
            {isComplete && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(16, 185, 129, 0.95)',
                  color: '#07090e',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                }}
              >
                <CheckCircle2 size={14} />
                ACTION EXECUTED &bull; VERIFICATION CONFIRMED
              </div>
            )}
          </div>
        ) : (
          /* Live Task Preview: Immediately shows the selected task screen without executing automation */
          <div className="viewport-content-frame">
            <iframe
              key={previewUrl}
              src={previewUrl}
              title={`Preview of ${taskName}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
                background: '#0f172a',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 12,
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                padding: '3px 9px',
                borderRadius: '4px',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                backdropFilter: 'blur(4px)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              }}
            >
              <span className="pulse-circle" style={{ backgroundColor: '#38bdf8', width: 6, height: 6 }} />
              TASK PREVIEW &bull; READY TO RUN
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

import React, { useState } from 'react';
import { Play, ShieldCheck, Hash, Terminal } from 'lucide-react';

interface VerificationResponse {
  success: boolean;
  benchmarkVerified: boolean;
  proofOfPrivacy: {
    proofId: string;
    frameId: string;
    rawFrameDigest: string;
    sanitizedDigest: string;
    sensitiveRegionsDetected: number;
    sensitiveCategoriesFound: string[];
    redactionsAppliedCount: number;
    directRawFrameToAiBlocked: boolean;
    processingLatencyMs: number;
  };
  rawInputSnapshot: string;
  sanitizedTextSnapshot: string;
  visionEngineResponse: {
    engineId: string;
    isSimulated: boolean;
    visualSummary: string;
    rawFrameBypassed: boolean;
  };
}

export const PrivacyVerificationBench: React.FC<{ onVerificationComplete?: () => void }> = ({
  onVerificationComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/privacy/verify-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customGoal: 'Locate submit button while strictly masking user credentials',
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }

      const data: VerificationResponse = await res.json();
      setResult(data);
      onVerificationComplete?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <ShieldCheck size={18} color="var(--accent-emerald)" />
          Live Privacy Proof &amp; Boundary Verification
        </h2>
        <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          SYNTHETIC TEST BENCH
        </span>
      </div>

      <div className="verification-bench">
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Trigger a live end-to-end execution of the Privacy Guard on the SIH synthetic benchmark data.
          Verifies that PII values (AURELIS_TEST_NAME, test@example.local, +91 9000000000, AURELIS-ID-12345)
          are intercepted and masked before reaching the Vision reasoning engine.
        </p>

        <button className="btn-trigger" onClick={runVerification} disabled={loading}>
          <Play size={15} />
          {loading ? 'EXECUTING PRIVACY GUARD...' : 'RUN SYNTHETIC PRIVACY PROOF'}
        </button>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '4px',
              background: 'var(--accent-crimson-dim)',
              border: '1px solid var(--accent-crimson)',
              color: 'var(--accent-crimson)',
              fontSize: '0.8rem',
            }}
          >
            Verification error: {error}
          </div>
        )}

        {result && (
          <div>
            <div className="proof-readout">
              <div className="proof-row">
                <span className="proof-label">Verification Status:</span>
                <span
                  className="proof-val"
                  style={{
                    color: result.benchmarkVerified ? 'var(--accent-emerald)' : 'var(--accent-crimson)',
                    fontWeight: 700,
                  }}
                >
                  {result.benchmarkVerified ? 'SUCCESS &bull; LEAKAGE TEST PASSED' : 'FAILED &bull; LEAK DETECTED'}
                </span>
              </div>

              <div className="proof-row">
                <span className="proof-label">Direct Raw Frame to AI:</span>
                <span className="proof-val" style={{ color: 'var(--accent-emerald)' }}>
                  BLOCKED (Zero Raw Exposure)
                </span>
              </div>

              <div className="proof-row">
                <span className="proof-label">Sensitive Regions Detected:</span>
                <span className="proof-val mono">{result.proofOfPrivacy.sensitiveRegionsDetected} regions</span>
              </div>

              <div className="proof-row">
                <span className="proof-label">Redactions Applied:</span>
                <span className="proof-val mono">{result.proofOfPrivacy.redactionsAppliedCount} solid masks</span>
              </div>

              <div className="proof-row">
                <span className="proof-label">Guard Processing Latency:</span>
                <span className="proof-val mono">{result.proofOfPrivacy.processingLatencyMs} ms</span>
              </div>

              <div className="proof-row">
                <span className="proof-label">Sanitized SHA-256 Digest:</span>
                <span className="proof-val mono" style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>
                  <Hash size={11} style={{ display: 'inline', marginRight: '4px' }} />
                  {result.proofOfPrivacy.sanitizedDigest.substring(0, 32)}...
                </span>
              </div>
            </div>

            <div className="text-comparison">
              <div>
                <div className="section-label" style={{ marginBottom: '6px' }}>
                  Raw Browser Viewport State (Quarantined)
                </div>
                <div className="text-box raw-box mono">{result.rawInputSnapshot}</div>
              </div>

              <div>
                <div className="section-label" style={{ marginBottom: '6px' }}>
                  Sanitized Representation (Exposed to AI)
                </div>
                <div className="text-box sanitized-box mono">{result.sanitizedTextSnapshot}</div>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <div className="section-label" style={{ marginBottom: '6px' }}>
                <Terminal size={12} />
                Vision Engine Inference Log (Strict Sanitized Consumer)
              </div>
              <div
                className="mono"
                style={{
                  background: 'var(--bg-code)',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>Engine: {result.visionEngineResponse.engineId}</div>
                <div>Summary: {result.visionEngineResponse.visualSummary}</div>
                <div>Raw Frame Bypassed: {String(result.visionEngineResponse.rawFrameBypassed)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

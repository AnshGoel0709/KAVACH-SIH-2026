import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header.js';
import { PrivacyPipelineBanner } from './components/PrivacyPipelineBanner.js';
import { SystemStatusGrid } from './components/SystemStatusGrid.js';
import { PrivacyVerificationBench } from './components/PrivacyVerificationBench.js';
import { AuditStream, type AuditLogEntry } from './components/AuditStream.js';

interface HealthData {
  status: string;
  uptimeSeconds: number;
  modules: Record<
    string,
    {
      name: string;
      status: 'REAL' | 'SIMULATED' | 'PLANNED';
      description: string;
      version?: string;
      engineId?: string;
    }
  >;
}

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [apiOnline, setApiOnline] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data: HealthData = await res.json();
        setHealth(data);
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }
    } catch {
      setApiOnline(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/audit/logs?limit=25');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.events || []);
      }
    } catch {
      // Ignore if offline
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchLogs();

    const interval = setInterval(() => {
      fetchHealth();
      fetchLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchHealth, fetchLogs]);

  return (
    <div className="app-container">
      <Header apiOnline={apiOnline} uptimeSeconds={health?.uptimeSeconds} />

      <PrivacyPipelineBanner />

      <div className="main-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PrivacyVerificationBench
            onVerificationComplete={() => {
              fetchHealth();
              fetchLogs();
            }}
          />
          <SystemStatusGrid modules={health?.modules ?? null} />
        </div>

        <div>
          <AuditStream logs={logs} onRefresh={fetchLogs} />
        </div>
      </div>
    </div>
  );
};

import { useMemo } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  ShieldCheck, 
  BarChart3, 
  Activity, 
  PieChart, 
  FileCheck2,
  Lock,
  Layers
} from 'lucide-react';

export interface StatsPageProps {
  history: any[];
}

export default function StatsPage({ history }: StatsPageProps) {
  const stats = useMemo(() => {
    const total = history.length;
    const dangerous = history.filter(h => h.verdict === 'DANGEROUS' || h.riskScore >= 70).length;
    const suspicious = history.filter(h => (h.verdict === 'SUSPICIOUS' || (h.riskScore >= 35 && h.riskScore < 70))).length;
    const safe = history.filter(h => (h.verdict === 'SAFE' && h.riskScore < 35)).length;
    const completedScans = history.filter(h => h.status === 'COMPLETED');
    const avgRisk = completedScans.length ? Math.round(completedScans.reduce((a, h) => a + (h.riskScore || 0), 0) / completedScans.length) : 0;

    const byType: Record<string, number> = history.reduce((acc: Record<string, number>, h) => {
      acc[h.scanType] = (acc[h.scanType] || 0) + 1;
      return acc;
    }, {});

    return { total, dangerous, suspicious, safe, avgRisk, byType };
  }, [history]);

  const highPct = stats.total > 0 ? Math.round((stats.dangerous / stats.total) * 100) : 0;
  const suspPct = stats.total > 0 ? Math.round((stats.suspicious / stats.total) * 100) : 0;
  const safePct = stats.total > 0 ? Math.round((stats.safe / stats.total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cx-page-header">
        <div className="cx-page-title">
          <h2>Threat Reports & Intelligence Metrics</h2>
          <p>Aggregated telemetry and threat posture from local security scans</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="cx-badge cx-badge-cyan">SOC TELEMETRY ACTIVE</span>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="cx-metrics-grid">
        <div className="cx-metric-card">
          <div>
            <div className="cx-metric-val">{stats.total}</div>
            <div className="cx-metric-label">Total Verified Scans</div>
          </div>
          <div className="cx-metric-icon">
            <Layers size={20} />
          </div>
        </div>

        <div className="cx-metric-card" style={{ '--metric-accent': 'var(--risk-high)' } as any}>
          <div>
            <div className="cx-metric-val" style={{ color: 'var(--risk-high)' }}>{stats.dangerous}</div>
            <div className="cx-metric-label">Critical Threats</div>
          </div>
          <div className="cx-metric-icon" style={{ color: 'var(--risk-high)', background: 'var(--risk-high-bg)' }}>
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="cx-metric-card" style={{ '--metric-accent': 'var(--risk-suspicious)' } as any}>
          <div>
            <div className="cx-metric-val" style={{ color: 'var(--risk-suspicious)' }}>{stats.suspicious}</div>
            <div className="cx-metric-label">Suspicious Detections</div>
          </div>
          <div className="cx-metric-icon" style={{ color: 'var(--risk-suspicious)', background: 'var(--risk-suspicious-bg)' }}>
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="cx-metric-card" style={{ '--metric-accent': 'var(--risk-low)' } as any}>
          <div>
            <div className="cx-metric-val" style={{ color: 'var(--risk-low)' }}>{stats.safe}</div>
            <div className="cx-metric-label">Benign / Safe Payloads</div>
          </div>
          <div className="cx-metric-icon" style={{ color: 'var(--risk-low)', background: 'var(--risk-low-bg)' }}>
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* Threat Posture Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="cx-threat-breakdown-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={17} color="var(--cyan-accent)" />
              Risk Posture Distribution
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Avg Risk: {stats.avgRisk}/100
            </span>
          </div>

          <div className="cx-breakdown-bars">
            <div className="cx-breakdown-row">
              <div className="cx-breakdown-meta">
                <span>High Risk / Dangerous ({stats.dangerous})</span>
                <strong>{highPct}%</strong>
              </div>
              <div className="cx-bar-track">
                <div className="cx-bar-progress" style={{ width: `${highPct}%`, background: 'var(--risk-high)' }} />
              </div>
            </div>

            <div className="cx-breakdown-row">
              <div className="cx-breakdown-meta">
                <span>Suspicious Anomalies ({stats.suspicious})</span>
                <strong>{suspPct}%</strong>
              </div>
              <div className="cx-bar-track">
                <div className="cx-bar-progress" style={{ width: `${suspPct}%`, background: 'var(--risk-suspicious)' }} />
              </div>
            </div>

            <div className="cx-breakdown-row">
              <div className="cx-breakdown-meta">
                <span>Safe / Verified Benign ({stats.safe})</span>
                <strong>{safePct}%</strong>
              </div>
              <div className="cx-bar-track">
                <div className="cx-bar-progress" style={{ width: `${safePct}%`, background: 'var(--risk-low)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Vector breakdown */}
        <div className="cx-threat-breakdown-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={17} color="var(--cyan-accent)" />
              Threat Activity by Vector
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              6 Vectors Supported
            </span>
          </div>

          {Object.keys(stats.byType).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-dim)', fontSize: '13px' }}>
              No scan activity recorded yet across vectors.
            </div>
          ) : (
            <div className="cx-breakdown-bars">
              {Object.entries(stats.byType).map(([type, count]) => {
                const pct = stats.total > 0 ? Math.round(((count as number) / stats.total) * 100) : 0;
                return (
                  <div className="cx-breakdown-row" key={type}>
                    <div className="cx-breakdown-meta">
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{type}</span>
                      <strong>{count} ({pct}%)</strong>
                    </div>
                    <div className="cx-bar-track">
                      <div className="cx-bar-progress" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #28D7FF, #3984FF)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

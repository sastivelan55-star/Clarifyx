import { useMemo } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  ArrowUpRight, 
  Clock, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Scanner, { SCAN_MODES } from '../components/Scanner';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface DashboardProps {
  history: any[];
  onScanCompleted: () => void;
  onSelectScanner: (modeId: string) => void;
}

export default function Dashboard({ history, onScanCompleted, onSelectScanner }: DashboardProps) {
  // Aggregate real telemetry metrics from history
  const metrics = useMemo(() => {
    const total = history.length;
    const highRisk = history.filter(h => h.verdict === 'DANGEROUS' || h.riskScore >= 70).length;
    const suspicious = history.filter(h => h.verdict === 'SUSPICIOUS' || (h.riskScore >= 35 && h.riskScore < 70)).length;
    const lowRisk = history.filter(h => h.verdict === 'SAFE' && h.riskScore < 35).length;
    return { total, highRisk, suspicious, lowRisk };
  }, [history]);

  // Recent 5 scans
  const recentScans = history.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Title & Status */}
      <div className="cx-page-header">
        <div className="cx-page-title">
          <h2>Security Operations Center</h2>
          <p>Real-time threat intelligence, multi-vector payload inspection, and cyber defense overview</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="cx-badge cx-badge-low">
            <span className="cx-soc-pulse" style={{ width: 6, height: 6 }}></span>
            SYSTEM ONLINE
          </span>
          <span className="cx-badge cx-badge-cyan">
            V2.0 ENTERPRISE
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="cx-metrics-grid">
        <div className="cx-metric-card">
          <div>
            <div className="cx-metric-val">{metrics.total}</div>
            <div className="cx-metric-label">Total Verified Scans</div>
          </div>
          <div className="cx-metric-icon">
            <Layers size={20} />
          </div>
        </div>

        <div className="cx-metric-card" style={{ '--metric-accent': 'var(--risk-high)' } as any}>
          <div>
            <div className="cx-metric-val" style={{ color: 'var(--risk-high)' }}>{metrics.highRisk}</div>
            <div className="cx-metric-label">High-Risk Detections</div>
          </div>
          <div className="cx-metric-icon" style={{ color: 'var(--risk-high)', background: 'var(--risk-high-bg)', borderColor: 'var(--risk-high-border)' }}>
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="cx-metric-card" style={{ '--metric-accent': 'var(--risk-suspicious)' } as any}>
          <div>
            <div className="cx-metric-val" style={{ color: 'var(--risk-suspicious)' }}>{metrics.suspicious}</div>
            <div className="cx-metric-label">Suspicious Items</div>
          </div>
          <div className="cx-metric-icon" style={{ color: 'var(--risk-suspicious)', background: 'var(--risk-suspicious-bg)', borderColor: 'var(--risk-suspicious-border)' }}>
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="cx-metric-card" style={{ '--metric-accent': 'var(--risk-low)' } as any}>
          <div>
            <div className="cx-metric-val" style={{ color: 'var(--risk-low)' }}>{metrics.lowRisk}</div>
            <div className="cx-metric-label">Low-Risk Payloads</div>
          </div>
          <div className="cx-metric-icon" style={{ color: 'var(--risk-low)', background: 'var(--risk-low-bg)', borderColor: 'var(--risk-low-border)' }}>
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* Prominent Quick-Scan Station */}
      <Scanner onScanCompleted={onScanCompleted} />

      {/* Bottom Grid: Recent Activity & Threat Posture */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Recent Activity Table */}
        <div style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: '14px',
          padding: '22px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--cyan-accent)" />
              Recent Security Audits
            </h3>
            <Link to="/history" style={{ color: 'var(--cyan-accent)', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all ({history.length}) <ChevronRight size={14} />
            </Link>
          </div>

          {recentScans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-dim)', fontSize: '13px' }}>
              No recent scans recorded. Use the Quick-Scan station above to run an analysis.
            </div>
          ) : (
            <div className="cx-table-wrap">
              <table className="cx-table">
                <thead>
                  <tr>
                    <th>Vector</th>
                    <th>Target Payload</th>
                    <th>Score</th>
                    <th>Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {recentScans.map(scan => {
                    const score = scan.riskScore !== undefined ? scan.riskScore : (scan.Result?.data?.score || 0);
                    const verdict = (scan.verdict || scan.Result?.data?.verdict || 'UNKNOWN').toUpperCase();
                    const isHigh = verdict === 'DANGEROUS' || score >= 70;
                    const isSuspicious = verdict === 'SUSPICIOUS' || (score >= 35 && score < 70);

                    let badgeVariant: 'danger' | 'warning' | 'success' | 'demo' = 'success';
                    let label = 'LOW RISK';
                    if (isHigh) { badgeVariant = 'danger'; label = 'HIGH RISK'; }
                    else if (isSuspicious) { badgeVariant = 'warning'; label = 'SUSPICIOUS'; }
                    else if (verdict === 'UNKNOWN' || verdict === 'DEMO_RESULT_ONLY') { badgeVariant = 'demo'; label = 'DEMO'; }

                    const target = scan.Result?.metadata?.target || scan.Result?.metadata?.input || scan.Result?.metadata?.fileKey || scan.scanType;

                    return (
                      <tr key={scan.id}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cyan-accent)' }}>
                            {scan.scanType}
                          </span>
                        </td>
                        <td style={{ maxWidth: '240px' }}>
                          <span style={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: '#fff',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px'
                          }} title={target}>
                            {target}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: '13px',
                            color: isHigh ? 'var(--risk-high)' : isSuspicious ? 'var(--risk-suspicious)' : 'var(--risk-low)'
                          }}>
                            {scan.status === 'COMPLETED' ? `${score}/100` : scan.status}
                          </span>
                        </td>
                        <td>
                          <Badge variant={badgeVariant}>{label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Threat Distribution Breakdown */}
        <div className="cx-threat-breakdown-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="var(--cyan-accent)" />
              Observed Risk Distribution
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              REAL TELEMETRY
            </span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Breakdown based on {metrics.total} verified target scans executed across all input vectors.
          </p>

          <div className="cx-breakdown-bars">
            <div className="cx-breakdown-row">
              <div className="cx-breakdown-meta">
                <span>Critical Threats</span>
                <strong>{metrics.highRisk}</strong>
              </div>
              <div className="cx-bar-track">
                <div
                  className="cx-bar-progress"
                  style={{
                    width: `${metrics.total ? (metrics.highRisk / metrics.total) * 100 : 0}%`,
                    background: 'var(--risk-high)'
                  }}
                />
              </div>
            </div>

            <div className="cx-breakdown-row">
              <div className="cx-breakdown-meta">
                <span>Suspicious Anomalies</span>
                <strong>{metrics.suspicious}</strong>
              </div>
              <div className="cx-bar-track">
                <div
                  className="cx-bar-progress"
                  style={{
                    width: `${metrics.total ? (metrics.suspicious / metrics.total) * 100 : 0}%`,
                    background: 'var(--risk-suspicious)'
                  }}
                />
              </div>
            </div>

            <div className="cx-breakdown-row">
              <div className="cx-breakdown-meta">
                <span>Verified Benign / Safe</span>
                <strong>{metrics.lowRisk}</strong>
              </div>
              <div className="cx-bar-track">
                <div
                  className="cx-bar-progress"
                  style={{
                    width: `${metrics.total ? (metrics.lowRisk / metrics.total) * 100 : 0}%`,
                    background: 'var(--risk-low)'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', padding: '12px', background: '#060910', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '11px' }}>
              <Cpu size={14} color="var(--cyan-accent)" />
              <span>Multi-layer heuristic rules and NLP threat vectors calibrated for SOC operations.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

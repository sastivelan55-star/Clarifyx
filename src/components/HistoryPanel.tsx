import { useState, useMemo } from 'react';
import { 
  Link2, MessageSquare, Image as ImageIcon, Video, History as HistoryIcon, 
  Trash2, Filter, Mic, Newspaper, ArrowUpRight, ShieldCheck, AlertTriangle, ShieldAlert
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

const TYPE_ICONS: Record<string, React.ElementType> = {
  URL: Link2,
  MESSAGE: MessageSquare,
  IMAGE: ImageIcon,
  VIDEO: Video,
  VOICE: Mic,
  FAKE_NEWS: Newspaper
};

export interface HistoryPanelProps {
  history: any[];
  removeEntry: (id: string) => void;
  onSelectScan?: (scan: any) => void;
}

export default function HistoryPanel({ history, removeEntry, onSelectScan }: HistoryPanelProps) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchesFilter = 
        filter === 'ALL' ? true :
        filter === 'HIGH' ? (item.verdict === 'DANGEROUS' || item.riskScore >= 70) :
        filter === 'SUSPICIOUS' ? (item.verdict === 'SUSPICIOUS' || (item.riskScore >= 35 && item.riskScore < 70)) :
        filter === 'LOW' ? (item.verdict === 'SAFE' && item.riskScore < 35) : true;

      const label = item.Result?.metadata?.target || item.Result?.metadata?.input || item.Result?.metadata?.fileKey || item.scanType || '';
      const matchesSearch = search ? label.toLowerCase().includes(search.toLowerCase()) : true;

      return matchesFilter && matchesSearch;
    });
  }, [history, filter, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="cx-page-header">
        <div className="cx-page-title">
          <h2>Scan History & Audit Trail</h2>
          <p>Chronological record of verified payloads, risk ratings, and security telemetry</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className="cx-badge cx-badge-cyan">
            {history.length} Total Records
          </span>
        </div>
      </div>

      {/* Filters and search toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '16px 20px',
        background: 'var(--panel-bg)',
        border: '1px solid var(--panel-border)',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={15} color="var(--text-dim)" />
          {['ALL', 'HIGH', 'SUSPICIOUS', 'LOW'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              style={{
                background: filter === lvl ? 'linear-gradient(135deg, rgba(40, 215, 255, 0.2), rgba(57, 132, 255, 0.1))' : '#060910',
                border: `1px solid ${filter === lvl ? 'var(--cyan-accent)' : 'var(--panel-border)'}`,
                color: filter === lvl ? '#fff' : 'var(--text-muted)',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {lvl === 'ALL' ? 'All Risks' : lvl === 'HIGH' ? 'High Risk' : lvl === 'SUSPICIOUS' ? 'Suspicious' : 'Low Risk'}
            </button>
          ))}
        </div>

        <div style={{ minWidth: '240px' }}>
          <input
            className="cx-text-input"
            style={{ padding: '7px 12px', fontSize: '12px' }}
            placeholder="Filter by target or filename…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* History Table */}
      {filteredHistory.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: '12px'
        }}>
          <HistoryIcon size={44} color="var(--text-dim)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ color: '#fff', fontSize: '16px' }}>No scan records located</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            {history.length === 0 ? 'No target payloads have been processed yet. Initiate a scan above.' : 'Try adjusting your risk filters or search query.'}
          </p>
        </div>
      ) : (
        <div className="cx-table-wrap">
          <table className="cx-table">
            <thead>
              <tr>
                <th>Vector</th>
                <th>Target Payload</th>
                <th>Risk Score</th>
                <th>Classification</th>
                <th>Timestamp</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(item => {
                const scanType = item.scanType || 'URL';
                const IconComponent = TYPE_ICONS[scanType] || Link2;
                const score = item.riskScore !== undefined ? item.riskScore : (item.Result?.data?.score || 0);
                const verdict = (item.verdict || item.Result?.data?.verdict || 'UNKNOWN').toUpperCase();

                const isHigh = verdict === 'DANGEROUS' || score >= 70;
                const isSuspicious = verdict === 'SUSPICIOUS' || (score >= 35 && score < 70);

                let badgeVariant: 'danger' | 'warning' | 'success' | 'demo' = 'success';
                let label = 'LOW RISK';
                if (isHigh) { badgeVariant = 'danger'; label = 'HIGH RISK'; }
                else if (isSuspicious) { badgeVariant = 'warning'; label = 'SUSPICIOUS'; }
                else if (verdict === 'UNKNOWN' || verdict === 'DEMO_RESULT_ONLY') { badgeVariant = 'demo'; label = 'DEMO ONLY'; }

                const targetName = item.Result?.metadata?.target || item.Result?.metadata?.input || item.Result?.metadata?.fileKey || 'Direct Scan';
                const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent';

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: '#0E1626',
                          border: '1px solid var(--panel-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--cyan-accent)'
                        }}>
                          <IconComponent size={14} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{scanType}</span>
                      </div>
                    </td>

                    <td style={{ maxWidth: '380px' }}>
                      <span style={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: '#fff'
                      }} title={targetName}>
                        {targetName}
                      </span>
                    </td>

                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: isHigh ? 'var(--risk-high)' : isSuspicious ? 'var(--risk-suspicious)' : 'var(--risk-low)'
                      }}>
                        {item.status === 'COMPLETED' ? `${score}/100` : item.status}
                      </span>
                    </td>

                    <td>
                      <Badge variant={badgeVariant}>{label}</Badge>
                    </td>

                    <td style={{ color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                      {dateStr}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => removeEntry(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '4px'
                        }}
                        title="Delete scan"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

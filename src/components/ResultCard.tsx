import { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  HelpCircle, 
  Info, 
  Copy, 
  Check, 
  FileCheck2, 
  Download,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export interface ResultCardProps {
  result: any;
  target?: string;
  scanType?: string;
  onProceed?: () => void;
}

export default function ResultCard({ result, target, scanType, onProceed }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const score = typeof result.score === 'number' ? result.score : (result.riskScore || 0);
  const rawVerdict = (result.level || result.verdict || 'UNKNOWN').toUpperCase();
  
  // Categorize tone cleanly
  let toneClass = 'tone-low';
  let statusBadgeVariant: 'success' | 'warning' | 'danger' | 'demo' = 'success';
  let StatusIcon = ShieldCheck;
  let verdictLabel = 'LOW RISK';

  if (rawVerdict === 'DANGEROUS' || rawVerdict === 'HIGH' || score >= 70) {
    toneClass = 'tone-high';
    statusBadgeVariant = 'danger';
    StatusIcon = ShieldAlert;
    verdictLabel = 'HIGH RISK';
  } else if (rawVerdict === 'SUSPICIOUS' || rawVerdict === 'MEDIUM' || (score >= 35 && score < 70)) {
    toneClass = 'tone-suspicious';
    statusBadgeVariant = 'warning';
    StatusIcon = AlertTriangle;
    verdictLabel = 'SUSPICIOUS';
  } else if (rawVerdict === 'UNKNOWN' || rawVerdict === 'DEMO_RESULT_ONLY' || rawVerdict === 'UNABLE_TO_VERIFY') {
    toneClass = 'tone-suspicious';
    statusBadgeVariant = 'demo';
    StatusIcon = HelpCircle;
    verdictLabel = rawVerdict.replace(/_/g, ' ');
  }

  // Confidence & Mode indicators
  const confidence = result.confidence !== undefined ? Math.round(result.confidence * 100) : null;
  const mode = result.mode || (scanType === 'URL' || scanType === 'MESSAGE' ? 'HEURISTIC' : 'DEMO_MODE');

  // Indicators / Signals
  const indicators = result.indicators || result.factors || [];
  if (indicators.length === 0 && result.explanation) {
    indicators.push({ category: 'ANALYSIS', description: result.explanation });
  }

  const handleCopyReport = () => {
    const reportSummary = `ClarifyX 2.0 Security Report
Target: ${target || 'N/A'}
Scan Type: ${scanType || 'N/A'}
Verdict: ${verdictLabel}
Risk Score: ${score}/100
Confidence: ${confidence !== null ? confidence + '%' : 'N/A'}
Mode: ${mode}
Signals:
${indicators.map((ind: any, i: number) => ` - [${typeof ind === 'object' ? ind.category || 'SIGNAL' : 'SIGNAL'}] ${typeof ind === 'string' ? ind : ind.description}`).join('\n')}
Recommendation: ${result.recommendation || 'Stay vigilant.'}`;

    navigator.clipboard.writeText(reportSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className={`cx-result-panel ${toneClass}`}>
      <div className="cx-result-header">
        <div className="cx-verdict-banner">
          <div className="cx-verdict-icon">
            <StatusIcon size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="cx-verdict-title">{verdictLabel}</h3>
              <Badge variant={statusBadgeVariant}>{verdictLabel}</Badge>
              {mode && (
                <span className="cx-badge cx-badge-demo" style={{ fontSize: '10px' }}>
                  {mode}
                </span>
              )}
            </div>
            <p className="cx-verdict-subtitle">
              {target ? `Analysis for: ${target.slice(0, 50)}${target.length > 50 ? '...' : ''}` : 'Threat analysis complete'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {confidence !== null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--cyan-accent)' }}>
                {confidence}%
              </div>
              <div className="cx-score-label">Confidence</div>
            </div>
          )}
          <div className="cx-score-gauge">
            <div className="cx-score-val">{score}<span style={{ fontSize: '16px', color: 'var(--text-dim)' }}>/100</span></div>
            <div className="cx-score-label">Risk Rating</div>
          </div>
        </div>
      </div>

      {/* Threat Bar */}
      <div className="cx-threat-meter">
        <div className="cx-threat-fill" style={{ width: `${Math.max(score, 5)}%` }} />
      </div>

      {/* Signals / Findings */}
      {indicators.length > 0 && (
        <div className="cx-signals-section">
          <div className="cx-signals-title">Observed Signals & Heuristic Indicators</div>
          {indicators.map((ind: any, idx: number) => {
            const category = typeof ind === 'object' ? (ind.category || 'SIGNAL') : 'SIGNAL';
            const desc = typeof ind === 'string' ? ind : (ind.description || JSON.stringify(ind));
            return (
              <div key={idx} className="cx-signal-card">
                <span className="cx-signal-category">{category}</span>
                <span style={{ color: 'var(--text-main)', flex: 1 }}>{desc}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* SOC Recommended Action */}
      <div className="cx-recommendation-box">
        <Info size={18} style={{ color: 'var(--cyan-accent)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1 }}>
          <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>
            Recommended Security Action
          </strong>
          <span style={{ color: 'var(--text-muted)' }}>
            {result.recommendation || (
              toneClass === 'tone-high'
                ? 'Isolate this asset immediately. Do not provide credentials, personal identity, or execute instructions.'
                : toneClass === 'tone-suspicious'
                ? 'Proceed with caution. Validate certificate authenticity or source identity out-of-band before taking action.'
                : 'Asset exhibits typical safe traits under standard heuristic evaluation. Continue routine operation.'
            )}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--panel-border)' }}>
        <Button variant="secondary" onClick={handleCopyReport} style={{ fontSize: '12px' }}>
          {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
          <span>{copied ? 'Report Copied to Clipboard' : 'Copy SOC Report'}</span>
        </Button>

        {onProceed && toneClass !== 'tone-high' && (
          <Button variant="ghost" onClick={onProceed} style={{ fontSize: '12px' }}>
            Acknowledge & Continue
          </Button>
        )}
      </div>
    </div>
  );
}

import { RiskLevel } from '../../types';

export interface RiskScoreProps {
  riskScore: number;
  riskLevel: RiskLevel;
}

/**
 * Reusable component for displaying risk scores and levels clearly.
 */
export function RiskScore({ riskScore, riskLevel }: RiskScoreProps) {
  const color = riskLevel === 'Dangerous' ? '#b52f37' : riskLevel === 'Suspicious' ? '#d3951b' : '#35a85d';
  return (
    <div className="risk-score-display" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: `1px solid ${color}`, padding: '4px 8px', borderRadius: '8px', color }}>
      <span style={{ fontSize: '12px', fontWeight: 600 }}>{riskLevel}</span>
      <strong style={{ fontSize: '16px' }}>{riskScore}/100</strong>
    </div>
  );
}

import { useParams } from 'react-router-dom';
import Scanner, { SCAN_MODES } from '../components/Scanner';
import { 
  Link2, MessageSquare, Image as ImageIcon, Video, Mic, Newspaper,
  ShieldCheck, Info, CheckCircle2, Shield
} from 'lucide-react';

interface ScannerPageProps {
  onScanCompleted: () => void;
}

export default function ScannerPage({ onScanCompleted }: ScannerPageProps) {
  const { type } = useParams<{ type: string }>();

  // Map route param to ScanType
  let initialMode = 'URL';
  if (type === 'message') initialMode = 'MESSAGE';
  else if (type === 'image') initialMode = 'IMAGE';
  else if (type === 'video') initialMode = 'VIDEO';
  else if (type === 'voice') initialMode = 'VOICE';
  else if (type === 'fake_news') initialMode = 'FAKE_NEWS';

  const modeConfig = SCAN_MODES.find(m => m.id === initialMode) || SCAN_MODES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cx-page-header">
        <div className="cx-page-title">
          <h2>{modeConfig.label}</h2>
          <p>{modeConfig.desc}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="cx-badge cx-badge-cyan">DEDICATED ANALYZER</span>
        </div>
      </div>

      {/* Target inspection workspace */}
      <Scanner initialMode={initialMode} onScanCompleted={onScanCompleted} hideHeader />

      {/* Vector capabilities & guidelines */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginTop: '12px'
      }}>
        <div style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <strong style={{ color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldCheck size={16} color="var(--cyan-accent)" /> Inspection Scope
          </strong>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5 }}>
            {initialMode === 'URL' && 'Scans for homoglyph spoofing, unencrypted channels, IP-literal routing, and known credential harvesters.'}
            {initialMode === 'MESSAGE' && 'Heuristic pattern matching against urgency language, wire fraud hooks, OTP prompts, and account lock lures.'}
            {initialMode === 'IMAGE' && 'Analyzes pixel compression artifacts, EXIF consistency, and synthetic image generation signals.'}
            {initialMode === 'VIDEO' && 'Evaluates temporal facial coherence, unnatural blinking rates, and audiovisual syncing anomalies.'}
            {initialMode === 'VOICE' && 'Evaluates synthetic voice synthesis artifacts, pitch anomalies, and audio buffer frequencies.'}
            {initialMode === 'FAKE_NEWS' && 'Assesses claim verifiability, emotional charge, and clickbait syntax characteristics.'}
          </p>
        </div>

        <div style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <strong style={{ color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Shield size={16} color="var(--blue-highlight)" /> Threat Classification
          </strong>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5 }}>
            Outputs scored between 0 and 100 with clear Low Risk, Suspicious, or High Risk boundaries. Confidence intervals calculated per heuristic.
          </p>
        </div>

        <div style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: '10px',
          padding: '16px'
        }}>
          <strong style={{ color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Info size={16} color="var(--risk-low)" /> Privacy & Sandbox
          </strong>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5 }}>
            All operations are isolated within local prototype security sandboxes. Telemetry remains on device.
          </p>
        </div>
      </div>
    </div>
  );
}

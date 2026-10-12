import { useState, useEffect } from 'react';
import { 
  Shield, 
  Bell, 
  Database, 
  Trash2, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  Sliders
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export interface SettingsPageProps {
  onClearHistory: () => void;
}

export default function SettingsPage({ onClearHistory }: SettingsPageProps) {
  const [notifications, setNotifications] = useState(() => localStorage.getItem('cx_notif') !== 'false');
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem('cx_autosave') !== 'false');
  const [clearedNotice, setClearedNotice] = useState(false);

  useEffect(() => { localStorage.setItem('cx_notif', notifications.toString()); }, [notifications]);
  useEffect(() => { localStorage.setItem('cx_autosave', autoSave.toString()); }, [autoSave]);

  const handleClear = () => {
    onClearHistory();
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cx-page-header">
        <div className="cx-page-title">
          <h2>System & Engine Configuration</h2>
          <p>Control threat telemetry preferences, detection thresholds, and storage</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="cx-badge cx-badge-cyan">CONFIG VERIFIED</span>
        </div>
      </div>

      {/* Main settings card */}
      <div style={{
        background: 'var(--panel-bg)',
        border: '1px solid var(--panel-border)',
        borderRadius: '14px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '15px', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={17} color="var(--cyan-accent)" />
          Operational Preferences
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Row 1 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: '#060910',
            border: '1px solid var(--panel-border)',
            borderRadius: '10px'
          }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: '#0E1626',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan-accent)'
              }}>
                <Bell size={18} />
              </div>
              <div>
                <strong style={{ color: '#fff', fontSize: '14px', display: 'block' }}>Realtime Threat Notifications</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  Trigger system toast notifications upon suspicious or dangerous verdict completion
                </span>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: notifications ? 'var(--cyan-accent)' : '#1C2738',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s'
              }}
            >
              <span style={{
                position: 'absolute',
                top: 2,
                left: notifications ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: notifications ? '#050B14' : '#8E9DB2',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>

          {/* Row 2 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: '#060910',
            border: '1px solid var(--panel-border)',
            borderRadius: '10px'
          }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: '#0E1626',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan-accent)'
              }}>
                <Database size={18} />
              </div>
              <div>
                <strong style={{ color: '#fff', fontSize: '14px', display: 'block' }}>Auto-Save Threat Telemetry</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  Persist scan records and heuristic signatures across browser reloads
                </span>
              </div>
            </div>
            <button
              onClick={() => setAutoSave(!autoSave)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: autoSave ? 'var(--cyan-accent)' : '#1C2738',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s'
              }}
            >
              <span style={{
                position: 'absolute',
                top: 2,
                left: autoSave ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: autoSave ? '#050B14' : '#8E9DB2',
                transition: 'left 0.2s'
              }} />
            </button>
          </div>
        </div>

        {/* Engine specs */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--panel-border)' }}>
          <h4 style={{ fontSize: '13px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Active Scanning Engines & Capabilities
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            <div style={{ padding: '12px', background: '#060910', border: '1px solid var(--panel-border)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontWeight: 600 }}>
                <Terminal size={14} color="var(--cyan-accent)" /> URL & Message Engine
              </div>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                Status: Operational (Heuristic Signature & Phishing NLP Analyzers)
              </span>
            </div>
            <div style={{ padding: '12px', background: '#060910', border: '1px solid var(--panel-border)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontWeight: 600 }}>
                <Cpu size={14} color="var(--blue-highlight)" /> Media & Voice Sandbox
              </div>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                Status: Prototype Mode (Async Upload & Voice Recording Pipeline)
              </span>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div style={{
          marginTop: '28px',
          padding: '20px',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid var(--risk-high-border)',
          borderRadius: '10px'
        }}>
          <strong style={{ color: '#EF4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Trash2 size={16} /> Danger Zone: Clear Audit History
          </strong>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '14px' }}>
            Purges all local scan results and threat telemetry. This action is irreversible.
          </p>
          <Button variant="danger" onClick={handleClear} style={{ fontSize: '12px' }}>
            <Trash2 size={14} /> Clear Local Cache
          </Button>

          {clearedNotice && (
            <span style={{ marginLeft: '12px', color: 'var(--risk-low)', fontSize: '12px', fontWeight: 600 }}>
              Audit cache purged successfully.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

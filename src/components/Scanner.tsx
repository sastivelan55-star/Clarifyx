import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import {
  Link2, MessageSquare, Image as ImageIcon, Video, Mic, Newspaper,
  Upload, Search, AlertTriangle, CheckCircle2, X, RefreshCw, Radio, StopCircle, Play, Pause
} from 'lucide-react';
import { scanApi } from '../services/api/scanApi';
import ResultCard from './ResultCard';
import { Button } from './ui/Button';

export interface ScannerProps {
  initialMode?: string;
  onScanCompleted?: () => void;
  hideHeader?: boolean;
}

export const SCAN_MODES = [
  { id: 'URL', label: 'Link Scanner', icon: Link2, desc: 'Heuristic analysis of URLs for phishing, homograph attacks, and credential harvesting', placeholder: 'https://secure-login-example.com/verify' },
  { id: 'MESSAGE', label: 'Message Scanner', icon: MessageSquare, desc: 'NLP & heuristic evaluation of SMS, emails, and chat messages for social engineering', placeholder: 'Paste suspicious message or email content here…' },
  { id: 'IMAGE', label: 'Image Scanner', icon: ImageIcon, desc: 'Visual artifact and metadata inspection for synthetic media and image tampering', placeholder: undefined },
  { id: 'VIDEO', label: 'Video Scanner', icon: Video, desc: 'Temporal coherence and frame integrity scan for synthetic deepfake manipulation', placeholder: undefined },
  { id: 'VOICE', label: 'Voice Scanner', icon: Mic, desc: 'Acoustic frequency analysis and synthetic voice cloning artifact detection', placeholder: undefined },
  { id: 'FAKE_NEWS', label: 'Fake News Checker', icon: Newspaper, desc: 'Claim and disinformation heuristic evaluation against verified reporting models', placeholder: 'Paste the headline or excerpt to evaluate…' },
];

export default function Scanner({ initialMode = 'URL', onScanCompleted, hideHeader = false }: ScannerProps) {
  const [mode, setMode] = useState<string>(initialMode);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [scan, setScan] = useState<any>(null);
  const [notice, setNotice] = useState<{ text: string; type: 'warn' | 'error' | 'info' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [dragging, setDragging] = useState(false);
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  // Sync mode when initialMode prop changes (e.g. from dedicated route)
  useEffect(() => {
    if (initialMode && initialMode !== mode) {
      setMode(initialMode);
      reset();
    }
  }, [initialMode]);

  const currentMode = SCAN_MODES.find(m => m.id === mode) || SCAN_MODES[0];

  function switchMode(id: string) {
    setMode(id);
    reset();
  }

  function reset() {
    setInput('');
    setFile(null);
    setScan(null);
    setNotice(null);
    setPolling(false);
    stopRecording(false);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }

  function handleFile(f?: File | null) {
    if (!f) return;
    setFile(f);
    setNotice(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  // Voice recording logic
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const recordedFile = new File([audioBlob], `recorded_voice_${Date.now()}.webm`, { type: 'audio/webm' });
        handleFile(recordedFile);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);
    } catch (err: any) {
      setNotice({ text: 'Microphone access denied or unavailable in this browser.', type: 'warn' });
    }
  }

  function stopRecording(save = true) {
    if (mediaRecorderRef.current && isRecording) {
      if (!save) {
        mediaRecorderRef.current.onstop = null;
      }
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  // Poll for async media scans
  useEffect(() => {
    if (!polling || !scan?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await scanApi.getScan(scan.id);
        if (res.success && res.data) {
          if (res.data.status === 'COMPLETED' || res.data.status === 'FAILED') {
            setScan(res.data);
            setPolling(false);
            if (onScanCompleted) onScanCompleted();
          }
        }
      } catch (err) {
        setPolling(false);
        setNotice({ text: 'Error tracking threat analysis status.', type: 'error' });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [polling, scan?.id, onScanCompleted]);

  async function handleScan() {
    setNotice(null);
    const isTextMode = ['URL', 'MESSAGE', 'FAKE_NEWS'].includes(mode);

    if (isTextMode) {
      if (!input.trim()) {
        return setNotice({ text: `Please enter input content for ${currentMode.label}.`, type: 'warn' });
      }
    } else {
      if (!file) {
        return setNotice({ text: `Please select or upload a ${mode.toLowerCase()} target to analyze.`, type: 'warn' });
      }
    }

    setLoading(true);
    setScan(null);

    try {
      let res;
      if (isTextMode) {
        res = await scanApi.createScan(mode as any, input.trim());
      } else {
        res = await scanApi.uploadScanMedia(mode as any, file!);
      }

      if (res.success && res.data) {
        setScan(res.data);
        if (res.data.status === 'PENDING' || res.data.status === 'PROCESSING') {
          setPolling(true);
        } else if (onScanCompleted) {
          onScanCompleted();
        }
      }
    } catch (err: any) {
      setNotice({ text: err.message || 'An error occurred during threat scanning.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const isTextType = ['URL', 'MESSAGE', 'FAKE_NEWS'].includes(mode);

  return (
    <div className="cx-quick-scan-section">
      {!hideHeader && (
        <div className="cx-section-head">
          <div>
            <h3>
              <Radio size={16} color="var(--cyan-accent)" />
              <span>Threat Scanning Station</span>
            </h3>
            <p>Select target vector to initiate heuristic security analysis</p>
          </div>
          <Button variant="ghost" onClick={reset} style={{ fontSize: '12px' }}>
            Reset Form
          </Button>
        </div>
      )}

      {/* Mode Selectors */}
      <div className="cx-scanner-selector">
        {SCAN_MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`cx-type-btn ${mode === id ? 'active' : ''}`}
            onClick={() => switchMode(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Active Scanner Workspace */}
      <div className="cx-scanner-box">
        <div className="cx-scanner-meta-bar">
          <div className="cx-scanner-title-group">
            <div className="cx-dz-icon" style={{ width: 36, height: 36 }}>
              <currentMode.icon size={18} />
            </div>
            <div>
              <strong>{currentMode.label}</strong>
              <span>{currentMode.desc}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="cx-badge cx-badge-cyan" style={{ fontSize: '10px' }}>
              {mode === 'URL' || mode === 'MESSAGE' ? 'REALTIME HEURISTIC' : 'DEMO DETECTION SERVICE'}
            </span>
          </div>
        </div>

        {/* Text Input Scanners */}
        {isTextType && (
          <div>
            {mode === 'URL' ? (
              <input
                className="cx-text-input"
                value={input}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                placeholder={currentMode.placeholder}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
            ) : (
              <textarea
                className="cx-text-input cx-textarea"
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                placeholder={currentMode.placeholder}
              />
            )}
          </div>
        )}

        {/* File & Audio Scanners */}
        {!isTextType && (
          <div>
            <div
              className={`cx-dropzone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <>
                  <div className="cx-dz-icon" style={{ color: 'var(--risk-low)' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <strong>{file.name}</strong>
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB · Ready for deep inspection</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); setFile(null); if (audioUrl) setAudioUrl(null); }}
                    style={{ fontSize: '11px', padding: '4px 8px', marginTop: '6px' }}
                  >
                    <X size={12} /> Replace file
                  </Button>
                </>
              ) : (
                <>
                  <div className="cx-dz-icon">
                    <Upload size={22} />
                  </div>
                  <div>
                    <strong>Drop {mode.toLowerCase()} file here or click to browse</strong>
                    <span>
                      {mode === 'IMAGE' && 'Supported: JPG, PNG, WEBP, GIF (Max 25MB)'}
                      {mode === 'VIDEO' && 'Supported: MP4, WEBM, MOV (Max 50MB)'}
                      {mode === 'VOICE' && 'Supported: MP3, WAV, WEBM, OGG (Max 25MB)'}
                    </span>
                  </div>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept={mode === 'IMAGE' ? 'image/*' : mode === 'VIDEO' ? 'video/*' : 'audio/*'}
                onChange={(e) => handleFile(e.target.files?.[0])}
                style={{ display: 'none' }}
              />
            </div>

            {/* Voice Specific Audio Recorder & Preview */}
            {mode === 'VOICE' && (
              <div className="cx-audio-recorder">
                <div className="cx-recorder-controls">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className={`cx-record-btn ${isRecording ? 'recording' : ''}`}
                      onClick={isRecording ? () => stopRecording(true) : startRecording}
                    >
                      {isRecording ? <StopCircle size={15} /> : <Mic size={15} />}
                      <span>{isRecording ? `Stop Recording (${recordingDuration}s)` : 'Record Live Voice Sample'}</span>
                    </button>
                    {isRecording && (
                      <span style={{ fontSize: '11px', color: '#EF4444', fontFamily: 'var(--font-mono)' }}>
                        ● Live capturing audio buffer…
                      </span>
                    )}
                  </div>
                </div>

                {audioUrl && (
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                      Audio Playback Preview:
                    </span>
                    <audio src={audioUrl} controls style={{ width: '100%', height: '36px' }} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notice alert */}
        {notice && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '14px',
            padding: '12px 14px',
            borderRadius: '8px',
            background: notice.type === 'error' ? 'var(--risk-high-bg)' : 'var(--risk-suspicious-bg)',
            border: `1px solid ${notice.type === 'error' ? 'var(--risk-high-border)' : 'var(--risk-suspicious-border)'}`,
            color: notice.type === 'error' ? '#EF4444' : '#F59E0B',
            fontSize: '12px'
          }}>
            <AlertTriangle size={15} />
            <span>{notice.text}</span>
          </div>
        )}

        {/* Primary Scan Button */}
        <div style={{ marginTop: '18px' }}>
          <Button
            variant="primary"
            onClick={handleScan}
            isLoading={loading}
            disabled={polling}
            style={{ width: '100%' }}
          >
            <Search size={16} />
            <span>Analyze Target with ClarifyX Engine</span>
          </Button>
        </div>
      </div>

      {/* Processing State */}
      {polling && (
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          padding: '28px',
          background: 'rgba(40, 215, 255, 0.05)',
          border: '1px solid rgba(40, 215, 255, 0.2)',
          borderRadius: '12px'
        }}>
          <RefreshCw size={28} color="var(--cyan-accent)" style={{ animation: 'spin 1.2s linear infinite', margin: '0 auto 10px' }} />
          <h4 style={{ color: '#fff', fontSize: '15px' }}>Deconstructing Payload in Sandbox…</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
            Running deep neural checks & heuristic signatures. Polling orchestrator for completion.
          </p>
        </div>
      )}

      {/* Failed State */}
      {scan?.status === 'FAILED' && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          borderRadius: '10px',
          background: 'var(--risk-high-bg)',
          border: '1px solid var(--risk-high-border)',
          color: '#EF4444',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px'
        }}>
          <AlertTriangle size={18} />
          <span>The scan service encountered an error processing this target. Please verify format and retry.</span>
        </div>
      )}

      {/* Scan Result Output */}
      {scan?.status === 'COMPLETED' && scan.Result && (
        <ResultCard
          result={scan.Result.data}
          target={input || file?.name}
          scanType={mode}
        />
      )}
    </div>
  );
}

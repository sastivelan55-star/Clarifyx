import { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  ShieldAlert,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import HistoryPanel from './components/HistoryPanel';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import { scanApi } from './services/api/scanApi';
import { authApi } from './services/api/authApi';
import { useAuthStore } from './store/useAuthStore';
import { Badge } from './components/ui/Badge';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const { data: scansResponse } = useQuery({
    queryKey: ['scans'],
    queryFn: scanApi.getHistory,
    refetchInterval: 5000 // Poll every 5s for history updates
  });

  const history = scansResponse?.success ? scansResponse.data : [];

  const deleteMutation = useMutation({
    mutationFn: scanApi.deleteScan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    }
  });

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    logout();
  };

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalQuery.trim()) {
      navigate('/history');
    }
  };

  const dangerCount = history.filter((h: any) => h.verdict === 'DANGEROUS' || h.riskScore >= 70).length;

  // Breadcrumbs generator
  const getBreadcrumb = () => {
    const p = location.pathname;
    if (p === '/') return 'Security Operations Center';
    if (p.startsWith('/scanner/url')) return 'Scanners / Link Scanner';
    if (p.startsWith('/scanner/message')) return 'Scanners / Message Scanner';
    if (p.startsWith('/scanner/image')) return 'Scanners / Image Scanner';
    if (p.startsWith('/scanner/video')) return 'Scanners / Video Scanner';
    if (p.startsWith('/scanner/voice')) return 'Scanners / Voice AI Scanner';
    if (p.startsWith('/scanner/fake_news')) return 'Scanners / Fake News Checker';
    if (p.startsWith('/history')) return 'Intelligence / Scan History Audit';
    if (p.startsWith('/stats')) return 'Intelligence / Threat Reports';
    if (p.startsWith('/settings')) return 'System / Settings & Configuration';
    return 'Navigation';
  };

  return (
    <div className="cx-app-shell">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main shell wrap */}
      <div className="cx-main-wrapper">
        {/* Top SOC Navigation Bar */}
        <header className="cx-topbar">
          <div className="cx-topbar-left">
            <button 
              className="cx-mobile-toggle" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
            </button>
            <div className="cx-breadcrumbs">
              <span>ClarifyX 2.0</span>
              <ChevronRight size={13} color="var(--text-dim)" />
              <span className="active">{getBreadcrumb()}</span>
            </div>
          </div>

          <div className="cx-topbar-right">
            {/* Global quick search */}
            <div className="cx-global-search">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search scans, threats, vectors… (Enter)"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                onKeyDown={handleGlobalSearch}
              />
            </div>

            {/* High danger alert badge */}
            {dangerCount > 0 && (
              <Badge variant="danger">
                <ShieldAlert size={12} />
                <span>{dangerCount} Active Threat{dangerCount > 1 ? 's' : ''}</span>
              </Badge>
            )}

            {/* Protection status indicator */}
            <Badge variant="cyan">
              <ShieldCheck size={12} />
              <span>SOC Shield Active</span>
            </Badge>

            {/* User info / Logout */}
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid var(--panel-border)',
                color: 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
              title="Logout user session"
            >
              <UserIcon size={14} color="var(--cyan-accent)" />
              <span style={{ color: '#fff', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                {user?.email ? user.email.split('@')[0] : 'SOC Operator'}
              </span>
              <LogOut size={13} style={{ marginLeft: 4 }} />
            </button>
          </div>
        </header>

        {/* Dynamic Main Workspace */}
        <main className="cx-main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <DashboardPage 
                  history={history} 
                  onScanCompleted={() => queryClient.invalidateQueries({ queryKey: ['scans'] })}
                  onSelectScanner={(mode) => navigate(`/scanner/${mode.toLowerCase()}`)}
                />
              } 
            />
            <Route 
              path="/scanner/:type" 
              element={
                <ScannerPage 
                  onScanCompleted={() => queryClient.invalidateQueries({ queryKey: ['scans'] })} 
                />
              } 
            />
            <Route 
              path="/history" 
              element={
                <HistoryPanel 
                  history={history} 
                  removeEntry={(id: string) => deleteMutation.mutate(id)} 
                />
              } 
            />
            <Route 
              path="/stats" 
              element={<StatsPage history={history} />} 
            />
            <Route 
              path="/settings" 
              element={
                <SettingsPage 
                  onClearHistory={async () => {
                    for (const item of history) {
                      await deleteMutation.mutateAsync(item.id);
                    }
                  }} 
                />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

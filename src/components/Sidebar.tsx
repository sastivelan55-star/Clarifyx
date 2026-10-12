import { NavLink } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Link2, 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Newspaper, 
  History, 
  FileText, 
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`cx-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cx-brand">
        <div className="cx-brand-logo">
          <ShieldCheck size={22} />
        </div>
        <div className="cx-brand-text">
          <h1>
            ClarifyX <span className="cx-brand-badge">2.0</span>
          </h1>
          <p>Cyber Threat Intelligence</p>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="cx-mobile-toggle" 
            style={{ marginLeft: 'auto' }}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="cx-nav-group">
        <div className="cx-nav-group-title">Overview</div>
        <ul className="cx-nav-list">
          <li>
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => `cx-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <LayoutDashboard size={17} />
              <span>Security Dashboard</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="cx-nav-group">
        <div className="cx-nav-group-title">Scanners</div>
        <ul className="cx-nav-list">
          <li>
            <NavLink 
              to="/scanner/url" 
              className={({ isActive }) => `cx-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Link2 size={17} />
              <span>Link Scanner</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/scanner/message" 
              className={({ isActive }) => `cx-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <MessageSquare size={17} />
              <span>Message Scanner</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/scanner/image" 
              className={({ isActive }) => `cx-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <ImageIcon size={17} />
              <span>Image Scanner</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/scanner/video" 
              className={({ isActive }) => `cx-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Video size={17} />
              <span>Video Scanner</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/scanner/voice" 
              className={({ isActive }) => `cx-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Mic size={17} />
              <span>Voice Scanner</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/scanner/fake_news" 
              className={({ isActive }) => `cx-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Newspaper size={17} />
              <span>Fake News Checker</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="cx-nav-group">
        <div className="cx-nav-group-title">Intelligence</div>
        <ul className="cx-nav-list">
          <li>
            <NavLink 
              to="/history" 
              className={({ isActive }) => `cx-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <History size={17} />
              <span>Scan History</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/stats" 
              className={({ isActive }) => `cx-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <FileText size={17} />
              <span>Threat Reports</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="cx-nav-group">
        <div className="cx-nav-group-title">System</div>
        <ul className="cx-nav-list">
          <li>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => `cx-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Settings size={17} />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="cx-sidebar-footer">
        <div className="cx-soc-status">
          <div className="cx-soc-live">
            <span className="cx-soc-pulse"></span>
            <span>CORE DEFENSE</span>
          </div>
          <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>HEURISTIC ENGINE</span>
        </div>
      </div>
    </aside>
  );
}

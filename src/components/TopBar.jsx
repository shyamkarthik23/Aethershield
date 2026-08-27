import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const { chaosSidebarOpen, setChaosSidebarOpen, orgName, feed, assets, policyRules } = useAppState();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const notifRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const criticalItems = feed.filter((f) => f.status === 'CRITICAL');
  const unreadCount = Math.max(0, criticalItems.length - lastSeenCount);

  const toggleNotifications = () => {
    setNotifOpen((open) => {
      const next = !open;
      if (next) setLastSeenCount(criticalItems.length);
      return next;
    });
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (searchOpen && searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen, searchOpen]);

  const results = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return { resources: [], rules: [], alerts: [] };

    return {
      resources: assets
        .filter((a) => a.name.toLowerCase().includes(term) || a.serviceType.toLowerCase().includes(term) || a.details.toLowerCase().includes(term))
        .slice(0, 5),
      rules: policyRules
        .filter((r) => r.name.toLowerCase().includes(term) || r.category.toLowerCase().includes(term))
        .slice(0, 5),
      alerts: feed
        .filter((f) => f.text.toLowerCase().includes(term))
        .slice(0, 5),
    };
  }, [searchTerm, assets, policyRules, feed]);

  const hasResults = results.resources.length + results.rules.length + results.alerts.length > 0;

  const goTo = (path) => {
    navigate(path);
    setSearchOpen(false);
    setSearchTerm('');
  };

  return (
    <header className="topbar">
      <div className="search-wrapper" ref={searchRef}>
        <div className="topbar-search">
          <span className="topbar-search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search resources, alerts, rules..."
            aria-label="Search"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setSearchOpen(true); }}
            onFocus={() => searchTerm && setSearchOpen(true)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => { setSearchTerm(''); setSearchOpen(false); }} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        {searchOpen && searchTerm && (
          <div className="search-popover">
            {!hasResults && <p className="notif-empty">No matches for "{searchTerm}".</p>}

            {results.resources.length > 0 && (
              <div className="search-group">
                <div className="search-group-label">Resources</div>
                {results.resources.map((a) => (
                  <button key={a.id} className="search-row" onClick={() => goTo('/inventory')}>
                    <span className={`pill pill-${a.provider.toLowerCase()}`}>{a.provider}</span>
                    <span className="search-row-text">{a.name}</span>
                    <span className={`pill ${a.severity === 'Critical' ? 'pill-critical' : a.severity === 'Warning' ? 'pill-warning' : 'pill-healthy'}`}>
                      {a.severity}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {results.rules.length > 0 && (
              <div className="search-group">
                <div className="search-group-label">Policy Rules</div>
                {results.rules.map((r) => (
                  <button key={r.id} className="search-row" onClick={() => goTo('/policy-rules')}>
                    <span className="search-row-text">{r.name}</span>
                    <span className="search-row-meta">{r.category}</span>
                  </button>
                ))}
              </div>
            )}

            {results.alerts.length > 0 && (
              <div className="search-group">
                <div className="search-group-label">Alerts</div>
                {results.alerts.map((f) => (
                  <button key={f.id} className="search-row" onClick={() => goTo('/')}>
                    <span className={`pill pill-${f.provider.toLowerCase()}`}>{f.provider}</span>
                    <span className="search-row-text">{f.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        {orgName && <span className="org-badge">{orgName}</span>}
        <span className="monitor-status">
          <span className="monitor-dot" />
          Monitors Operational
        </span>

        <div className="notif-wrapper" ref={notifRef}>
          <button
            className="icon-btn"
            aria-label="Notifications"
            aria-expanded={notifOpen}
            onClick={toggleNotifications}
          >
            🔔
            {unreadCount > 0 && <span className="notif-dot" />}
          </button>

          {notifOpen && (
            <div className="notif-popover">
              <div className="notif-popover-header">Recent Activity</div>
              {feed.length === 0 && <p className="notif-empty">No activity yet.</p>}
              {feed.slice(0, 8).map((item) => (
                <div className="notif-row" key={item.id}>
                  <span className={`pill pill-${item.provider.toLowerCase()}`}>{item.provider}</span>
                  <div className="notif-text">
                    <p>{item.text}</p>
                    <span className="notif-time">{item.time}</span>
                  </div>
                  <span className={`pill ${item.status === 'HEALTHY' ? 'pill-healthy' : 'pill-critical'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="icon-btn chaos-toggle-btn"
          onClick={() => setChaosSidebarOpen(!chaosSidebarOpen)}
          aria-pressed={chaosSidebarOpen}
          title={chaosSidebarOpen ? 'Hide Chaos Simulator' : 'Show Chaos Simulator'}
        >
          ⚡
        </button>
        <button className="icon-btn" onClick={logout} title="Log out" aria-label="Log out">
          ⎋
        </button>
      </div>
    </header>
  );
}
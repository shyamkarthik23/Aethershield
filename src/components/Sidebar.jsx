import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '▦', end: true },
  { to: '/inventory', label: 'Asset Inventory', icon: '☰' },
  { to: '/compliance', label: 'Compliance Audits', icon: '◎' },
  { to: '/policy-rules', label: 'Policy Rules', icon: '▤' },
  { to: '/copilot', label: 'AI Copilot', icon: '◉' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-shield">🛡</span>
        <span className="sidebar-brand-text">AetherShield</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-line">AetherShield Enterprise</div>
        <div className="sidebar-footer-line muted">v1.2.4 · Client Secure</div>
      </div>
    </aside>
  );
}

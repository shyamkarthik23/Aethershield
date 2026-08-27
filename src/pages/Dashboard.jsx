import { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import ConnectCloudModal from '../components/ConnectCloudModal';

function ScoreGauge({ score }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? 'var(--status-healthy)' : score >= 45 ? 'var(--status-warning)' : 'var(--status-critical)';

  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--border)" strokeWidth="14" />
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 100 100)"
        style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.6s ease' }}
      />
      <text x="100" y="94" textAnchor="middle" fontSize="40" fontWeight="700" fill="var(--text-primary)" fontFamily="var(--font-display)">
        {score}
      </text>
      <text x="100" y="122" textAnchor="middle" fontSize="13" fill="var(--text-muted)" letterSpacing="2">
        SECURE
      </text>
    </svg>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: accent }}>
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon" style={{ color: accent }}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { securityScore, activeThreats, criticalCount, autoRemediations, feed, assets, remediateAsset, orgName, loading } = useAppState();
  const priorityFindings = assets.filter((a) => a.severity !== 'Healthy').slice(0, 4);
  const [showConnectModal, setShowConnectModal] = useState(false);

  if (loading && assets.length === 0) {
    return (
      <div className="page-scroll">
        <div className="page-header"><h1 className="page-title">Dashboard</h1></div>
        <p className="loading-text">Loading your organization's security posture...</p>
      </div>
    );
  }

  // No cloud accounts connected yet -- show the empty state with a way to connect one.
  if (assets.length === 0) {
    return (
      <div className="page-scroll">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          {orgName && <span className="page-org-tag">{orgName}</span>}
        </div>
        <div className="card empty-state-card">
          <h3>No cloud accounts connected yet</h3>
          <p className="modal-sub">Connect an AWS, Azure, or GCP account to start monitoring your security posture.</p>
          <button className="btn-primary" onClick={() => setShowConnectModal(true)}>
            + Connect Cloud Account
          </button>
        </div>
        {showConnectModal && <ConnectCloudModal onClose={() => setShowConnectModal(false)} />}
      </div>
    );
  }

  return (
    <div className="page-scroll">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        {orgName && <span className="page-org-tag">{orgName}</span>}
      </div>

      <div className="stat-grid">
        <StatCard label="AVG SECURITY SCORE" value={`${securityScore}%`} icon="📶" accent="var(--accent-cyan)" />
        <StatCard label="ACTIVE THREATS" value={activeThreats} icon="⚠" accent="var(--status-critical)" />
        <StatCard label="CRITICAL FINDINGS" value={criticalCount} icon="🔒" accent="var(--status-critical)" />
        <StatCard label="AUTO-REMEDIATIONS" value={autoRemediations} icon="↻" accent="var(--status-healthy)" />
      </div>

      <div className="dashboard-lower">
        <div className="card gauge-card">
          <ScoreGauge score={securityScore} />
          <h3 className="gauge-title">Global Compliance Score</h3>
          <p className="gauge-sub">Across AWS, Azure, &amp; GCP clusters.</p>
        </div>

        <div className="card feed-card">
          <div className="feed-header">
            <h3>Live Threat Intelligence Feed</h3>
            <span className="live-badge"><span className="live-dot" />LIVE MONITORING</span>
          </div>
          <div className="feed-list">
            {feed.map((item) => (
              <div className="feed-item" key={item.id}>
                <span className={`pill pill-${item.provider.toLowerCase()}`}>{item.provider}</span>
                <div className="feed-text">
                  <p>{item.text}</p>
                  <span className="feed-time">{item.time}</span>
                </div>
                <span className={`pill ${item.status === 'HEALTHY' ? 'pill-healthy' : 'pill-critical'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {priorityFindings.length > 0 && (
        <div className="card priority-card">
          <h3 className="priority-title">Priority Findings</h3>
          <p className="priority-sub">Fix these to raise your global compliance score.</p>
          <div className="priority-list">
            {priorityFindings.map((a) => (
              <div className="priority-row" key={a.id}>
                <span className={`pill pill-${a.provider.toLowerCase()}`}>{a.provider}</span>
                <div className="priority-text">
                  <p className="priority-name">{a.name}</p>
                  <p className="priority-details">{a.details}</p>
                </div>
                <span className={`pill ${a.severity === 'Critical' ? 'pill-critical' : 'pill-warning'}`}>
                  {a.severity}
                </span>
                <button className="remediate-btn" onClick={() => remediateAsset(a.id)}>
                  Remediate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
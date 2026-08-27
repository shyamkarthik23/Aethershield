import { useState, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';

export default function ComplianceAudits() {
  const { frameworks, getFailedControls, orgName } = useAppState();
  const [selected, setSelected] = useState(null);
  const [failedControls, setFailedControls] = useState([]);
  const [loadingControls, setLoadingControls] = useState(false);

  // Select the first available framework once frameworks load
  useEffect(() => {
    if (!selected && frameworks.length > 0) {
      setSelected(frameworks[0].id);
    }
  }, [frameworks, selected]);

  useEffect(() => {
    if (!selected) return;
    setLoadingControls(true);
    getFailedControls(selected)
      .then(setFailedControls)
      .finally(() => setLoadingControls(false));
  }, [selected, getFailedControls]);

  if (frameworks.length === 0) {
    return (
      <div className="page-scroll">
        <div className="page-header">
          <h1 className="page-title">Compliance Audits &amp; Frameworks</h1>
        </div>
        <p className="loading-text">Loading compliance frameworks...</p>
      </div>
    );
  }

  const active = frameworks.find((f) => f.id === selected) || frameworks[0];
  const total = active.pass + active.fail;
  const pct = total > 0 ? Math.round((active.pass / total) * 100) : 0;

  return (
    <div className="page-scroll">
      <div className="page-header">
        <h1 className="page-title">Compliance Audits &amp; Frameworks</h1>
        {orgName && <span className="page-org-tag">{orgName}</span>}
      </div>

      <div className="compliance-grid">
        {frameworks.map((f) => {
          const p = Math.round((f.pass / (f.pass + f.fail)) * 100);
          const color = p >= 85 ? 'var(--status-healthy)' : p >= 70 ? 'var(--accent-cyan)' : 'var(--status-warning)';
          return (
            <button
              key={f.id}
              className={`card compliance-card${selected === f.id ? ' selected' : ''}`}
              onClick={() => setSelected(f.id)}
            >
              <div className="compliance-card-top">
                <h3>{f.name}</h3>
                <span className="compliance-pct" style={{ color }}>{p}%</span>
              </div>
              <p className="compliance-desc">{f.description}</p>
              <div className="compliance-counts">
                <div>
                  <span className="count-label">Pass</span>
                  <span className="count-value pass">{f.pass} checks</span>
                </div>
                <div>
                  <span className="count-label">Fail</span>
                  <span className="count-value fail">{f.fail} checks</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="card audit-detail">
        <h3>Failed Control Audit: {active.name}</h3>
        <p className="audit-detail-sub">{pct}% passing · {active.fail} controls need attention</p>
        <div className="failed-controls-list">
          {loadingControls && <p className="loading-text">Loading...</p>}
          {!loadingControls && failedControls.map((c) => (
            <div className="failed-control-row" key={c.id}>
              <span className="control-id">{c.id}</span>
              <span className="control-desc">{c.desc}</span>
              <span className="control-resource">{c.resource}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

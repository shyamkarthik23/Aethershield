import { useAppState } from '../context/AppStateContext';

function Toggle({ checked, onChange, label }) {
  return (
    <button
      className={`toggle${checked ? ' on' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
    >
      <span className="toggle-knob" />
    </button>
  );
}

export default function PolicyRules() {
  const { policyRules, togglePolicyRule } = useAppState();

  return (
    <div className="page-scroll">
      <div className="page-header">
        <h1 className="page-title">Security Policies &amp; Automation Rules</h1>
      </div>

      <div className="rules-list">
        {policyRules.map((rule) => (
          <div className="card rule-row" key={rule.id}>
            <div className="rule-main">
              <h3>{rule.name}</h3>
              <div className="rule-meta">
                <span className="rule-meta-item">
                  <span className="rule-meta-label">Category:</span> {rule.category}
                </span>
                <span className="rule-meta-item">
                  <span className="rule-meta-label">Provider:</span> {rule.provider}
                </span>
                <span className={`rule-severity ${rule.severity.toLowerCase()}`}>
                  Severity: {rule.severity}
                </span>
              </div>
            </div>
            <div className="rule-controls">
              <div className="rule-toggle-group">
                <span>Active</span>
                <Toggle
                  checked={rule.active}
                  onChange={() => togglePolicyRule(rule.id, 'active')}
                  label={`Toggle active for ${rule.name}`}
                />
              </div>
              <div className="rule-toggle-group">
                <span>Auto-Remediate</span>
                <Toggle
                  checked={rule.autoRemediate}
                  onChange={() => togglePolicyRule(rule.id, 'autoRemediate')}
                  label={`Toggle auto-remediate for ${rule.name}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from 'react';


const PROVIDERS = [
  { id: 'aws', name: 'Amazon Web Services', icon: '🟧' },
  { id: 'azure', name: 'Microsoft Azure', icon: '🔷' },
  { id: 'gcp', name: 'Google Cloud Platform', icon: '🔴' },
];

export default function ConnectCloudModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState(null);
  const [roleArn, setRoleArn] = useState('');

  const handleProviderSelect = (p) => {
    setProvider(p);
    setStep(2);
  };

  const handleConnect = (e) => {
    e.preventDefault();
    setStep(3);
    setTimeout(() => setStep(4), 2200);
  };

  return (
    <div className="aether-modal-overlay" onClick={onClose}>
      <div className="aether-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="aether-modal-close" onClick={onClose}>×</button>

        {step === 1 && (
          <>
            <h2>Connect a Cloud Account</h2>
            <p className="aether-modal-sub">Choose a provider to start monitoring your infrastructure.</p>
            <div className="aether-provider-grid">
              {PROVIDERS.map((p) => (
                <button key={p.id} className="aether-provider-btn" onClick={() => handleProviderSelect(p)}>
                  <span className="aether-provider-icon">{p.icon}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>{provider.icon} Connect {provider.name}</h2>
            <p className="aether-modal-sub">
              Create a read-only IAM role in your account and paste its ARN below.
              AetherShield never requests write access during setup.
            </p>
            <form onSubmit={handleConnect} className="aether-connect-form">
              <label>
                Role ARN
                <input
                  type="text"
                  value={roleArn}
                  onChange={(e) => setRoleArn(e.target.value)}
                  placeholder="arn:aws:iam::123456789012:role/AetherShieldReadOnly"
                  required
                />
              </label>
              <div className="aether-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="btn-primary">Scan Account</button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="aether-scan-loading">
            <div className="aether-spinner" />
            <p>Scanning {provider.name} for resources...</p>
            <p className="aether-modal-sub">Discovering storage, compute, and identity configurations.</p>
          </div>
        )}

        {step === 4 && (
          <div className="aether-scan-done">
            <div className="aether-scan-check">✓</div>
            <h2>Account Connected</h2>
            <p className="aether-modal-sub">
              {provider.name} is now linked. New findings will appear in your dashboard.
            </p>
            <button className="btn-primary" onClick={onClose}>Go to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}
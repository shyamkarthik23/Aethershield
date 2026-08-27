import { useState, useMemo } from 'react';
import { useAppState } from '../context/AppStateContext';

const PROVIDERS = ['All Platforms', 'AWS Only', 'Azure Only', 'Google Cloud'];
const PROVIDER_MAP = { 'AWS Only': 'AWS', 'Azure Only': 'Azure', 'Google Cloud': 'GCP' };
const SEVERITIES = ['All Severities', 'Critical', 'Warning', 'Healthy'];

export default function AssetInventory() {
  const { assets, remediateAsset } = useAppState();
  const [providerFilter, setProviderFilter] = useState('All Platforms');
  const [severityFilter, setSeverityFilter] = useState('All Severities');
  const [scanning, setScanning] = useState(false);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const providerOk =
        providerFilter === 'All Platforms' || a.provider === PROVIDER_MAP[providerFilter];
      const severityOk = severityFilter === 'All Severities' || a.severity === severityFilter;
      return providerOk && severityOk;
    });
  }, [assets, providerFilter, severityFilter]);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 1200);
  };

  return (
    <div className="page-scroll">
      <div className="page-header">
        <h1 className="page-title">Cloud Asset Inventory</h1>
        <button className="btn-primary" onClick={handleScan} disabled={scanning}>
          ↻ {scanning ? 'Scanning...' : 'Trigger Posture Scan'}
        </button>
      </div>

      <div className="filter-row">
        {PROVIDERS.map((p) => (
          <button
            key={p}
            className={`btn-ghost${providerFilter === p ? ' active' : ''}`}
            onClick={() => setProviderFilter(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="filter-row">
        {SEVERITIES.map((s) => (
          <button
            key={s}
            className={`btn-ghost${severityFilter === s ? ' active' : ''}`}
            onClick={() => setSeverityFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card table-card">
        <table className="asset-table">
          <thead>
            <tr>
              <th>Resource Name</th>
              <th>Cloud Provider</th>
              <th>Service Type</th>
              <th>Status</th>
              <th>Details</th>
              <th>Severity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="res-name">{a.name}</div>
                  <div className="res-id">{a.id}</div>
                </td>
                <td><span className={`pill pill-${a.provider.toLowerCase()}`}>{a.provider}</span></td>
                <td>{a.serviceType}</td>
                <td>
                  <span className={`pill ${a.status === 'DANGER' ? 'pill-critical' : a.status === 'WARNING' ? 'pill-warning' : 'pill-healthy'}`}>
                    {a.status}
                  </span>
                </td>
                <td className="res-details">{a.details}</td>
                <td>
                  <span className={`pill ${a.severity === 'Critical' ? 'pill-critical' : a.severity === 'Warning' ? 'pill-warning' : 'pill-healthy'}`}>
                    {a.severity}
                  </span>
                </td>
                <td>
                  {a.severity === 'Healthy' ? (
                    <span className="remediated-tag">✓ Fixed</span>
                  ) : (
                    <button className="remediate-btn" onClick={() => remediateAsset(a.id)}>
                      Remediate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-row">No resources match these filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

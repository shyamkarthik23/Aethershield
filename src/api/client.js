const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function toCamel(obj) {
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
        toCamel(v),
      ])
    );
  }
  return obj;
}


async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const errBody = await res.json();
      detail = errBody.detail || detail;
    } catch {
      // response had no JSON body
    }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  const json = await res.json();
  return toCamel(json);
}

export const api = {
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password } }),

  signup: (orgName, email, password) =>
    request('/api/auth/signup', { method: 'POST', body: { org_name: orgName, email, password } }),

  getAssets: (token) => request('/api/assets', { token }),
  triggerScan: (token) => request('/api/assets/scan', { method: 'POST', token }),

  getPolicyRules: (token) => request('/api/policy-rules', { token }),
  updatePolicyRule: (token, ruleId, patch) =>
    request(`/api/policy-rules/${ruleId}`, { method: 'PATCH', body: patch, token }),

  getFrameworks: (token) => request('/api/compliance/frameworks', { token }),
  getFailedControls: (token, frameworkId) =>
    request(`/api/compliance/frameworks/${frameworkId}/failed-controls`, { token }),

  getDashboardSummary: (token) => request('/api/dashboard/summary', { token }),

  remediateAsset: (token, assetId) =>
    request('/api/remediation/remediate', { method: 'POST', body: { asset_id: assetId }, token }),

  getChaosEvents: (token) => request('/api/chaos/events', { token }),
  triggerChaosEvent: (token, eventId) =>
    request('/api/chaos/trigger', { method: 'POST', body: { event_id: eventId }, token }),
  resetChaos: (token) => request('/api/chaos/reset', { method: 'POST', token }),

  getFeed: (token) => request('/api/feed', { token }),

  askCopilot: (token, prompt) =>
    request('/api/copilot/ask', { method: 'POST', body: { prompt }, token }),
};
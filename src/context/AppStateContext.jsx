import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api/client';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const { session } = useAuth();
  const token = session?.token;

  const [assets, setAssets] = useState([]);
  const [policyRules, setPolicyRules] = useState([]);
  const [chaosEvents, setChaosEvents] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [feed, setFeed] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [triggeredEventIds, setTriggeredEventIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [chaosSidebarOpen, setChaosSidebarOpen] = useState(true);

  // Pulls every org-scoped resource fresh from the backend. Called on
  // login and again after any mutating action (remediate, chaos trigger,
  // policy toggle) so every page reflects the latest state -- same idea
  // as the old client-only context, just now backed by real API calls.
  const refreshAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [assetsRes, rulesRes, chaosRes, feedRes, dashRes, frameworksRes] = await Promise.all([
        api.getAssets(token),
        api.getPolicyRules(token),
        api.getChaosEvents(token),
        api.getFeed(token),
        api.getDashboardSummary(token),
        api.getFrameworks(token),
      ]);
      setAssets(assetsRes);
      setPolicyRules(rulesRes);
      setChaosEvents(chaosRes);
      setFeed(feedRes);
      setDashboard(dashRes);
      setFrameworks(frameworksRes);
    } catch (err) {
      setLoadError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      refreshAll();
      setTriggeredEventIds([]);
    } else {
      setAssets([]);
      setPolicyRules([]);
      setChaosEvents([]);
      setFeed([]);
      setDashboard(null);
    }
  }, [token, refreshAll]);

  const remediateAsset = useCallback(async (assetId) => {
    if (!token) return;
    await api.remediateAsset(token, assetId);
    await refreshAll();
  }, [token, refreshAll]);

  const triggerChaosEvent = useCallback(async (eventId) => {
    if (!token) return;
    await api.triggerChaosEvent(token, eventId);
    setTriggeredEventIds((prev) => [...prev, eventId]);
    await refreshAll();
  }, [token, refreshAll]);

  const resetChaos = useCallback(async () => {
    if (!token) return;
    await api.resetChaos(token);
    setTriggeredEventIds([]);
    await refreshAll();
  }, [token, refreshAll]);

  const togglePolicyRule = useCallback(async (ruleId, field) => {
    if (!token) return;
    const rule = policyRules.find((r) => r.id === ruleId);
    if (!rule) return;
    await api.updatePolicyRule(token, ruleId, { [field]: !rule[field] });
    await refreshAll();
  }, [token, policyRules, refreshAll]);

  const askCopilot = useCallback(async (prompt) => {
    if (!token) return { reply: 'Not signed in.' };
    const res = await api.askCopilot(token, prompt);
    await refreshAll(); // some copilot replies remediate a finding server-side
    return res;
  }, [token, refreshAll]);

  const getFailedControls = useCallback(async (frameworkId) => {
    if (!token) return [];
    return api.getFailedControls(token, frameworkId);
  }, [token]);

  const value = {
    assets,
    policyRules,
    chaosEvents,
    frameworks,
    feed,
    loading,
    loadError,
    criticalCount: dashboard?.criticalFindings ?? 0,
    activeThreats: dashboard?.activeThreats ?? 0,
    autoRemediations: dashboard?.autoRemediations ?? 0,
    securityScore: dashboard?.securityScore ?? 0,
    orgName: dashboard?.orgName ?? session?.orgName,
    triggeredEventIds,
    triggerChaosEvent,
    remediateAsset,
    resetChaos,
    togglePolicyRule,
    askCopilot,
    getFailedControls,
    refreshAll,
    chaosSidebarOpen,
    setChaosSidebarOpen,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

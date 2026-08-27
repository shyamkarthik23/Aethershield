import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ChaosSimulator from './components/ChaosSimulator';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AssetInventory from './pages/AssetInventory';
import ComplianceAudits from './pages/ComplianceAudits';
import PolicyRules from './pages/PolicyRules';
import AICopilot from './pages/AICopilot';

function Shell() {
  const { chaosSidebarOpen } = useAppState();

  return (
    <div className={`app-shell${chaosSidebarOpen ? ' chaos-open' : ''}`}>
      <Sidebar />
      <div className="main-col">
        <TopBar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<AssetInventory />} />
          <Route path="/compliance" element={<ComplianceAudits />} />
          <Route path="/policy-rules" element={<PolicyRules />} />
          <Route path="/copilot" element={<AICopilot />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <ChaosSimulator />
    </div>
  );
}

function Gate() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Gate />
      </HashRouter>
    </AuthProvider>
  );
}

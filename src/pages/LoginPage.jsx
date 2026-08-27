import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { org: 'Acme Corp', email: 'admin@acme.com', password: 'acme123' },
  { org: 'Globex Industries', email: 'admin@globex.com', password: 'globex123' },
];

export default function LoginPage() {
  const { login, loginError, loggingIn, signup, signupError, signingUp } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      login(email, password);
    } else {
      signup(orgName, email, password);
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  const error = mode === 'login' ? loginError : signupError;
  const busy = mode === 'login' ? loggingIn : signingUp;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <span className="sidebar-shield">🛡</span>
          <span className="sidebar-brand-text">AetherShield</span>
        </div>
        <p className="login-sub">
          {mode === 'login'
            ? "Sign in to your organization's security dashboard."
            : 'Create a new organization and get started.'}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'signup' && (
            <label>
              Organization Name
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Your Company Inc."
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yourorg.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn-primary login-submit" disabled={busy}>
            {busy
              ? mode === 'login' ? 'Signing in...' : 'Creating account...'
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="login-toggle-mode">
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button type="button" className="login-link-btn" onClick={() => setMode('signup')}>
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button type="button" className="login-link-btn" onClick={() => setMode('login')}>
                Sign in
              </button>
            </>
          )}
        </p>

        {mode === 'login' && (
          <div className="login-demo-block">
            <p className="login-demo-label">Demo organizations</p>
            {DEMO_ACCOUNTS.map((acc) => (
              <button key={acc.email} className="login-demo-btn" onClick={() => fillDemo(acc)}>
                <span>{acc.org}</span>
                <span className="login-demo-email">{acc.email}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
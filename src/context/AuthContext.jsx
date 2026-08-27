import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'aethershield_session';

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);
  const [loginError, setLoginError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [signupError, setSignupError] = useState(null);
  const [signingUp, setSigningUp] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await api.login(email, password);
      const nextSession = {
        token: res.accessToken,
        orgId: res.orgId,
        orgName: res.orgName,
        email,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      return true;
    } catch (err) {
      setLoginError(err.message || 'Login failed');
      return false;
    } finally {
      setLoggingIn(false);
    }
  }, []);

  const signup = useCallback(async (orgName, email, password) => {
    setSigningUp(true);
    setSignupError(null);
    try {
      const res = await api.signup(orgName, email, password);
      const nextSession = {
        token: res.accessToken,
        orgId: res.orgId,
        orgName: res.orgName,
        email,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      return true;
    } catch (err) {
      setSignupError(err.message || 'Signup failed');
      return false;
    } finally {
      setSigningUp(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = {
    session,
    isAuthenticated: !!session,
    login,
    logout,
    loginError,
    loggingIn,
    signup,
    signupError,
    signingUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
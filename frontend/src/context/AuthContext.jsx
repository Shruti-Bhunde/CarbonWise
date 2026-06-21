import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext(null);

function applyPayload(payload, setState) {
  setState({
    user: payload?.user || null,
    assessment: payload?.assessment || null,
    quests: payload?.quests || [],
    report: payload?.report || null,
    history: payload?.history || [],
    badges: payload?.badges || [],
  });
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    assessment: null,
    quests: [],
    report: null,
    history: [],
    badges: [],
  });
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await authApi.me();
      applyPayload(payload, setState);
    } catch {
      setState({
        user: null,
        assessment: null,
        quests: [],
        report: null,
        history: [],
        badges: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async (email, password) => {
    const payload = await authApi.login({ email, password });
    applyPayload(payload, setState);
    return payload;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await authApi.register(payload);
    applyPayload(response, setState);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setState({
        user: null,
        assessment: null,
        quests: [],
        report: null,
        history: [],
        badges: [],
      });
    }
  }, []);

  const value = useMemo(() => ({
    ...state,
    loading,
    login,
    register,
    logout,
    refresh: hydrate,
    setState,
  }), [state, loading, login, register, logout, hydrate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

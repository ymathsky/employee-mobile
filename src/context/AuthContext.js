import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { employee_id, role, username, first_name, ... }
  const [loading, setLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync('current_user');
        const sessId = await SecureStore.getItemAsync('phpsessid');
        if (stored && sessId) {
          setUser(JSON.parse(stored));
        }
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/mobile_login.php', { email, password });
    if (res.data.success) {
      await SecureStore.setItemAsync('phpsessid', res.data.session_token);
      await SecureStore.setItemAsync('current_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const logout = async () => {
    try { await api.post('/logout.php'); } catch (_) {}
    await SecureStore.deleteItemAsync('phpsessid');
    await SecureStore.deleteItemAsync('current_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

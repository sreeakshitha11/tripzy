import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

const TOKEN_KEY = 'tripzy_token';
const USER_KEY = 'tripzy_user';

// Last known profile, so a returning visitor shows as signed in while the server wakes up
const readCachedUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
};

const saveUser = (user) => {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    // Storage can be unavailable (private mode); the session still works for this visit
  }
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => (localStorage.getItem(TOKEN_KEY) ? readCachedUser() : null));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      // The free backend can take up to a minute to wake, so retry instead of signing the user out
      for (let attempt = 0; attempt < 4 && !cancelled; attempt++) {
        try {
          const res = await api.get('/auth/me');
          if (!cancelled) {
            setUser(res.data);
            saveUser(res.data);
          }
          break;
        } catch (err) {
          const status = err.response?.status;
          if (status === 401 || status === 403) {
            // The server rejected the login itself (expired or invalid): sign out
            if (!cancelled) logout();
            break;
          }
          // Network error or server still starting: keep the session and try again
          if (attempt < 3) await wait(5000 * (attempt + 1));
        }
      }
      if (!cancelled) setLoading(false);
    };

    fetchMe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email: email.trim(), password });
    const { token: jwtToken, ...userData } = res.data;
    localStorage.setItem(TOKEN_KEY, jwtToken);
    saveUser(userData);
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', { ...data, email: data.email?.trim() });
    const { token: jwtToken, ...userData } = res.data;
    localStorage.setItem(TOKEN_KEY, jwtToken);
    saveUser(userData);
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    saveUser(null);
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    setUser(res.data);
    saveUser(res.data);
    return res.data;
  };

  const updatePreferences = async (prefData) => {
    const res = await api.put('/auth/preferences', prefData);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      updatePreferences
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useState, useEffect, useContext } from 'react';

import { API_BASE } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on startup
  useEffect(() => {
    const storedToken = localStorage.getItem('jb_token');
    const storedUser = localStorage.getItem('jb_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored session', e);
        localStorage.removeItem('jb_token');
        localStorage.removeItem('jb_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON: ${text.slice(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login.');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('jb_token', data.token);
      localStorage.setItem('jb_user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  };

  const register = async (email, password, role, name) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role, name }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON: ${text.slice(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register.');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('jb_token', data.token);
      localStorage.setItem('jb_user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Register service error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jb_token');
    localStorage.removeItem('jb_user');
  };

  const syncUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('jb_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, syncUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const res = await api.get('/me/');
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('access_token');
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    const res = await api.post('/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/register/', data);
    localStorage.setItem('access_token', res.data.access);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
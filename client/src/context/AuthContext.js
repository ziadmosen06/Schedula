import React, { createContext, useState, useContext } from 'react';
import { logoutUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const updateUser = (newData) => {
    const current = JSON.parse(localStorage.getItem('user')) || {};
    const merged = { ...current, ...newData };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // Ignore logout API failures and still clear local auth state
    } finally {
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import React, { useEffect, useState, createContext, useContext } from 'react';
import { authApi } from '../services/api';
import type { User } from '../types/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode; }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('dashboard_user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));

  // We can keep the useEffect to handle 'storage' events or just for safety, 
  // but with lazy init it's less critical for simple reload persistence.
  // However, removing the initial load logic from useEffect since it's now in useState.
  useEffect(() => {
    // Optional: could listen to storage events here if we wanted multi-tab sync
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, password });

      // Postman shows response structure: { success, statusCode, message, data: { accessToken, user } }
      // Extract from getData which might return response.data or response.data.data
      const accessToken = response.accessToken || response.data?.accessToken;
      const user = response.user || response.data?.user;

      if (accessToken && user) {
        setToken(accessToken);
        setUser(user);

        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('dashboard_user', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    // Optionally call API logout
    authApi.logout().catch(err => console.error("Logout API failed", err));

    setUser(null);
    setToken(null);
    localStorage.removeItem('dashboard_user');
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
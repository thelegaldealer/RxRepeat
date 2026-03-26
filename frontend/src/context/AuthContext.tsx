import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

type User = {
  id: string;
  email: string;
  role: string;
  token: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (access: string, refresh: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        
        if (!isExpired) {
          setUser({
            id: decoded.user_id,
            email: decoded.email,
            role: decoded.role || 'student',
            token,
          });
        } else {
          logout();
        }
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
    
    // Listen for axios 401s
    const handleUnauthorized = () => logout();
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const login = (access: string, refresh: string) => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    const decoded: any = jwtDecode(access);
    setUser({
      id: decoded.user_id,
      email: decoded.email,
      role: decoded.role || 'student',
      token: access,
    });
  };

  const logout = async () => {
    if (user) {
      try {
        await api.post('/logout/');
      } catch (e) { console.error('Silent logout error'); }
    }
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { User } from '@/types';
import { authService } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const response = await authService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
            authService.setUser(response.data);
          }
        } catch (error) {
          console.error('Failed to get user profile:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    if (response.success && response.data) {
      const { user: userData, token } = response.data;
      authService.setToken(token);
      authService.setUser(userData);
      setUser(userData);
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await authService.register({ email, password, name });
    if (response.success && response.data) {
      const { user: userData, token } = response.data;
      authService.setToken(token);
      authService.setUser(userData);
      setUser(userData);
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully!');
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    authService.setUser(userData);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

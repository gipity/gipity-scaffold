import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../../../shared/schema';
import { authApi } from './api';
import { debug } from './debug';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  isAuthenticated: () => boolean;
  handleTokenExpiration: () => void;
  setNavigationCallback: (callback: (() => void) | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navigationCallback, setNavigationCallback] = useState<(() => void) | null>(null);

  // Define logout and token expiration handlers first (before useEffect)
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('app_token');
    localStorage.removeItem('app_user');
  };

  const handleTokenExpiration = () => {
    debug.log('Token expired - automatically logging out user');
    logout();
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      debug.log('Redirecting to login due to token expiration');
      // Use client-side navigation if available, otherwise fall back to page reload
      if (navigationCallback) {
        navigationCallback();
      } else {
        window.location.href = '/login';
      }
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('app_token');
      const savedUser = localStorage.getItem('app_user');

      if (savedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          
          // Trust stored credentials without immediate validation
          // Let actual API calls handle token validation and expiration
          setToken(savedToken);
          setUser(parsedUser);
        } catch (error) {
          debug.error('Error parsing stored user data:', error);
          localStorage.removeItem('app_token');
          localStorage.removeItem('app_user');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        
        // Save to localStorage
        localStorage.setItem('app_token', response.token);
        localStorage.setItem('app_user', JSON.stringify(response.user));
        
        debug.log('Login successful');
        
        return { success: true };
      } else {
        debug.log('Login failed:', response.error);
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      debug.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await authApi.register({ 
        email, 
        password, 
        first_name: firstName,
        last_name: lastName
      });
      
      if (response.success) {
        // Registration successful - user must confirm email before logging in
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('app_token');
    if (savedToken) {
      try {
        const response = await authApi.getMe(savedToken, handleTokenExpiration);
        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem('app_user', JSON.stringify(response.user));
          return response.user;
        }
      } catch (error) {
        debug.error('Error refreshing user:', error);
      }
    }
    return null;
  };



  const isAuthenticated = () => {
    // Check localStorage as single source of truth (matches authenticatedFetch behavior)
    const storageToken = localStorage.getItem('app_token');
    const storageUser = localStorage.getItem('app_user');
    return !!(storageToken && storageUser);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated,
    handleTokenExpiration,
    setNavigationCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/utils';

interface User {
  id: string;
  email: string;
  phone?: string;
  role: string;
  accountId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const storedUser = await auth.getUser();
        const token = await auth.getToken();
        
        if (storedUser && token) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // TODO: Implement email/password authentication with backend
      console.log('Authenticating user:', { email });
      
      // For now, simulate successful login
      const mockUser: User = {
        id: 'user-123',
        email,
        role: 'COUPLE',
        accountId: 'account-123',
      };
      
      const mockToken = 'mock-jwt-token';
      
      await auth.saveUser(mockUser);
      await auth.saveToken(mockToken);
      
      setUser(mockUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

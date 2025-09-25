import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
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
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and validate
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you'd validate the token with the server
      // For now, we'll just set loading to false
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Implement login logic here
      console.log('Login attempt:', email);
      // For demo purposes, create a mock user
      const mockUser: User = {
        _id: '1',
        name: 'Demo User',
        email: email,
        role: email.includes('admin') ? 'admin' : 'user'
      };
      setUser(mockUser);
      localStorage.setItem('token', 'demo-token');
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const register = async (userData: any) => {
    try {
      // Implement registration logic here
      console.log('Registration attempt:', userData);
      const mockUser: User = {
        _id: '1',
        name: userData.name,
        email: userData.email,
        role: 'user'
      };
      setUser(mockUser);
      localStorage.setItem('token', 'demo-token');
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
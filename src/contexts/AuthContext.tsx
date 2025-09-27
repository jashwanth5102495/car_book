import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'car_owner' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsAdmin: () => Promise<boolean>;
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
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const response = await fetch('http://localhost:5001/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const user: User = {
              _id: data._id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              role: data.role
            };
            setUser(user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.log('Token validation failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const user: User = {
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role
      };

      setUser(user);
      localStorage.setItem('token', data.token);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const loginAsAdmin = async () => {
    try {
      await login('admin@carrental.com', 'admin123');
      return true;
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const user: User = {
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role
      };

      setUser(user);
      localStorage.setItem('token', data.token);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
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
    loginAsAdmin,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../utils/api';

interface User {
  id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionToken: string | null;
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
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user and session from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('mindfulmate_user');
    const savedToken = localStorage.getItem('mindfulmate_session');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setSessionToken(savedToken);
        
        // Validate session with backend
        authAPI.getCurrentUser(savedToken)
          .then(response => {
            if (response.success) {
              // Update user data from backend
              setUser(response.user);
            } else {
              // Session invalid, clear data
              clearAuthData();
            }
          })
          .catch(() => {
            // Session validation failed, clear data
            clearAuthData();
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (error) {
        console.error('Error parsing saved auth data:', error);
        clearAuthData();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const clearAuthData = () => {
    setUser(null);
    setSessionToken(null);
    localStorage.removeItem('mindfulmate_user');
    localStorage.removeItem('mindfulmate_session');
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(username, password);
      
      if (response.success) {
        const newUser: User = {
          id: response.user.username,
          username: response.user.username,
          email: response.user.email
        };
        
        setUser(newUser);
        setSessionToken(response.session_token);
        
        localStorage.setItem('mindfulmate_user', JSON.stringify(newUser));
        localStorage.setItem('mindfulmate_session', response.session_token);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.register(username, email, password);
      
      if (response.success) {
        // After successful registration, automatically log in
        return await login(username, password);
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    if (sessionToken) {
      // Try to logout on backend (fire and forget)
      authAPI.logout(sessionToken).catch(console.error);
    }
    clearAuthData();
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
    sessionToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

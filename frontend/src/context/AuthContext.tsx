import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { AuthResponse, User } from '../types/auth';

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('task-manager-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('task-manager-token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data.data);
        setToken(savedToken);
      } catch {
        localStorage.removeItem('task-manager-token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const saveSession = (authData: AuthResponse) => {
    const normalizedUser = authData.user ?? {
      id: authData.id ?? authData._id ?? '',
      name: authData.name ?? '',
      email: authData.email ?? '',
      role: authData.role
    };

    localStorage.setItem('task-manager-token', authData.token);
    setUser(normalizedUser);
    setToken(authData.token);
  };

  const login = async (payload: { email: string; password: string }) => {
    const response = await api.post('/auth/login', payload);
    saveSession(response.data.data);
  };

  const register = async (payload: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', payload);
    saveSession(response.data.data);
  };

  const logout = () => {
    localStorage.removeItem('task-manager-token');
    setUser(null);
    setToken(null);
  };

  const value = useMemo<AuthContextType>(() => ({ user, token, login, register, logout, loading }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi, type AuthUser } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    birthDate?: string;
    idPicture?: File | null;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const cachedUser = localStorage.getItem('auth.user');
    return cachedUser ? (JSON.parse(cachedUser) as AuthUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth.token'));

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const nextUser = response.user ?? null;
    const nextToken = response.token ?? null;

    if (nextUser && nextToken) {
      setUser(nextUser);
      setToken(nextToken);
      localStorage.setItem('auth.user', JSON.stringify(nextUser));
      localStorage.setItem('auth.token', nextToken);
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    birthDate?: string;
    idPicture?: File | null;
  }) => {
    await authApi.register(payload);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth.user');
    localStorage.removeItem('auth.token');
  };

  const contextValue = useMemo(
    () => ({ user, token, isAuthenticated: !!user && !!token, login, register, logout }),
    [user, token]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

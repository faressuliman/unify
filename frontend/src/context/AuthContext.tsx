/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi, userApi, type AuthUser } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { deleteCookie, getCookie, setCookie } from '@/lib/cookieService';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    city: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    birthDate?: string;
    idPicture?: File | null;
    selfiePicture?: File | null;
  }) => Promise<void>;
  updateUser: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fallbackAuthContext: AuthContextType = {
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {
    return;
  },
  register: async () => {
    return;
  },
  updateUser: () => {},
  logout: () => {},
};

const AUTH_TOKEN_COOKIE = 'unify.auth.token';
const AUTH_USER_COOKIE = 'unify.auth.user';
const REMEMBER_DAYS = 30;
const DEFAULT_DAYS = 1;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const cachedUser = getCookie(AUTH_USER_COOKIE);
    return cachedUser ? (JSON.parse(cachedUser) as AuthUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => getCookie(AUTH_TOKEN_COOKIE));

  // Maintain a single socket.io connection while authenticated. The socket
  // is established as soon as we have a token and torn down on logout so
  // realtime listeners across the app can `getSocket()` synchronously.
  useEffect(() => {
    if (token) {
      connectSocket(token);
    } else {
      disconnectSocket();
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const syncUser = async () => {
      try {
        const profile = await userApi.getProfile(token);
        if (cancelled) return;

        const nextUser = profile.user;
        setUser(nextUser);
        setCookie(AUTH_USER_COOKIE, JSON.stringify(nextUser), {
          days: DEFAULT_DAYS,
        });
      } catch {
        // Ignore profile sync failures and keep the cached auth user.
      }
    };

    void syncUser();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    const response = await authApi.login({ email, password });
    const nextUser = response.user ?? null;
    const nextToken = response.token ?? null;

    if (nextUser && nextToken) {
      const days = rememberMe ? REMEMBER_DAYS : DEFAULT_DAYS;
      setUser(nextUser);
      setToken(nextToken);
      setCookie(AUTH_USER_COOKIE, JSON.stringify(nextUser), { days });
      setCookie(AUTH_TOKEN_COOKIE, nextToken, { days });
    }
  };

  const register = async (payload: {
    name: string;
    email: string;
    city: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    birthDate?: string;
    idPicture?: File | null;
    selfiePicture?: File | null;
  }) => {
    await authApi.register(payload);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    deleteCookie(AUTH_USER_COOKIE);
    deleteCookie(AUTH_TOKEN_COOKIE);
  };

  const updateUser = (nextUser: AuthUser | null) => {
    setUser(nextUser);
    if (!nextUser) {
      deleteCookie(AUTH_USER_COOKIE);
      return;
    }
    const days = getCookie(AUTH_TOKEN_COOKIE) ? REMEMBER_DAYS : DEFAULT_DAYS;
    setCookie(AUTH_USER_COOKIE, JSON.stringify(nextUser), { days });
  };

  const contextValue = useMemo(
    () => ({ user, token, isAuthenticated: !!user && !!token, login, register, updateUser, logout }),
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
    return fallbackAuthContext;
  }
  return context;
}

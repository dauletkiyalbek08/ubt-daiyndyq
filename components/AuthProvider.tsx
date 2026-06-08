"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  clearToken,
  getToken,
  setToken,
  type AuthUser,
} from "@/lib/api";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: {
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  loginWithTelegram: (data: Record<string, unknown>) => Promise<void>;
  setUser: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // При загрузке: если есть токен — подтягиваем профиль
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.login({ email, password });
    setToken(res.token);
    setUser(res.user);
  }

  async function register(body: {
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
    password: string;
  }) {
    const res = await api.register(body);
    setToken(res.token);
    setUser(res.user);
  }

  // Вход по готовому токену (после редиректа от Google)
  async function loginWithToken(token: string) {
    setToken(token);
    const u = await api.me();
    setUser(u);
  }

  // Вход через Telegram Login Widget
  async function loginWithTelegram(data: Record<string, unknown>) {
    const res = await api.telegramLogin(data);
    setToken(res.token);
    setUser(res.user);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithToken, loginWithTelegram, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth тек AuthProvider ішінде қолданылады");
  return ctx;
}

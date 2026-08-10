import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../lib/api";
import { User } from "../types";
import { tvHandle } from "../lib/utils";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser(retries = 2, delayMs = 1500) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data } = await api.get<User>("/auth/me");
        setUser(data);
        return;
      } catch (err: any) {
        if (err.response?.status === 401) {
          setUser(null);
          return;
        }
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          setUser(null);
        }
      }
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.title = tvHandle(user?.username);
  }, [user]);

  async function login(username: string, password: string) {
    const { data } = await api.post<User & { token?: string }>("/auth/login", { username, password });
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    setUser(data);
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

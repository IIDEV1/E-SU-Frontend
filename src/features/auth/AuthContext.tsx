import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { authApi, type LoginPayload } from "@/services/endpoints/auth.api";
import type { User, UserRole } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  hasRole: (roles?: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("esu_user") ?? sessionStorage.getItem("esu_user");
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(payload);
      const storage = payload.remember ? localStorage : sessionStorage;
      storage.setItem("esu_token", response.token);
      storage.setItem("esu_user", JSON.stringify(response.user));
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("esu_token");
    localStorage.removeItem("esu_user");
    sessionStorage.removeItem("esu_token");
    sessionStorage.removeItem("esu_user");
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (roles?: UserRole[]) => !roles?.length || (!!user && roles.includes(user.role)),
    [user],
  );

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), isLoading, login, logout, hasRole }),
    [hasRole, isLoading, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, type LoginPayload } from "@/services/endpoints/auth.api";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/services/tokenStorage";
import type { Permission, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission?: Permission | Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      if (!getAccessToken()) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authApi.me();
        if (isMounted) setUser(currentUser);
      } catch {
        clearTokens();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(payload);
      setTokens({ access: response.access, refresh: response.refresh }, payload.remember);
      const currentUser = await authApi.me().catch(() => response.user);
      setUser(currentUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    try {
      if (refresh) {
        await authApi.logout(refresh);
      }
    } finally {
      clearTokens();
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const can = useCallback(
    (permission?: Permission | Permission[]) => {
      if (!permission) return true;
      if (!user) return false;
      const required = Array.isArray(permission) ? permission : [permission];
      return required.every((item) => user.permissions.includes(item));
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), isLoading, login, logout, can }),
    [can, isLoading, login, logout, user],
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

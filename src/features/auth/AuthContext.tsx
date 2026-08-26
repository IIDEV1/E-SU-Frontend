import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, type LoginPayload } from "@/services/endpoints/auth.api";
import { resetAuthFailureState, setAuthFailureHandler } from "@/services/api";
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

export function hasPermissions(
  user: Pick<User, "permissions"> | null,
  permission?: Permission | Permission[],
) {
  if (!permission) return true;
  if (!user) return false;

  const required = Array.isArray(permission) ? permission : [permission];
  return required.every((item) => user.permissions.includes(item));
}

export async function establishAuthenticatedSession(payload: LoginPayload): Promise<User> {
  const tokens = await authApi.login(payload);
  setTokens(tokens, payload.remember);
  resetAuthFailureState();
  return authApi.me();
}

export async function restoreAuthenticatedSession(): Promise<User | null> {
  if (!getAccessToken()) {
    return null;
  }

  return authApi.me();
}

export function handleExpiredAuthSession({
  clearQueryCache,
  clearUser,
  redirectToLogin,
}: {
  clearQueryCache: () => void;
  clearUser: () => void;
  redirectToLogin: () => void;
}) {
  clearQueryCache();
  clearUser();
  redirectToLogin();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAuthFailureHandler(() => {
      handleExpiredAuthSession({
        clearQueryCache: () => queryClient.clear(),
        clearUser: () => setUser(null),
        redirectToLogin: () => window.location.assign("/login"),
      });
    });

    return () => {
      setAuthFailureHandler(null);
    };
  }, [queryClient]);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const currentUser = await restoreAuthenticatedSession();
        if (isMounted) setUser(currentUser);
      } catch {
        clearTokens();
        queryClient.clear();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, [queryClient]);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const currentUser = await establishAuthenticatedSession(payload);
      setUser(currentUser);
    } catch (error) {
      clearTokens();
      setUser(null);
      throw error;
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
    (permission?: Permission | Permission[]) => hasPermissions(user, permission),
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

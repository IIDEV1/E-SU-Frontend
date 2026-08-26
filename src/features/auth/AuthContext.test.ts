import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  establishAuthenticatedSession,
  hasPermissions,
  handleExpiredAuthSession,
  restoreAuthenticatedSession,
} from "@/features/auth/AuthContext";
import { authApi } from "@/services/endpoints/auth.api";
import { clearTokens, getAccessToken, setTokens } from "@/services/tokenStorage";
import type { User } from "@/types";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const local = new MemoryStorage();
const session = new MemoryStorage();

Object.defineProperty(globalThis, "localStorage", { configurable: true, value: local });
Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: session });

const employee: User = {
  id: "employee-1",
  email: "employee@esu.kg",
  first_name: "Сотрудник",
  last_name: "Е-СУ",
  full_name: "Сотрудник Е-СУ",
  name: "Сотрудник Е-СУ",
  department: null,
  role: { id: "employee", code: "employee", name: "Сотрудник" },
  status: "active",
  permissions: ["documents.view"],
};

describe("auth lifecycle and permissions", () => {
  beforeEach(() => {
    local.clear();
    session.clear();
    clearTokens();
    vi.restoreAllMocks();
  });

  it("logs in, persists tokens, then loads the authoritative user from /auth/me/", async () => {
    const login = vi.spyOn(authApi, "login").mockResolvedValue({ access: "access", refresh: "refresh" });
    const me = vi.spyOn(authApi, "me").mockResolvedValue(employee);

    await expect(
      establishAuthenticatedSession({ email: employee.email, password: "password", remember: false }),
    ).resolves.toEqual(employee);

    expect(login).toHaveBeenCalledTimes(1);
    expect(me).toHaveBeenCalledTimes(1);
    expect(login.mock.invocationCallOrder[0]).toBeLessThan(me.mock.invocationCallOrder[0]);
    expect(getAccessToken()).toBe("access");
  });

  it("restores a session through /auth/me/ only when a token exists", async () => {
    const me = vi.spyOn(authApi, "me").mockResolvedValue(employee);

    await expect(restoreAuthenticatedSession()).resolves.toBeNull();
    expect(me).not.toHaveBeenCalled();

    setTokens({ access: "access", refresh: "refresh" }, true);
    await expect(restoreAuthenticatedSession()).resolves.toEqual(employee);
    expect(me).toHaveBeenCalledTimes(1);
  });

  it("uses permissions from auth/me rather than a role name for route access", () => {
    const sameRoleNameDifferentPermissions: User = {
      ...employee,
      role: { id: "admin-looking", code: "admin", name: "Администратор" },
      permissions: ["documents.view"],
    };

    expect(hasPermissions(sameRoleNameDifferentPermissions, "settings.manage")).toBe(false);
    expect(hasPermissions(employee, ["documents.view"])).toBe(true);
    expect(hasPermissions(employee, ["users.manage", "audit.view"])).toBe(false);
  });

  it("clears cached data, clears the current user, and redirects after refresh failure", () => {
    const clearQueryCache = vi.fn();
    const clearUser = vi.fn();
    const redirectToLogin = vi.fn();

    handleExpiredAuthSession({ clearQueryCache, clearUser, redirectToLogin });

    expect(clearQueryCache).toHaveBeenCalledTimes(1);
    expect(clearUser).toHaveBeenCalledTimes(1);
    expect(redirectToLogin).toHaveBeenCalledWith();
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
  updateTokens,
} from "@/services/tokenStorage";

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

describe("tokenStorage", () => {
  beforeEach(() => {
    local.clear();
    session.clear();
  });

  it("stores a remembered token pair in localStorage", () => {
    setTokens({ access: "access", refresh: "refresh" }, true);

    expect(getAccessToken()).toBe("access");
    expect(getRefreshToken()).toBe("refresh");
    expect(session.length).toBe(0);
  });

  it("keeps a non-remembered token pair in sessionStorage and preserves its location on refresh", () => {
    setTokens({ access: "access", refresh: "refresh" }, false);
    updateTokens({ access: "next-access", refresh: "next-refresh" });

    expect(getAccessToken()).toBe("next-access");
    expect(getRefreshToken()).toBe("next-refresh");
    expect(local.getItem("esu_access_token")).toBeNull();
  });

  it("removes access and refresh tokens from both storage scopes", () => {
    setTokens({ access: "access", refresh: "refresh" }, true);
    session.setItem("esu_access_token", "stale-access");
    session.setItem("esu_refresh_token", "stale-refresh");

    clearTokens();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});

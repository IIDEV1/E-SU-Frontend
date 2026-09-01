import { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  api,
  normalizeApiError,
  publicApi,
  resetAuthFailureState,
  setAuthFailureHandler,
} from "@/services/api";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/services/tokenStorage";

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

function success(config: InternalAxiosRequestConfig, data: unknown): AxiosResponse {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: new AxiosHeaders(),
    config,
  };
}

function failure(config: InternalAxiosRequestConfig, status: number) {
  const response: AxiosResponse = {
    data: { error: { code: `http_${status}`, message: `HTTP ${status}` } },
    status,
    statusText: "Error",
    headers: new AxiosHeaders(),
    config,
  };

  return new AxiosError("Request failed", undefined, config, undefined, response);
}

describe("authenticated Axios client", () => {
  beforeEach(() => {
    local.clear();
    session.clear();
    clearTokens();
    resetAuthFailureState();
    setAuthFailureHandler(null);
  });

  afterEach(() => {
    api.defaults.adapter = undefined;
    publicApi.defaults.adapter = undefined;
    setAuthFailureHandler(null);
  });

  it("uses one refresh request for five parallel 401 responses and retries every request", async () => {
    setTokens({ access: "expired-access", refresh: "refresh-token" }, false);
    let refreshCalls = 0;
    let protectedCalls = 0;

    publicApi.defaults.adapter = async (config) => {
      refreshCalls += 1;
      expect(config.url).toBe("/auth/refresh/");
      return success(config, { data: { access: "fresh-access", refresh: "fresh-refresh" }, message: "Success" });
    };
    api.defaults.adapter = async (config) => {
      protectedCalls += 1;
      const authorization = new AxiosHeaders(config.headers).get("Authorization");
      if (authorization !== "Bearer fresh-access") {
        throw failure(config, 401);
      }
      return success(config, { data: { ok: true }, message: "Success" });
    };

    const responses = await Promise.all(
      Array.from({ length: 5 }, (_, index) => api.get(`/protected/${index}/`)),
    );

    expect(responses).toHaveLength(5);
    expect(refreshCalls).toBe(1);
    expect(protectedCalls).toBe(10);
    expect(getAccessToken()).toBe("fresh-access");
    expect(getRefreshToken()).toBe("fresh-refresh");
  });

  it("cleans the tokens and runs the registered expiry handler only once when refresh fails", async () => {
    setTokens({ access: "expired-access", refresh: "refresh-token" }, true);
    const onExpired = vi.fn();
    setAuthFailureHandler(onExpired);

    publicApi.defaults.adapter = async (config) => {
      throw failure(config, 401);
    };
    api.defaults.adapter = async (config) => {
      throw failure(config, 401);
    };

    const outcomes = await Promise.allSettled(
      Array.from({ length: 5 }, (_, index) => api.get(`/protected/${index}/`)),
    );

    expect(outcomes.every((outcome) => outcome.status === "rejected")).toBe(true);
    expect(onExpired).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("does not refresh or expire the session for a 403 response", async () => {
    setTokens({ access: "active-access", refresh: "refresh-token" }, true);
    const onExpired = vi.fn();
    setAuthFailureHandler(onExpired);
    const refreshAdapter = vi.fn();
    publicApi.defaults.adapter = refreshAdapter;
    api.defaults.adapter = async (config) => {
      throw failure(config, 403);
    };

    await expect(api.get("/forbidden/")).rejects.toMatchObject({ status: 403, code: "http_403" });

    expect(refreshAdapter).not.toHaveBeenCalled();
    expect(onExpired).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe("active-access");
  });

  it("normalizes backend envelopes and network failures into distinct user-facing errors", () => {
    const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
    const tooLarge = normalizeApiError(failure(config, 413));
    const offline = normalizeApiError(new Error("offline"));

    expect(tooLarge).toMatchObject({ status: 413, code: "http_413", message: "HTTP 413" });
    expect(offline).toMatchObject({ code: "network_error" });
  });
});

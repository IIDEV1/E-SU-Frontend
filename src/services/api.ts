import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, updateTokens } from "@/services/tokenStorage";
import type { ApiEnvelope, ApiErrorResponse, AppApiError } from "@/services/types";

const baseURL = import.meta.env.VITE_API_URL ?? "https://esubackend21.pythonanywhere.com/api/v1";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const publicApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

function toAppApiError(error: AxiosError<ApiErrorResponse>): AppApiError {
  const backendError = error.response?.data?.error;
  let message = backendError?.message ?? error.message ?? "Произошла ошибка при выполнении запроса.";

  if (backendError?.details && typeof backendError.details === "object") {
    const detailParts: string[] = [];
    for (const [key, value] of Object.entries(backendError.details)) {
      if (Array.isArray(value)) {
        detailParts.push(`${key}: ${value.join(", ")}`);
      } else if (typeof value === "string") {
        detailParts.push(`${key}: ${value}`);
      } else if (value && typeof value === "object") {
        detailParts.push(`${key}: ${JSON.stringify(value)}`);
      }
    }
    if (detailParts.length > 0) {
      message = `${message} (${detailParts.join("; ")})`;
    }
  }

  return {
    status: error.response?.status,
    code: backendError?.code ?? "network_error",
    message,
    details: backendError?.details,
  };
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refresh = getRefreshToken();
      if (!refresh) return null;

      try {
        const response = await publicApi.post<ApiEnvelope<{ access: string; refresh: string }>>("/auth/refresh/", { refresh });
        updateTokens(response.data.data);
        return response.data.data.access;
      } catch {
        clearTokens();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      return refreshAccessToken().then((access) => {
        if (!access) {
          clearTokens();
          window.location.assign("/login");
          return Promise.reject(toAppApiError(error));
        }

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      });
    }

    return Promise.reject(toAppApiError(error));
  },
);

export function unwrapResponse<T>(response: { data: ApiEnvelope<T> }): T {
  return response.data.data;
}

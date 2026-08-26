import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, updateTokens } from "@/services/tokenStorage";
import type { ApiEnvelope, ApiErrorResponse, AppApiError } from "@/services/types";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const publicApi = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;
let authFailureHandled = false;
let authFailureHandler: (() => void) | null = null;

const fallbackMessages: Record<number, string> = {
  400: "Некорректные данные",
  401: "Требуется авторизация",
  403: "Недостаточно прав",
  404: "Объект не найден",
  409: "Конфликт данных",
  413: "Размер файла превышает допустимый лимит",
  429: "Слишком много запросов. Попробуйте позже",
  500: "Внутренняя ошибка сервера",
};

export function normalizeApiError(error: unknown): AppApiError {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return {
      code: "network_error",
      message: "Не удалось подключиться к серверу. Проверьте интернет-соединение.",
    };
  }

  const backendError = error.response?.data?.error;
  const status = error.response?.status;

  return {
    status,
    code: backendError?.code ?? "network_error",
    message:
      backendError?.message ??
      (status ? fallbackMessages[status] ?? "Произошла ошибка при выполнении запроса." : "Не удалось подключиться к серверу. Проверьте интернет-соединение."),
    details: backendError?.details,
  };
}

export function setAuthFailureHandler(handler: (() => void) | null) {
  authFailureHandler = handler;
}

export function resetAuthFailureState() {
  authFailureHandled = false;
}

function handleAuthFailure() {
  clearTokens();

  if (authFailureHandled) {
    return;
  }

  authFailureHandled = true;

  if (authFailureHandler) {
    authFailureHandler();
    return;
  }

  window.location.assign("/login");
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
          handleAuthFailure();
          return Promise.reject(normalizeApiError(error));
        }

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      });
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export function unwrapResponse<T>(response: { data: ApiEnvelope<T> }): T {
  return response.data.data;
}

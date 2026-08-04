import axios, { AxiosError } from "axios";
import type { ApiError } from "@/types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("esu_token") ?? sessionStorage.getItem("esu_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("esu_token");
      sessionStorage.removeItem("esu_token");
      window.location.assign("/login");
    }

    return Promise.reject({
      message: error.response?.data?.message ?? "Произошла ошибка при выполнении запроса.",
      status: error.response?.status,
      details: error.response?.data?.details,
    } satisfies ApiError);
  },
);

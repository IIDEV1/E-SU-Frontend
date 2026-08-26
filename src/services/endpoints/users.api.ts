import { api, unwrapResponse } from "@/services/api";
import { mapUser } from "@/services/mappers";
import type { ApiEnvelope, ApiPagination } from "@/services/types";
import type { User } from "@/types";

export interface UsersQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  department?: string;
  role?: string;
  status?: string;
  ordering?: "last_name" | "-last_name" | "email" | "-email" | "created_at" | "-created_at" | "status" | "-status";
}

export interface UserCreatePayload {
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone: string;
  position: string;
  department: string | null;
  manager: string | null;
  role: string | null;
  status: "active" | "blocked" | "invited";
  send_credentials: boolean;
}

export interface UserUpdatePayload {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone?: string;
  position?: string;
  department?: string | null;
  manager?: string | null;
  role?: string | null;
}

export const usersApi = {
  async getUsersPage(params: UsersQueryParams = {}) {
    const response = await api.get<ApiEnvelope<ApiPagination<User>>>("/users/", {
      params: { page: 1, page_size: 20, ...params },
    });
    const page = unwrapResponse(response);
    return { ...page, results: page.results.map(mapUser) };
  },
  async getUsers() { return (await this.getUsersPage({ page_size: 100 })).results; },

  async getUser(id: string) {
    const response = await api.get<ApiEnvelope<User>>(`/users/${id}/`);
    return mapUser(unwrapResponse(response));
  },

  async createUser(payload: UserCreatePayload | Record<string, unknown>) {
    const response = await api.post<ApiEnvelope<User>>("/users/", payload);
    return mapUser(unwrapResponse(response));
  },

  async updateUser(id: string, payload: UserUpdatePayload | Record<string, unknown>) {
    const response = await api.patch<ApiEnvelope<User>>(`/users/${id}/`, payload);
    return mapUser(unwrapResponse(response));
  },

  async activateUser(id: string) {
    const response = await api.post<ApiEnvelope<User>>(`/users/${id}/activate/`);
    return mapUser(unwrapResponse(response));
  },

  async blockUser(id: string) {
    const response = await api.post<ApiEnvelope<User>>(`/users/${id}/block/`);
    return mapUser(unwrapResponse(response));
  },
};

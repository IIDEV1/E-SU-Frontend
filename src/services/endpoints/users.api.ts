import { api, unwrapResponse } from "@/services/api";
import { mapUser } from "@/services/mappers";
import type { ApiEnvelope, ApiPagination } from "@/services/types";
import type { User } from "@/types";

export const usersApi = {
  async getUsers() {
    const response = await api.get<ApiEnvelope<ApiPagination<User>>>("/users/", { params: { page_size: 100 } });
    return unwrapResponse(response).results.map(mapUser);
  },

  async getUser(id: string) {
    const response = await api.get<ApiEnvelope<User>>(`/users/${id}/`);
    return mapUser(unwrapResponse(response));
  },

  async createUser(payload: Record<string, unknown>) {
    const response = await api.post<ApiEnvelope<User>>("/users/", payload);
    return mapUser(unwrapResponse(response));
  },

  async updateUser(id: string, payload: Record<string, unknown>) {
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

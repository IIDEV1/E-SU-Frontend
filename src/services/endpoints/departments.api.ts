import { api, unwrapResponse } from "@/services/api";
import type { ApiEnvelope, ApiPagination } from "@/services/types";
import type { Department } from "@/types";

export const departmentsApi = {
  async getDepartments() {
    const response = await api.get<ApiEnvelope<ApiPagination<Department>>>("/departments/", { params: { page_size: 100 } });
    return unwrapResponse(response).results;
  },

  async createDepartment(payload: Record<string, unknown>) {
    const response = await api.post<ApiEnvelope<Department>>("/departments/", payload);
    return unwrapResponse(response);
  },

  async updateDepartment(id: string, payload: Record<string, unknown>) {
    const response = await api.patch<ApiEnvelope<Department>>(`/departments/${id}/`, payload);
    return unwrapResponse(response);
  },

  async deleteDepartment(id: string) {
    await api.delete(`/departments/${id}/`);
  },
};

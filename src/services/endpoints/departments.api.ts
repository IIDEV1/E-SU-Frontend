import { api, unwrapResponse } from "@/services/api";
import type { ApiEnvelope, ApiPagination } from "@/services/types";
import type { Department } from "@/types";

export interface DepartmentsQueryParams {
  page?: number;
  page_size?: number;
  name?: string;
  code?: string;
  status?: "active" | "inactive";
}

export interface DepartmentWritePayload {
  name: string;
  code: string;
  description: string;
  parent: string | null;
  manager: string | null;
  status: "active" | "inactive";
}

export const departmentsApi = {
  async getDepartmentsPage(params: DepartmentsQueryParams = {}) {
    const response = await api.get<ApiEnvelope<ApiPagination<Department>>>("/departments/", {
      params: { page: 1, page_size: 20, ...params },
    });
    return unwrapResponse(response);
  },
  async getDepartments() { return (await this.getDepartmentsPage({ page_size: 100 })).results; },

  async createDepartment(payload: DepartmentWritePayload) {
    const response = await api.post<ApiEnvelope<Department>>("/departments/", payload);
    return unwrapResponse(response);
  },

  async updateDepartment(id: string, payload: Partial<DepartmentWritePayload>) {
    const response = await api.patch<ApiEnvelope<Department>>(`/departments/${id}/`, payload);
    return unwrapResponse(response);
  },

  async deleteDepartment(id: string) {
    await api.delete(`/departments/${id}/`);
  },
};

import { api, unwrapResponse } from "@/services/api";
import type { ApiEnvelope, ApiPagination } from "@/services/types";
import type { AdminAuditLog, AdminCategory, AdminDepartment, AdminPermission, AdminPermissionDefinition, AdminRole, AdminSettings, AdminUser } from "@/features/admin/types";
import type { Department, DocumentCategory, PaginatedResponse, Permission, User } from "@/types";

interface BackendRole {
  id: string;
  code: string;
  name: string;
  description?: string;
  permissions: Permission[];
  users_count?: number;
}
interface BackendPermission { id: string; code: string; name: string; group: string; description: string; }

export interface AuditLogDto {
  id: string;
  user: { id: string; email: string; full_name: string } | null;
  action: string;
  action_display: string;
  object_type: string;
  object_id: string;
  description: string;
  ip_address: string | null;
  user_agent: string;
  result: "success" | "failure";
  result_display: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditActionDto {
  code: string;
  name: string;
}

export interface AuditLogsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  user?: string;
  userEmail?: string;
  action?: string;
  objectType?: string;
  objectId?: string;
  result?: "success" | "failure";
  dateFrom?: string;
  dateTo?: string;
  ordering?: "created_at" | "-created_at" | "action" | "-action";
}

interface BackendSetting {
  key: string;
  typed_value: unknown;
}

function splitName(fullName: string) {
  const [last_name = "", first_name = "", ...rest] = fullName.trim().split(/\s+/);
  return { first_name, last_name, middle_name: rest.join(" ") };
}

export function mapAdminUser(user: User): AdminUser {
  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    position: user.position ?? "",
    phone: user.phone ?? "",
    departmentId: user.department?.id ?? "",
    managerId: user.manager?.id,
    role: (user.role?.code ?? "employee") as AdminUser["role"],
    roleId: user.role?.id,
    status: user.status === "blocked" ? "blocked" : user.status === "invited" ? "pending" : "active",
    lastActive: user.last_login ?? "Нет данных",
  };
}

export function toUserPayload(user: Partial<AdminUser>) {
  return {
    ...splitName(user.fullName ?? ""),
    email: user.email,
    phone: user.phone,
    position: user.position,
    department: user.departmentId || null,
    manager: user.managerId || null,
    role: user.roleId || user.role || null,
    status: user.status === "pending" ? "invited" : user.status,
  };
}

export function mapAdminDepartment(department: Department & { manager?: { id: string } | null; parent?: Department | null }): AdminDepartment {
  return {
    id: department.id,
    name: department.name,
    code: department.code,
    headId: department.manager?.id,
    parentId: department.parent?.id,
    description: "description" in department ? String(department.description ?? "") : "",
    status: department.status === "inactive" || department.status === "disabled" ? "disabled" : "active",
  };
}

export function toDepartmentPayload(department: Partial<AdminDepartment>) {
  return {
    name: department.name,
    code: department.code,
    description: department.description ?? "",
    parent: department.parentId || null,
    manager: department.headId || null,
    status: department.status === "disabled" ? "inactive" : "active",
  };
}

export function mapAdminCategory(category: DocumentCategory & Record<string, unknown>): AdminCategory {
  const allowed = (category.allowed_departments_details as Department[] | undefined) ?? [];
  return {
    id: category.id,
    name: category.name,
    code: category.code,
    description: String(category.description ?? ""),
    retentionPeriod: String(category.retention_period_days ?? ""),
    departmentIds: allowed.map((department) => department.id),
    status: category.status === "inactive" || category.status === "disabled" ? "disabled" : "active",
    documentCount: Number(category.document_count ?? 0),
  };
}

export function toCategoryPayload(category: Partial<AdminCategory>) {
  return {
    name: category.name,
    code: category.code,
    description: category.description ?? "",
    retention_period_days: Number.parseInt(category.retentionPeriod ?? "0", 10) || 0,
    allowed_departments: category.departmentIds ?? [],
    status: category.status === "disabled" ? "inactive" : "active",
  };
}

export function mapAdminRole(role: BackendRole): AdminRole {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description ?? "",
    permissions: role.permissions,
  };
}

export function mapAdminAuditLog(log: AuditLogDto): AdminAuditLog {
  return {
    id: log.id,
    user: log.user && { id: log.user.id, email: log.user.email, fullName: log.user.full_name },
    action: log.action,
    actionDisplay: log.action_display,
    objectType: log.object_type,
    objectId: log.object_id,
    description: log.description,
    result: log.result,
    resultDisplay: log.result_display,
    createdAt: log.created_at,
  };
}

export function serializeAuditLogQueryParams(params: AuditLogsParams) {
  return {
    page: params.page,
    page_size: params.pageSize,
    search: params.search?.trim() || undefined,
    user: params.user?.trim() || undefined,
    user_email: params.userEmail?.trim() || undefined,
    action: params.action || undefined,
    object_type: params.objectType?.trim() || undefined,
    object_id: params.objectId?.trim() || undefined,
    result: params.result,
    date_from: params.dateFrom || undefined,
    date_to: params.dateTo || undefined,
    ordering: params.ordering,
  };
}

export function settingsFromBackend(settings: BackendSetting[]): AdminSettings {
  const value = (key: string, fallback: unknown) => settings.find((item) => item.key === key)?.typed_value ?? fallback;
  return {
    general: {
      systemName: String(value("system_name", "E-SU")),
      timezone: String(value("timezone", "Asia/Bishkek")),
      language: String(value("language", "ru")),
      dateFormat: String(value("date_format", "DD.MM.YYYY")),
    },
    university: {
      name: String(value("university_name", "Salymbekov University")),
      shortName: String(value("university_short_name", "SU")),
      rector: String(value("university_rector", "")),
      address: String(value("university_address", "")),
      email: String(value("university_email", "")),
      phone: String(value("university_phone", "")),
    },
    numbering: {
      prefix: String(value("document_number_prefix", "ESU")),
      format: String(value("document_number_format", "{prefix}-{department}-{year}-{number}")),
      startNumber: String(value("document_number_start", "1")),
      includeYear: true,
      includeDepartment: true,
      includeSequence: true,
    },
    fileFormats: { pdf: true, docx: true, xlsx: true, png: true, jpg: true },
    maxFileSizeMb: Number(value("max_file_size_mb", 25)),
    documentStatuses: [
      { id: "draft", name: "Черновик", color: "gray", active: true, order: 1 },
      { id: "in_review", name: "На согласовании", color: "orange", active: true, order: 2 },
      { id: "approved", name: "Согласован", color: "green", active: true, order: 3 },
    ],
    emailNotifications: { enabled: true, assigned: true, approved: true, returned: true, deadlineReminder: true },
    allowedExtensions: ["pdf", "doc", "docx", "xlsx", "png", "jpg", "jpeg"],
    fileLimits: { maxSizeMb: Number(value("max_file_size_mb", 25)), maxFiles: Number(value("max_document_files", 10)) },
  };
}

export const adminApi = {
  async getCategories() {
    const response = await api.get<ApiEnvelope<ApiPagination<unknown>>>("/document-categories/", { params: { page_size: 100 } });
    return unwrapResponse(response).results.map((item) => mapAdminCategory(item as DocumentCategory & Record<string, unknown>));
  },

  async createCategory(payload: Partial<AdminCategory>) {
    const response = await api.post<ApiEnvelope<unknown>>("/document-categories/", toCategoryPayload(payload));
    return mapAdminCategory(unwrapResponse(response) as DocumentCategory & Record<string, unknown>);
  },

  async updateCategory(id: string, payload: Partial<AdminCategory>) {
    const response = await api.patch<ApiEnvelope<unknown>>(`/document-categories/${id}/`, toCategoryPayload(payload));
    return mapAdminCategory(unwrapResponse(response) as DocumentCategory & Record<string, unknown>);
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/document-categories/${id}/`);
  },

  async getRoles() {
    const response = await api.get<ApiEnvelope<ApiPagination<BackendRole>>>("/roles/", { params: { page_size: 100 } });
    return unwrapResponse(response).results.map(mapAdminRole);
  },

  async getPermissions(): Promise<AdminPermissionDefinition[]> {
    const response = await api.get<ApiEnvelope<ApiPagination<BackendPermission>>>("/permissions/", { params: { page_size: 100 } });
    return unwrapResponse(response).results;
  },

  async setRolePermissions(roleId: string, permissions: AdminPermission[]) {
    const response = await api.put<ApiEnvelope<BackendRole>>(`/roles/${roleId}/permissions/`, { permissions });
    return mapAdminRole(unwrapResponse(response));
  },

  async getAuditLogs(params: AuditLogsParams = {}): Promise<PaginatedResponse<AdminAuditLog>> {
    const response = await api.get<ApiEnvelope<ApiPagination<AuditLogDto>>>("/audit/", { params: serializeAuditLogQueryParams(params) });
    const page = unwrapResponse(response);
    return {
      data: page.results.map(mapAdminAuditLog),
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      total: page.count,
      next: page.next,
      previous: page.previous,
    };
  },

  async getAuditActions(): Promise<AuditActionDto[]> {
    const response = await api.get<ApiEnvelope<AuditActionDto[]>>("/audit/actions/");
    return unwrapResponse(response);
  },

  async getSettings() {
    const response = await api.get<ApiEnvelope<BackendSetting[]>>("/settings/");
    return settingsFromBackend(unwrapResponse(response));
  },

  async updateSettings(settings: AdminSettings) {
    const response = await api.patch<ApiEnvelope<BackendSetting[]>>("/settings/", {
      system_name: settings.general.systemName,
      timezone: settings.general.timezone,
      language: settings.general.language,
      university_name: settings.university.name,
      university_email: settings.university.email,
      document_number_prefix: settings.numbering.prefix,
      document_number_format: settings.numbering.format,
      max_file_size_mb: settings.fileLimits.maxSizeMb,
      max_document_files: settings.fileLimits.maxFiles,
    });
    return settingsFromBackend(unwrapResponse(response));
  },
};

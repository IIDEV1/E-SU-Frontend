import { api, unwrapResponse } from "@/services/api";
import type { ApiEnvelope, ApiPagination } from "@/services/types";
import type { AdminAuditLog, AdminCategory, AdminDepartment, AdminPermission, AdminPermissionDefinition, AdminRole, AdminUser } from "@/features/admin/types";
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

export interface SystemSettingDto {
  key: string;
  value: string;
  typed_value: unknown;
  value_type: "string" | "integer" | "boolean" | "json";
  description: string;
  is_public: boolean;
  updated_at: string;
}

export const systemSettingKeys = [
  "university_name",
  "sender_email",
  "allowed_file_extensions",
  "max_file_size_mb",
  "document_number_format",
  "reminder_days_before_deadline",
] as const;

export type SystemSettingKey = typeof systemSettingKeys[number];
export type SystemSettingValue = string | number | string[];
export type SystemSettingsValues = Partial<Record<SystemSettingKey, SystemSettingValue>>;

export interface Release1SystemSettings {
  values: SystemSettingsValues;
}

function isSystemSettingKey(key: string): key is SystemSettingKey {
  return (systemSettingKeys as readonly string[]).includes(key);
}

function getSystemSettingValue(setting: SystemSettingDto): SystemSettingValue | undefined {
  if (!isSystemSettingKey(setting.key)) return undefined;
  if (["max_file_size_mb", "reminder_days_before_deadline"].includes(setting.key)) {
    return setting.value_type === "integer" && typeof setting.typed_value === "number" ? setting.typed_value : undefined;
  }
  if (setting.key === "allowed_file_extensions") {
    return setting.value_type === "json" && Array.isArray(setting.typed_value) && setting.typed_value.every((item) => typeof item === "string") ? setting.typed_value : undefined;
  }
  return setting.value_type === "string" && typeof setting.typed_value === "string" ? setting.typed_value : undefined;
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

export function settingsFromBackend(settings: SystemSettingDto[]): Release1SystemSettings {
  const values: SystemSettingsValues = {};
  for (const setting of settings) {
    const value = getSystemSettingValue(setting);
    if (value !== undefined && isSystemSettingKey(setting.key)) values[setting.key] = value;
  }
  return { values };
}

export function toSystemSettingsPayload(values: SystemSettingsValues): SystemSettingsValues {
  const payload: SystemSettingsValues = {};
  for (const key of systemSettingKeys) {
    if (key in values) payload[key] = Array.isArray(values[key]) ? [...values[key]] : values[key];
  }
  return payload;
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
    const response = await api.get<ApiEnvelope<BackendPermission[]>>("/permissions/", { params: { page_size: 100 } });
    return unwrapResponse(response);
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

  async getSettings(): Promise<Release1SystemSettings> {
    const response = await api.get<ApiEnvelope<SystemSettingDto[]>>("/settings/");
    return settingsFromBackend(unwrapResponse(response));
  },

  async updateSettings(settings: SystemSettingsValues): Promise<Release1SystemSettings> {
    const response = await api.patch<ApiEnvelope<SystemSettingDto[]>>("/settings/", toSystemSettingsPayload(settings));
    return settingsFromBackend(unwrapResponse(response));
  },
};

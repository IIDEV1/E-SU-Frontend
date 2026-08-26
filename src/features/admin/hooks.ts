import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { adminApi, mapAdminDepartment, mapAdminUser } from "@/services/endpoints/admin.api";
import { departmentsApi, type DepartmentWritePayload, type DepartmentsQueryParams } from "@/services/endpoints/departments.api";
import { notificationsApi, type NotificationsQueryParams } from "@/services/endpoints/notifications.api";
import { usersApi, type UserCreatePayload, type UserUpdatePayload, type UsersQueryParams } from "@/services/endpoints/users.api";
import type { AdminCategory, AdminDepartment, AdminRole, AdminSettings, AdminUser, AdminUserStatus } from "./types";

export const adminKeys = {
  users: ["admin", "users"] as const,
  user: (id: string) => ["admin", "users", id] as const,
  departments: ["admin", "departments"] as const,
  categories: ["admin", "categories"] as const,
  roles: ["admin", "roles"] as const,
  permissions: ["admin", "permissions"] as const,
  notifications: ["admin", "notifications"] as const,
  unreadNotifications: ["admin", "notifications", "unread-count"] as const,
  auditLogs: ["admin", "auditLogs"] as const,
  settings: ["admin", "settings"] as const,
};

const emptySettings: AdminSettings = {
  general: { systemName: "E-SU", timezone: "Asia/Bishkek", language: "ru", dateFormat: "DD.MM.YYYY" },
  university: { name: "Salymbekov University", rector: "", address: "", email: "", shortName: "SU", phone: "" },
  numbering: { prefix: "ESU", format: "{prefix}-{department}-{year}-{number}", startNumber: "1", includeYear: true, includeDepartment: true, includeSequence: true },
  fileFormats: { pdf: true, docx: true, xlsx: true, png: true, jpg: true },
  maxFileSizeMb: 25,
  documentStatuses: [],
  emailNotifications: { enabled: true, assigned: true, approved: true, returned: true, deadlineReminder: true },
  allowedExtensions: ["pdf", "docx", "xlsx", "png", "jpg"],
  fileLimits: { maxSizeMb: 25, maxFiles: 10 },
};

function splitName(fullName: string) {
  const [last_name = "", first_name = "", ...middle] = fullName.trim().split(/\s+/);
  return { first_name, last_name, middle_name: middle.join(" ") };
}

function toBackendUserStatus(status: AdminUserStatus): "active" | "blocked" | "invited" {
  return status === "pending" ? "invited" : status;
}

function toUserCreatePayload(user: Omit<AdminUser, "id">): UserCreatePayload {
  return {
    ...splitName(user.fullName),
    email: user.email,
    phone: user.phone,
    position: user.position,
    department: user.departmentId || null,
    manager: user.managerId ?? null,
    role: user.roleId ?? null,
    status: toBackendUserStatus(user.status),
    send_credentials: true,
  };
}

function toUserUpdatePayload(user: Partial<AdminUser>): UserUpdatePayload {
  const name = user.fullName === undefined ? {} : splitName(user.fullName);
  return {
    ...name,
    ...(user.phone === undefined ? {} : { phone: user.phone }),
    ...(user.position === undefined ? {} : { position: user.position }),
    ...(user.departmentId === undefined ? {} : { department: user.departmentId || null }),
    ...(user.managerId === undefined ? {} : { manager: user.managerId || null }),
    ...(user.roleId === undefined ? {} : { role: user.roleId || null }),
  };
}

function toDepartmentPayload(value: Partial<AdminDepartment>): Partial<DepartmentWritePayload> {
  return {
    ...(value.name === undefined ? {} : { name: value.name }),
    ...(value.code === undefined ? {} : { code: value.code }),
    ...(value.description === undefined ? {} : { description: value.description }),
    ...(value.parentId === undefined ? {} : { parent: value.parentId || null }),
    ...(value.headId === undefined ? {} : { manager: value.headId || null }),
    ...(value.status === undefined ? {} : { status: value.status === "disabled" ? "inactive" : "active" }),
  };
}

export function useAdminUsersQuery(params: UsersQueryParams = {}) {
  return useQuery({
    queryKey: [...adminKeys.users, params],
    queryFn: async () => {
      const page = await usersApi.getUsersPage(params);
      return { ...page, results: page.results.map(mapAdminUser) };
    },
  });
}

export const useAdminUsers = () => useAdminUsersQuery({ page_size: 100 }).data?.results ?? [];

export function useAdminUserQuery(id: string | undefined) {
  return useQuery({
    queryKey: id ? adminKeys.user(id) : [...adminKeys.users, "missing"],
    queryFn: () => usersApi.getUser(id ?? "").then(mapAdminUser),
    enabled: Boolean(id),
  });
}

export const useAdminUser = (id: string | undefined) => useAdminUserQuery(id).data;

export function useAdminDepartmentsQuery(params: DepartmentsQueryParams = {}) {
  return useQuery({
    queryKey: [...adminKeys.departments, params],
    queryFn: async () => {
      const page = await departmentsApi.getDepartmentsPage(params);
      return { ...page, results: page.results.map((department) => mapAdminDepartment(department)) };
    },
  });
}

export const useAdminDepartments = () => useAdminDepartmentsQuery({ page_size: 100 }).data?.results ?? [];

export function useAdminCategoriesQuery() {
  return useQuery({ queryKey: adminKeys.categories, queryFn: adminApi.getCategories });
}

export const useAdminCategories = () => useAdminCategoriesQuery().data ?? [];
export function useAdminRolesQuery() {
  return useQuery({ queryKey: adminKeys.roles, queryFn: adminApi.getRoles });
}

export const useAdminRoles = () => useAdminRolesQuery().data ?? [];
export const useAdminPermissions = () => useQuery({ queryKey: adminKeys.permissions, queryFn: adminApi.getPermissions });

export async function invalidateRolePermissionQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: adminKeys.roles }),
    queryClient.invalidateQueries({ queryKey: adminKeys.permissions }),
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
  ]);
}

export function useAdminNotificationsQuery(params: NotificationsQueryParams = {}) {
  return useQuery({ queryKey: [...adminKeys.notifications, params], queryFn: () => notificationsApi.getNotificationsPage(params) });
}

export const useAdminNotifications = () => useAdminNotificationsQuery({ page_size: 100 }).data?.results ?? [];
export const useAdminUnreadNotificationCount = () => useQuery({ queryKey: adminKeys.unreadNotifications, queryFn: notificationsApi.getUnreadCount });
export const useAdminAuditLogs = () => useQuery({ queryKey: adminKeys.auditLogs, queryFn: adminApi.getAuditLogs }).data ?? [];
export const useAdminSettings = () => useQuery({ queryKey: adminKeys.settings, queryFn: adminApi.getSettings }).data ?? emptySettings;

export function useAdminActions() {
  const queryClient = useQueryClient();
  const invalidate = useCallback(async (...queryKeys: readonly (readonly unknown[])[]) => {
    await Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
  }, [queryClient]);

  const createUser = useMutation({ mutationFn: (value: Omit<AdminUser, "id">) => usersApi.createUser(toUserCreatePayload(value)), onSuccess: () => invalidate(adminKeys.users, adminKeys.departments, adminKeys.categories) });
  const updateUser = useMutation({
    mutationFn: async ({ userId, value, previousStatus }: { userId: string; value: Partial<AdminUser>; previousStatus: AdminUserStatus }) => {
      const updatePayload = toUserUpdatePayload(value);
      const updated = Object.keys(updatePayload).length ? await usersApi.updateUser(userId, updatePayload) : undefined;
      if (value.status && value.status !== previousStatus) return value.status === "blocked" ? usersApi.blockUser(userId) : usersApi.activateUser(userId);
      return updated ?? usersApi.getUser(userId);
    },
    onSuccess: (_, variables) => invalidate(adminKeys.users, adminKeys.user(variables.userId), adminKeys.departments, adminKeys.categories),
  });
  const createDepartment = useMutation({ mutationFn: (value: Omit<AdminDepartment, "id">) => departmentsApi.createDepartment(toDepartmentPayload(value) as DepartmentWritePayload), onSuccess: () => invalidate(adminKeys.departments, adminKeys.users, adminKeys.categories) });
  const updateDepartment = useMutation({ mutationFn: ({ departmentId, value }: { departmentId: string; value: Partial<AdminDepartment> }) => departmentsApi.updateDepartment(departmentId, toDepartmentPayload(value)), onSuccess: () => invalidate(adminKeys.departments, adminKeys.users, adminKeys.categories) });
  const deleteDepartment = useMutation({ mutationFn: departmentsApi.deleteDepartment, onSuccess: () => invalidate(adminKeys.departments, adminKeys.users, adminKeys.categories) });
  const createCategory = useMutation({ mutationFn: (value: Omit<AdminCategory, "id">) => adminApi.createCategory(value), onSuccess: () => invalidate(adminKeys.categories, ["documents"]) });
  const updateCategory = useMutation({ mutationFn: ({ categoryId, value }: { categoryId: string; value: Partial<AdminCategory> }) => adminApi.updateCategory(categoryId, value), onSuccess: () => invalidate(adminKeys.categories, ["documents"]) });
  const deleteCategory = useMutation({ mutationFn: adminApi.deleteCategory, onSuccess: () => invalidate(adminKeys.categories, ["documents"]) });
  const updateRole = useMutation({ mutationFn: ({ roleId, value }: { roleId: string; value: Partial<AdminRole> }) => adminApi.setRolePermissions(roleId, value.permissions ?? []), onSuccess: () => invalidateRolePermissionQueries(queryClient) });
  const updateSettings = useMutation({ mutationFn: (value: AdminSettings) => adminApi.updateSettings(value), onSuccess: () => invalidate(adminKeys.settings) });
  const markRead = useMutation({ mutationFn: notificationsApi.markRead, onSuccess: () => invalidate(adminKeys.notifications, adminKeys.unreadNotifications) });
  const markAllRead = useMutation({ mutationFn: notificationsApi.markAllRead, onSuccess: () => invalidate(adminKeys.notifications, adminKeys.unreadNotifications) });

  return useMemo(() => ({
    users: { create: createUser.mutateAsync, update: (userId: string, value: Partial<AdminUser>, previousStatus: AdminUserStatus) => updateUser.mutateAsync({ userId, value, previousStatus }) },
    departments: { create: createDepartment.mutateAsync, update: (departmentId: string, value: Partial<AdminDepartment>) => updateDepartment.mutateAsync({ departmentId, value }), remove: deleteDepartment.mutateAsync },
    categories: { create: createCategory.mutateAsync, update: (categoryId: string, value: Partial<AdminCategory>) => updateCategory.mutateAsync({ categoryId, value }), remove: deleteCategory.mutateAsync },
    roles: { update: (roleId: string, value: Partial<AdminRole>) => updateRole.mutateAsync({ roleId, value }) },
    notifications: { markRead: markRead.mutateAsync, markAllRead: markAllRead.mutateAsync },
    settings: { update: updateSettings.mutateAsync },
  }), [createCategory.mutateAsync, createDepartment.mutateAsync, createUser.mutateAsync, deleteCategory.mutateAsync, deleteDepartment.mutateAsync, markAllRead.mutateAsync, markRead.mutateAsync, updateCategory, updateDepartment, updateRole, updateSettings.mutateAsync, updateUser]);
}

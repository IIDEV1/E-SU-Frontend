import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminApi,
  mapAdminDepartment,
  mapAdminUser,
  toDepartmentPayload,
  toUserPayload,
} from "@/services/endpoints/admin.api";
import { departmentsApi } from "@/services/endpoints/departments.api";
import { notificationsApi } from "@/services/endpoints/notifications.api";
import { usersApi } from "@/services/endpoints/users.api";
import type { AdminCategory, AdminDepartment, AdminRole, AdminSettings, AdminUser } from "./types";

import { notificationKeys, useNotifications } from "@/hooks/useNotifications";

export const adminKeys = {
  users: ["admin", "users"] as const,
  departments: ["admin", "departments"] as const,
  categories: ["admin", "categories"] as const,
  roles: ["admin", "roles"] as const,
  notifications: notificationKeys.all,
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

export const useAdminUsers = () =>
  useQuery({ queryKey: adminKeys.users, queryFn: () => usersApi.getUsers().then((users) => users.map(mapAdminUser)) }).data ?? [];

export const useAdminUser = (id: string | undefined) => useAdminUsers().find((user) => user.id === id);

export const useAdminDepartments = () =>
  useQuery({
    queryKey: adminKeys.departments,
    queryFn: () => departmentsApi.getDepartments().then((departments) => departments.map((department) => mapAdminDepartment(department))),
  }).data ?? [];

export const useAdminCategories = () =>
  useQuery({ queryKey: adminKeys.categories, queryFn: adminApi.getCategories }).data ?? [];

export const useAdminRoles = () => useQuery({ queryKey: adminKeys.roles, queryFn: adminApi.getRoles }).data ?? [];

export const useAdminNotifications = () => useNotifications().data ?? [];

export const useAdminAuditLogs = () => useQuery({ queryKey: adminKeys.auditLogs, queryFn: adminApi.getAuditLogs }).data ?? [];

export const useAdminSettings = () => useQuery({ queryKey: adminKeys.settings, queryFn: adminApi.getSettings }).data ?? emptySettings;

export function useAdminActions() {
  const queryClient = useQueryClient();
  const invalidate = useCallback(
    (queryKey: readonly unknown[]) => void queryClient.invalidateQueries({ queryKey }),
    [queryClient],
  );

  const createUser = useMutation({
    mutationFn: (value: Omit<AdminUser, "id">) => usersApi.createUser(toUserPayload(value)),
    onSuccess: () => invalidate(adminKeys.users),
  });
  const updateUser = useMutation({
    mutationFn: ({ userId, value }: { userId: string; value: Partial<AdminUser> }) => {
      if (value.status === "blocked") return usersApi.blockUser(userId);
      if (value.status === "active") return usersApi.activateUser(userId);
      return usersApi.updateUser(userId, toUserPayload(value));
    },
    onSuccess: () => invalidate(adminKeys.users),
  });
  const createDepartment = useMutation({
    mutationFn: (value: Omit<AdminDepartment, "id">) => departmentsApi.createDepartment(toDepartmentPayload(value)),
    onSuccess: () => invalidate(adminKeys.departments),
  });
  const updateDepartment = useMutation({
    mutationFn: ({ departmentId, value }: { departmentId: string; value: Partial<AdminDepartment> }) =>
      departmentsApi.updateDepartment(departmentId, toDepartmentPayload(value)),
    onSuccess: () => invalidate(adminKeys.departments),
  });
  const createCategory = useMutation({
    mutationFn: (value: Omit<AdminCategory, "id">) => adminApi.createCategory(value),
    onSuccess: () => invalidate(adminKeys.categories),
  });
  const updateCategory = useMutation({
    mutationFn: ({ categoryId, value }: { categoryId: string; value: Partial<AdminCategory> }) => adminApi.updateCategory(categoryId, value),
    onSuccess: () => invalidate(adminKeys.categories),
  });
  const updateRole = useMutation({
    mutationFn: ({ roleId, value }: { roleId: string; value: Partial<AdminRole> }) =>
      adminApi.setRolePermissions(roleId, value.permissions ?? []),
    onSuccess: () => invalidate(adminKeys.roles),
  });
  const updateSettings = useMutation({
    mutationFn: (value: AdminSettings) => adminApi.updateSettings(value),
    onSuccess: () => invalidate(adminKeys.settings),
  });
  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => invalidate(adminKeys.notifications),
  });
  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => invalidate(adminKeys.notifications),
  });

  return useMemo(
    () => ({
      users: {
        create: (value: Omit<AdminUser, "id">) => createUser.mutate(value),
        update: (userId: string, value: Partial<AdminUser>) => updateUser.mutate({ userId, value }),
      },
      departments: {
        create: (value: Omit<AdminDepartment, "id">) => createDepartment.mutate(value),
        update: (departmentId: string, value: Partial<AdminDepartment>) => updateDepartment.mutate({ departmentId, value }),
        remove: (departmentId: string) => departmentsApi.deleteDepartment(departmentId).finally(() => invalidate(adminKeys.departments)),
      },
      categories: {
        create: (value: Omit<AdminCategory, "id">) => createCategory.mutate(value),
        update: (categoryId: string, value: Partial<AdminCategory>) => updateCategory.mutate({ categoryId, value }),
        remove: () => undefined,
      },
      roles: {
        update: (roleId: string, value: Partial<AdminRole>) => updateRole.mutate({ roleId, value }),
      },
      notifications: {
        markRead: (notificationId: string) => markRead.mutate(notificationId),
        markAllRead: () => markAllRead.mutate(),
      },
      settings: { update: (value: AdminSettings) => updateSettings.mutate(value) },
    }),
    [createCategory, createDepartment, createUser, invalidate, markAllRead, markRead, updateCategory, updateDepartment, updateRole, updateSettings, updateUser],
  );
}

import { useSyncExternalStore } from "react";
import { categories, currentUser, departments, mockAuditLogs, mockNotifications, mockRoles, mockSettings, users } from "@/mocks/data";
import type { SystemSettings, UserRole } from "@/types";
import type { AdminAuditLog, AdminCategory, AdminDepartment, AdminNotification, AdminRole, AdminState, AdminUser } from "./types";

const roleNames: Record<UserRole, string> = {
  admin: "Администратор", rector: "Ректор", department_head: "Руководитель подразделения", employee: "Сотрудник", approver: "Согласующий",
};

const initialDepartments: AdminDepartment[] = departments.map((department) => ({ ...department, status: "active" }));
const initialCategories: AdminCategory[] = categories.map((category, index) => ({ ...category, description: "Категория документов университета", retentionPeriod: index === 0 ? "5 лет" : "10 лет", departmentIds: departments.slice(0, index + 1).map((department) => department.id), status: "active", documentCount: index + 1 }));
const initialUsers: AdminUser[] = users.map((user) => ({
  id: user.id, fullName: user.name, email: user.email, position: user.position,
  phone: `+996 555 00 0${user.id.at(-1) ?? "0"}`, departmentId: user.department.id, role: user.role, status: "active", lastActive: "Сейчас", avatarUrl: user.avatarUrl,
}));
const initialRoles: AdminRole[] = (Object.keys(roleNames) as UserRole[]).map((id) => {
  const source = mockRoles.find((role) => role.id === id);
  return { id, name: source?.name ?? roleNames[id], description: source?.description ?? "Системная роль", permissions: id === "admin" ? ["users:manage", "departments:manage", "categories:manage", "roles:manage", "audit:read", "settings:manage", "documents:read"] : ["documents:read"] };
});
const initialNotifications: AdminNotification[] = mockNotifications.map((item) => ({ id: item.id, type: item.type as AdminNotification["type"], title: item.title, message: item.message, createdAt: item.time, isRead: item.isRead, documentId: item.documentId }));
const initialAuditLogs: AdminAuditLog[] = Array.from({ length: 30 }, (_, index) => {
  const source = mockAuditLogs[index % mockAuditLogs.length];
  return { id: `audit-${index + 1}`, dateTime: source.dateTime, userName: source.user, role: index % 3 === 0 ? "admin" : "employee", action: index % 5 === 0 ? "settings_changed" : index % 2 ? "updated" : "created", entity: index % 4 === 0 ? "settings" : index % 3 === 0 ? "department" : "user", entityLabel: source.document, result: source.result as AdminAuditLog["result"] };
});

let state: AdminState = { users: initialUsers, departments: initialDepartments, categories: initialCategories, roles: initialRoles, notifications: initialNotifications, auditLogs: initialAuditLogs, settings: structuredClone(mockSettings) };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
const update = (updater: (previous: AdminState) => AdminState) => { state = updater(state); emit(); };
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export const adminStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); },
  users: {
    create: (value: Omit<AdminUser, "id">) => update((s) => ({ ...s, users: [{ ...value, id: id("user") }, ...s.users] })),
    update: (userId: string, value: Partial<AdminUser>) => update((s) => ({ ...s, users: s.users.map((item) => item.id === userId ? { ...item, ...value } : item) })),
  },
  departments: {
    create: (value: Omit<AdminDepartment, "id">) => update((s) => ({ ...s, departments: [{ ...value, id: id("department") }, ...s.departments] })),
    update: (departmentId: string, value: Partial<AdminDepartment>) => update((s) => ({ ...s, departments: s.departments.map((item) => item.id === departmentId ? { ...item, ...value } : item) })),
    remove: (departmentId: string) => update((s) => ({ ...s, departments: s.departments.filter((item) => item.id !== departmentId) })),
  },
  categories: {
    create: (value: Omit<AdminCategory, "id">) => update((s) => ({ ...s, categories: [{ ...value, id: id("category") }, ...s.categories] })),
    update: (categoryId: string, value: Partial<AdminCategory>) => update((s) => ({ ...s, categories: s.categories.map((item) => item.id === categoryId ? { ...item, ...value } : item) })),
    remove: (categoryId: string) => update((s) => ({ ...s, categories: s.categories.filter((item) => item.id !== categoryId) })),
  },
  roles: { update: (roleId: UserRole, value: Partial<AdminRole>) => update((s) => ({ ...s, roles: s.roles.map((item) => item.id === roleId ? { ...item, ...value } : item) })) },
  notifications: { markRead: (notificationId: string) => update((s) => ({ ...s, notifications: s.notifications.map((item) => item.id === notificationId ? { ...item, isRead: true } : item) })), markAllRead: () => update((s) => ({ ...s, notifications: s.notifications.map((item) => ({ ...item, isRead: true })) })) },
  settings: { update: (value: SystemSettings) => update((s) => ({ ...s, settings: value })) },
};

export function useAdminStore<T>(selector: (snapshot: AdminState) => T): T {
  return useSyncExternalStore(adminStore.subscribe, () => selector(adminStore.getSnapshot()), () => selector(adminStore.getSnapshot()));
}

export const currentAdminUser = initialUsers.find((user) => user.id === currentUser.id);

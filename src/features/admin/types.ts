import type { DocumentCategory, SystemSettings, UserRole } from "@/types";

export type AdminUserStatus = "active" | "blocked" | "pending";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  position: string;
  departmentId: string;
  role: UserRole;
  status: AdminUserStatus;
  lastActive: string;
  avatarUrl?: string;
}

export interface AdminDepartment {
  id: string;
  name: string;
  code: string;
  headId?: string;
  description?: string;
}

export type AdminPermission =
  | "users:manage"
  | "departments:manage"
  | "categories:manage"
  | "roles:manage"
  | "audit:read"
  | "settings:manage"
  | "documents:read";

export interface AdminRole {
  id: UserRole;
  name: string;
  description: string;
  permissions: AdminPermission[];
}

export type AdminNotificationType = "approved" | "deadline" | "comment" | "system" | "assigned";

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  documentId?: string;
}

export interface AdminAuditLog {
  id: string;
  dateTime: string;
  userName: string;
  role: UserRole;
  action: "created" | "updated" | "deleted" | "read" | "role_changed" | "settings_changed";
  entity: "user" | "department" | "category" | "role" | "settings" | "document";
  entityLabel: string;
  result: "success" | "error";
}

export interface AdminState {
  users: AdminUser[];
  departments: AdminDepartment[];
  categories: DocumentCategory[];
  roles: AdminRole[];
  notifications: AdminNotification[];
  auditLogs: AdminAuditLog[];
  settings: SystemSettings;
}

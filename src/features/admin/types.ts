import type { DocumentCategory, SystemSettings, UserRole } from "@/types";

export type AdminUserStatus = "active" | "blocked" | "pending";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  position: string;
  phone: string;
  departmentId: string;
  managerId?: string;
  role: string;
  roleId?: string;
  status: AdminUserStatus;
  lastActive: string;
  avatarUrl?: string;
  temporaryPassword?: string;
}

export interface AdminDepartment {
  id: string;
  name: string;
  code: string;
  headId?: string;
  parentId?: string;
  description?: string;
  status: "active" | "disabled";
}

export interface AdminCategory extends DocumentCategory {
  description: string;
  retentionPeriod: string;
  departmentIds: string[];
  status: "active" | "disabled";
  documentCount: number;
}

export type AdminPermission = string;

export interface AdminRole {
  id: string;
  code: string;
  name: string;
  description: string;
  permissions: AdminPermission[];
}

export interface AdminPermissionDefinition {
  id: string;
  code: AdminPermission;
  name: string;
  group: string;
  description: string;
}

export type AdminNotificationType =
  | "document_submitted"
  | "document_approved"
  | "document_returned"
  | "deadline_approaching"
  | "document_overdue"
  | "responsible_assigned"
  | "comment_added"
  | "approval_required"
  | "document_registered"
  | "document_archived"
  | "sent"
  | "approved"
  | "returned"
  | "deadline"
  | "overdue"
  | "assigned"
  | "comment"
  | "system";

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
  object: string;
  document: string;
  department: string;
  result: "success" | "error";
}

export interface AdminDocumentStatus { id: string; name: string; color: string; active: boolean; order: number; }
export interface AdminSettings extends SystemSettings {
  general: SystemSettings["general"] & { dateFormat: string };
  university: SystemSettings["university"] & { shortName: string; phone: string; logoName?: string };
  numbering: SystemSettings["numbering"] & { includeYear: boolean; includeDepartment: boolean; includeSequence: boolean };
  documentStatuses: AdminDocumentStatus[];
  emailNotifications: { enabled: boolean; assigned: boolean; approved: boolean; returned: boolean; deadlineReminder: boolean };
  allowedExtensions: string[];
  fileLimits: { maxSizeMb: number; maxFiles: number };
}

export interface AdminState {
  users: AdminUser[];
  departments: AdminDepartment[];
  categories: AdminCategory[];
  notifications: AdminNotification[];
  auditLogs: AdminAuditLog[];
  settings: AdminSettings;
}

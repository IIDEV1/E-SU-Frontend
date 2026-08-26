import type { DocumentCategory } from "@/types";

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
  user: { id: string; email: string; fullName: string } | null;
  action: string;
  actionDisplay: string;
  objectType: string;
  objectId: string;
  description: string;
  result: "success" | "failure";
  resultDisplay: string;
  createdAt: string;
}

export interface AdminState {
  users: AdminUser[];
  departments: AdminDepartment[];
  categories: AdminCategory[];
  notifications: AdminNotification[];
}

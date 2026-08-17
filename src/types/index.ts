export type UserRole = "admin" | "rector" | "department_head" | "employee" | "approver";

export type Permission =
  | "document:create"
  | "document:read"
  | "document:update"
  | "document:delete"
  | "document:approve"
  | "settings:manage"
  | "audit:read";

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  position: string;
  avatarUrl?: string;
  permissions?: Permission[];
}

export type DocumentStatus =
  | "draft"
  | "in_review"
  | "returned"
  | "approved"
  | "completed"
  | "overdue"
  | "archived"
  | "rejected";

export type DocumentPriority = "low" | "normal" | "high" | "urgent";

export interface DocumentCategory {
  id: string;
  name: string;
  code: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface ApprovalStep {
  id: string;
  approver: User;
  status: "pending" | "approved" | "returned" | "rejected";
  comment?: string;
  date?: string;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Document {
  id: string;
  number: string;
  title: string;
  category: DocumentCategory;
  type: string;
  description: string;
  author: User;
  department: Department;
  responsible: User;
  createdAt: string;
  deadline: string;
  status: DocumentStatus;
  priority: DocumentPriority;
  files: DocumentFile[];
  approvalSteps: ApprovalStep[];
  comments: Comment[];
  history: string[];
  currentStage: string;
  returnReason?: string;
}

export type NotificationType =
  | "sent"
  | "approved"
  | "returned"
  | "deadline"
  | "overdue"
  | "assigned"
  | "comment"
  | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  documentId?: string;
}

export interface AuditLog {
  id: string;
  dateTime: string;
  user: string;
  role: string;
  action: string;
  object: string;
  document: string;
  department: string;
  result: "success" | "error";
}

export interface SystemSettings {
  general: {
    systemName: string;
    timezone: string;
    language: string;
  };
  university: {
    name: string;
    rector: string;
    address: string;
    email: string;
  };
  numbering: {
    prefix: string;
    format: string;
    startNumber: string;
  };
  fileFormats: {
    pdf: boolean;
    docx: boolean;
    xlsx: boolean;
    png: boolean;
    jpg: boolean;
  };
  maxFileSizeMb: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, string[]>;
}

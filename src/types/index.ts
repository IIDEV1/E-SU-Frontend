export type UserRole = "admin" | "manager" | "office" | "employee";

export type Permission =
  | "documents.view"
  | "documents.create"
  | "documents.edit"
  | "documents.approve"
  | "documents.return"
  | "documents.archive"
  | "documents.register"
  | "users.manage"
  | "departments.manage"
  | "categories.manage"
  | "audit.view"
  | "settings.manage";

export interface Department {
  id: string;
  name: string;
  code: string;
  parent?: Department | null;
  status?: string;
}

export interface Role {
  id: string;
  code: UserRole | string;
  name: string;
}

export interface UserShort {
  id: string;
  email: string;
  full_name: string;
  position?: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  short_name?: string;
  name: string;
  phone?: string;
  position?: string;
  department: Department | null;
  manager?: UserShort | null;
  role: Role | null;
  status: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
  permissions: Permission[];
  available_actions?: {
    can_manage_users: boolean;
    can_manage_departments: boolean;
    can_manage_categories: boolean;
    can_manage_settings: boolean;
    can_view_audit: boolean;
    can_create_documents: boolean;
    can_approve_documents: boolean;
    can_archive_documents: boolean;
  };
}

export type DocumentStatus =
  | "draft"
  | "in_review"
  | "returned"
  | "approved"
  | "completed"
  | "overdue"
  | "archived";

export type DocumentPriority = "low" | "normal" | "high" | "urgent";

export interface DocumentCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  status?: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  original_name?: string;
  file?: string;
  is_main?: boolean;
  sourceFile?: File;
}

export interface ApprovalStep {
  id: string;
  approver: UserShort;
  status: "pending" | "approved" | "returned" | "rejected";
  comment?: string;
  date?: string;
  order?: number;
}

export interface Comment {
  id: string;
  author: UserShort;
  text: string;
  createdAt: string;
  comment_type?: string;
}

export interface Document {
  id: string;
  number: string;
  registration_number?: string | null;
  title: string;
  category: DocumentCategory;
  type: string;
  document_type?: string;
  description?: string;
  author: UserShort;
  department: Department;
  responsible: UserShort | null;
  createdAt: string;
  updatedAt?: string;
  deadline: string | null;
  status: DocumentStatus;
  priority: DocumentPriority;
  files: DocumentFile[];
  approvalSteps: ApprovalStep[];
  comments: Comment[];
  history: string[];
  currentStage: string;
  returnReason?: string;
}

export interface DocumentHistoryEntry {
  id: string;
  user: UserShort | null;
  action: string;
  description: string;
  createdAt: string;
}

export type DocumentListItem = Omit<Document, "description">;

export type NotificationType =
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
  | "system"
  | "sent"
  | "approved"
  | "returned"
  | "deadline"
  | "overdue"
  | "assigned"
  | "comment";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  createdAt: string;
  isRead: boolean;
  documentId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  next: string | null;
  previous: string | null;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, string[] | string>;
}

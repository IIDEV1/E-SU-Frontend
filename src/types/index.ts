export type UserRole = "admin" | "rector" | "department_head" | "employee" | "approver";

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
}

export type DocumentStatus =
  "draft" | "in_review" | "returned" | "approved" | "completed" | "overdue" | "archived";

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
  status: "pending" | "approved" | "returned";
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
  returnReason?: string;
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

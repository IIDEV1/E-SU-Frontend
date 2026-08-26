import type { DocumentPriority, DocumentStatus } from "@/types";

export interface ApiEnvelope<T> {
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[] | string>;
  };
}

export interface ApiPagination<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AppApiError {
  status?: number;
  code: string;
  message: string;
  details?: Record<string, string[] | string>;
}

export interface DocumentUserShortDto {
  id: string;
  email: string;
  full_name: string;
  position: string;
}

export interface DocumentDepartmentShortDto {
  id: string;
  code: string;
  name: string;
  status: "active" | "inactive";
}

export interface DocumentCategoryShortDto {
  id: string;
  name: string;
  code: string;
  status: "active" | "inactive";
}

export interface DocumentListDto {
  id: string;
  registration_number: string | null;
  title: string;
  document_type: string;
  category: DocumentCategoryShortDto;
  author: DocumentUserShortDto;
  department: DocumentDepartmentShortDto;
  responsible: DocumentUserShortDto | null;
  priority: DocumentPriority;
  status: DocumentStatus;
  deadline: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
  current_approval_step: number | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentDetailDto extends DocumentListDto {
  description: string;
}

export interface DocumentWriteResponseDto {
  id: string;
  title: string;
  description: string;
  document_type: string;
  category_id: string;
  department_id: string;
  responsible_id: string | null;
  priority: DocumentPriority;
  deadline: string | null;
}

export type PaginatedDocumentDto = ApiPagination<DocumentListDto>;

export type ApprovalRouteStatusDto = "active" | "completed" | "returned" | "cancelled";
export type ApprovalRouteSourceDto = "manual" | "category_template";
export type ApprovalStepStatusDto = "pending" | "current" | "approved" | "returned" | "cancelled";

export interface ApprovalRoleShortDto {
  id: string;
  code: string;
  name: string;
}

export interface ApprovalStepDto {
  id: string;
  order: number;
  approver: DocumentUserShortDto;
  role: ApprovalRoleShortDto | null;
  status: ApprovalStepStatusDto;
  comment: string;
  acted_at: string | null;
  created_at: string;
}

export interface ApprovalRouteDto {
  id: string;
  document: string;
  status: ApprovalRouteStatusDto;
  source: ApprovalRouteSourceDto;
  template: string | null;
  template_snapshot: Record<string, unknown>;
  created_by: DocumentUserShortDto | null;
  created_at: string;
  completed_at: string | null;
  steps: ApprovalStepDto[];
  actions: Array<{
    id: string;
    step: string;
    actor: DocumentUserShortDto;
    action: "approve" | "return";
    comment: string;
    created_at: string;
  }>;
}

export interface DocumentFileDto {
  id: string;
  document: string;
  file: string;
  original_name: string;
  file_type: string;
  mime_type: string;
  size: number;
  is_main: boolean;
  uploaded_by: DocumentUserShortDto | null;
  created_at: string;
}

export interface DocumentCommentDto {
  id: string;
  document: string;
  author: DocumentUserShortDto | null;
  text: string;
  comment_type: "general" | "approval" | "return_reason" | "system";
  created_at: string;
  updated_at: string;
}

export interface DocumentHistoryDto {
  id: string;
  document: string;
  user: DocumentUserShortDto | null;
  action: string;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  description: string;
  created_at: string;
}

import type {
  AuditLog,
  Comment,
  Department,
  Document,
  DocumentCategory,
  DocumentFile,
  Notification,
  User,
  UserShort,
} from "@/types";

interface BackendUserShort {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
}

interface BackendDocument {
  id: string;
  registration_number?: string | null;
  title: string;
  document_type?: string;
  category?: DocumentCategory | null;
  author?: BackendUserShort | null;
  department?: Department | null;
  responsible?: BackendUserShort | null;
  priority: Document["priority"];
  status: Document["status"];
  deadline?: string | null;
  description?: string;
  current_approval_step?: string | number | null;
  created_at?: string;
  updated_at?: string;
}

interface BackendDocumentFile {
  id: string;
  file?: string;
  original_name?: string;
  file_type?: string;
  mime_type?: string;
  size?: number;
  is_main?: boolean;
  created_at?: string;
}

interface BackendComment {
  id: string;
  author?: BackendUserShort | null;
  text: string;
  comment_type?: string;
  created_at?: string;
}

interface BackendNotification {
  id: string;
  type: Notification["type"];
  title: string;
  message?: string;
  is_read?: boolean;
  document?: string | null;
  document_id?: string | null;
  created_at?: string;
}

interface BackendAuditLog {
  id: string;
  user?: { full_name?: string; email?: string; role?: string } | null;
  action?: string;
  object_type?: string;
  object_id?: string;
  document?: string | null;
  department?: string | null;
  result?: "success" | "error";
  created_at?: string;
}

export function mapUserShort(user?: BackendUserShort | null): UserShort {
  const fullName = user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Пользователь";
  return {
    id: user?.id ?? "",
    email: user?.email ?? "",
    full_name: fullName,
    name: fullName,
    position: user?.position,
  };
}

export function mapUser(user: User): User {
  const fullName = user.full_name || [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
  return {
    ...user,
    full_name: fullName,
    name: fullName,
    permissions: user.permissions ?? [],
  };
}

export function mapDocument(document: BackendDocument): Document {
  const number = document.registration_number || "Без номера";
  return {
    id: document.id,
    number,
    registration_number: document.registration_number,
    title: document.title,
    category: document.category ?? { id: "", name: "Без категории", code: "" },
    type: document.document_type || "document",
    document_type: document.document_type,
    description: document.description ?? "",
    author: mapUserShort(document.author),
    department: document.department ?? { id: "", name: "Без подразделения", code: "" },
    responsible: mapUserShort(document.responsible),
    createdAt: document.created_at ?? "",
    updatedAt: document.updated_at,
    deadline: document.deadline ?? "",
    status: document.status,
    priority: document.priority,
    files: [],
    approvalSteps: [],
    comments: [],
    history: [],
    currentStage: document.current_approval_step ? `Шаг ${document.current_approval_step}` : document.status,
  };
}

export function mapDocumentFile(file: BackendDocumentFile): DocumentFile {
  return {
    id: file.id,
    name: file.original_name ?? "Файл",
    size: file.size ?? 0,
    type: file.mime_type ?? file.file_type ?? "application/octet-stream",
    url: file.file ?? "#",
    uploadedAt: file.created_at ?? "",
    original_name: file.original_name,
    file: file.file,
    is_main: file.is_main,
  };
}

export function mapComment(comment: BackendComment): Comment {
  return {
    id: comment.id,
    author: mapUserShort(comment.author),
    text: comment.text,
    createdAt: comment.created_at ?? "",
    comment_type: comment.comment_type,
  };
}

export function mapNotification(notification: BackendNotification): Notification {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message ?? notification.title,
    time: notification.created_at ?? "",
    createdAt: notification.created_at ?? "",
    isRead: Boolean(notification.is_read),
    documentId: notification.document_id ?? notification.document ?? undefined,
  };
}

export function mapAuditLog(log: BackendAuditLog): AuditLog {
  return {
    id: log.id,
    dateTime: log.created_at ?? "",
    user: log.user?.full_name ?? log.user?.email ?? "Система",
    role: log.user?.role ?? "",
    action: log.action ?? "",
    object: log.object_type ?? log.object_id ?? "",
    document: log.document ?? "",
    department: log.department ?? "",
    result: log.result ?? "success",
  };
}

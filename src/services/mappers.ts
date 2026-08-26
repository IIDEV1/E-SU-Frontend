import type {
  AuditLog,
  Comment,
  Document,
  DocumentFile,
  Notification,
  User,
  UserShort,
} from "@/types";
import type {
  DocumentDetailDto,
  DocumentFileDto,
  DocumentListDto,
  DocumentUserShortDto,
} from "@/services/types";

interface BackendUserShort {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
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

function mapDocumentUser(user: DocumentUserShortDto): UserShort {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    name: user.full_name,
    position: user.position,
  };
}

function mapDocumentBase(document: DocumentListDto, description?: string): Document {
  if (!document.responsible) {
    throw new Error(`Document ${document.id} does not have a responsible user`);
  }
  if (!document.deadline) {
    throw new Error(`Document ${document.id} does not have a deadline`);
  }

  const number = document.registration_number || "Без номера";
  return {
    id: document.id,
    number,
    registration_number: document.registration_number,
    title: document.title,
    category: document.category,
    type: document.document_type,
    document_type: document.document_type,
    description,
    author: mapDocumentUser(document.author),
    department: document.department,
    responsible: mapDocumentUser(document.responsible),
    createdAt: document.created_at,
    updatedAt: document.updated_at,
    deadline: document.deadline,
    status: document.status,
    priority: document.priority,
    files: [],
    approvalSteps: [],
    comments: [],
    history: [],
    currentStage: document.current_approval_step ? `Шаг ${document.current_approval_step}` : document.status,
  };
}

export function mapDocumentList(document: DocumentListDto): Document {
  return mapDocumentBase(document);
}

export function mapDocumentDetail(document: DocumentDetailDto): Document {
  return mapDocumentBase(document, document.description);
}

export function mapDocumentFile(file: DocumentFileDto): DocumentFile {
  return {
    id: file.id,
    name: file.original_name,
    size: file.size,
    type: file.mime_type,
    url: file.file,
    uploadedAt: file.created_at,
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

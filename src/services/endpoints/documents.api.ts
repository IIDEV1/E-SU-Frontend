import { api, unwrapResponse } from "@/services/api";
import { mapComment, mapDocumentDetail, mapDocumentFile, mapDocumentList } from "@/services/mappers";
import type {
  ApiEnvelope,
  ApiPagination,
  DocumentCommentDto,
  DocumentDetailDto,
  DocumentFileDto,
  DocumentHistoryDto,
  DocumentWriteResponseDto,
  PaginatedDocumentDto,
} from "@/services/types";
import type { Document, DocumentListItem, DocumentStatus, PaginatedResponse } from "@/types";

export type DocumentListScope = "all" | "my" | "approval" | "returned" | "overdue" | "archive";
export type DocumentOrdering =
  | "created_at"
  | "-created_at"
  | "updated_at"
  | "-updated_at"
  | "deadline"
  | "-deadline"
  | "title"
  | "-title"
  | "priority"
  | "-priority"
  | "status"
  | "-status"
  | "registration_number"
  | "-registration_number";

export interface DocumentsParams {
  status?: DocumentStatus;
  scope?: DocumentListScope;
  search?: string;
  category?: string;
  department?: string;
  author?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  pageSize?: number;
  ordering?: DocumentOrdering;
}

export interface DocumentFormPayload {
  title: string;
  categoryId: string;
  type: string;
  description: string;
  departmentId: string;
  responsibleId: string;
  deadline: string;
  priority: Document["priority"];
  comment?: string;
  approverIds: string[];
  files: Document["files"];
}

export function documentListEndpoint(scope: DocumentListScope = "all") {
  if (scope === "my") return "/documents/my/";
  if (scope === "approval") return "/documents/for-approval/";
  if (scope === "returned") return "/documents/returned/";
  if (scope === "archive") return "/documents/archive/";
  if (scope === "overdue") return "/documents/overdue/";
  return "/documents/";
}

function toIsoBoundary(value: string | undefined, endOfDay: boolean) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || undefined;
  return `${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`;
}

export function serializeDocumentQueryParams(params: DocumentsParams) {
  return {
    search: params.search?.trim() || undefined,
    status: params.status,
    category: params.category || undefined,
    department: params.department || undefined,
    author: params.author || undefined,
    created_from: toIsoBoundary(params.createdFrom, false),
    created_to: toIsoBoundary(params.createdTo, true),
    page: params.page,
    page_size: params.pageSize,
    ordering: params.ordering,
  };
}

function toWritePayload(payload: Partial<DocumentFormPayload>) {
  return {
    title: payload.title,
    description: payload.description,
    document_type: payload.type,
    category_id: payload.categoryId,
    department_id: payload.departmentId,
    responsible_id: payload.responsibleId || null,
    deadline: payload.deadline,
    priority: payload.priority,
  };
}

async function uploadPendingFiles(documentId: string, files: Document["files"] = []) {
  const pendingFiles = files.filter(
    (file): file is typeof file & { sourceFile: File } => file.sourceFile !== undefined,
  );
  await Promise.all(
    pendingFiles.map((file, index) => {
      const formData = new FormData();
      formData.append("file", file.sourceFile);
      formData.append("is_main", String(index === 0));
      return api.post(`/documents/${documentId}/files/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }),
  );
}

async function hydrateDocument(document: Document): Promise<Document> {
  const [files, comments, history] = await Promise.all([
    api
      .get<ApiEnvelope<ApiPagination<DocumentFileDto> | DocumentFileDto[]>>(`/documents/${document.id}/files/`)
      .then((response) => unwrapResponse(response))
      .then((data) => (Array.isArray(data) ? data : data.results).map(mapDocumentFile)),
    api
      .get<ApiEnvelope<ApiPagination<DocumentCommentDto> | DocumentCommentDto[]>>(`/documents/${document.id}/comments/`)
      .then((response) => unwrapResponse(response))
      .then((data) => (Array.isArray(data) ? data : data.results).map(mapComment)),
    api
      .get<ApiEnvelope<ApiPagination<DocumentHistoryDto> | DocumentHistoryDto[]>>(
        `/documents/${document.id}/history/`,
      )
      .then((response) => unwrapResponse(response))
      .then((data) =>
        (Array.isArray(data) ? data : data.results).map((item) =>
          [item.created_at, item.description].filter(Boolean).join(" - "),
        ),
      ),
  ]);

  return { ...document, files, comments, history };
}

export const documentsApi = {
  async getDocuments(params: DocumentsParams = {}): Promise<PaginatedResponse<DocumentListItem>> {
    const response = await api.get<ApiEnvelope<PaginatedDocumentDto>>(documentListEndpoint(params.scope), {
      params: serializeDocumentQueryParams(params),
    });
    const page = unwrapResponse(response);
    return {
      data: page.results.map(mapDocumentList),
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      total: page.count,
      next: page.next,
      previous: page.previous,
    };
  },

  async getDocument(id: string): Promise<Document> {
    const response = await api.get<ApiEnvelope<DocumentDetailDto>>(`/documents/${id}/`);
    return hydrateDocument(mapDocumentDetail(unwrapResponse(response)));
  },

  async createDocument(payload: DocumentFormPayload & { status: Extract<DocumentStatus, "draft" | "in_review"> }) {
    const response = await api.post<ApiEnvelope<DocumentWriteResponseDto>>("/documents/", toWritePayload(payload));
    const documentId = unwrapResponse(response).id;

    if (payload.comment) {
      await api.post(`/documents/${documentId}/comments/`, { text: payload.comment });
    }

    await uploadPendingFiles(documentId, payload.files);

    if (payload.status === "in_review") {
      await api.post(`/documents/${documentId}/submit/`, { approvers: payload.approverIds });
    }

    return this.getDocument(documentId);
  },

  async updateDocument(id: string, payload: Partial<DocumentFormPayload>): Promise<Document> {
    const response = await api.patch<ApiEnvelope<DocumentWriteResponseDto>>(`/documents/${id}/`, toWritePayload(payload));
    const documentId = unwrapResponse(response).id;
    if (payload.comment) {
      await api.post(`/documents/${documentId}/comments/`, { text: payload.comment });
    }
    await uploadPendingFiles(documentId, payload.files);
    return this.getDocument(documentId);
  },

  async submitDocument(id: string): Promise<Document> {
    await api.post(`/documents/${id}/submit/`, {});
    return this.getDocument(id);
  },

  async approveDocument(id: string, comment = ""): Promise<Document> {
    await api.post(`/documents/${id}/approve/`, { comment });
    return this.getDocument(id);
  },

  async returnDocument(id: string, reason: string): Promise<Document> {
    await api.post(`/documents/${id}/return/`, { comment: reason });
    return this.getDocument(id);
  },

  async archiveDocument(id: string): Promise<Document> {
    await api.post(`/documents/${id}/archive/`, {});
    return this.getDocument(id);
  },

  async addComment(id: string, text: string): Promise<Document> {
    await api.post(`/documents/${id}/comments/`, { text });
    return this.getDocument(id);
  },
};

import { api, unwrapResponse } from "@/services/api";
import { mapComment, mapDocument, mapDocumentFile } from "@/services/mappers";
import type { ApiEnvelope, ApiPagination } from "@/services/types";
import type { Document, DocumentStatus, PaginatedResponse } from "@/types";

export interface DocumentsParams {
  status?: DocumentStatus;
  owner?: "me";
  scope?: "my" | "approval" | "returned" | "archive" | "overdue";
  query?: string;
  categoryId?: string;
  departmentId?: string;
  authorId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
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

function endpointFor(params: DocumentsParams) {
  if (params.owner === "me" || params.scope === "my") return "/documents/my/";
  if (params.scope === "approval") return "/documents/for-approval/";
  if (params.scope === "returned") return "/documents/returned/";
  if (params.scope === "archive") return "/documents/archive/";
  if (params.scope === "overdue") return "/documents/overdue/";
  return "/documents/";
}

function toQueryParams(params: DocumentsParams) {
  return {
    search: params.query || undefined,
    status: params.status,
    category: params.categoryId === "all" ? undefined : params.categoryId,
    department: params.departmentId === "all" ? undefined : params.departmentId,
    author: params.authorId === "all" ? undefined : params.authorId,
    created_from: params.dateFrom || undefined,
    created_to: params.dateTo || undefined,
    page: params.page,
    page_size: params.pageSize,
    ordering: "-created_at",
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
  const pendingFiles = files.filter((file) => file.sourceFile);
  await Promise.all(
    pendingFiles.map((file, index) => {
      const formData = new FormData();
      formData.append("file", file.sourceFile as File);
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
      .get<ApiEnvelope<ApiPagination<unknown> | unknown[]>>(`/documents/${document.id}/files/`)
      .then((response) => unwrapResponse(response))
      .then((data) => (Array.isArray(data) ? data : data.results).map((item) => mapDocumentFile(item as Parameters<typeof mapDocumentFile>[0])))
      .catch(() => []),
    api
      .get<ApiEnvelope<ApiPagination<unknown> | unknown[]>>(`/documents/${document.id}/comments/`)
      .then((response) => unwrapResponse(response))
      .then((data) => (Array.isArray(data) ? data : data.results).map((item) => mapComment(item as Parameters<typeof mapComment>[0])))
      .catch(() => []),
    api
      .get<ApiEnvelope<ApiPagination<{ description?: string; created_at?: string }> | { description?: string; created_at?: string }[]>>(
        `/documents/${document.id}/history/`,
      )
      .then((response) => unwrapResponse(response))
      .then((data) =>
        (Array.isArray(data) ? data : data.results).map((item) =>
          [item.created_at, item.description].filter(Boolean).join(" - "),
        ),
      )
      .catch(() => []),
  ]);

  return { ...document, files, comments, history };
}

export const documentsApi = {
  async getDocuments(params: DocumentsParams = {}): Promise<PaginatedResponse<Document>> {
    const response = await api.get<ApiEnvelope<ApiPagination<unknown>>>(endpointFor(params), { params: toQueryParams(params) });
    const page = unwrapResponse(response);
    return {
      data: page.results.map((item) => mapDocument(item as Parameters<typeof mapDocument>[0])),
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
      total: page.count,
    };
  },

  async getDocument(id: string): Promise<Document> {
    const response = await api.get<ApiEnvelope<unknown>>(`/documents/${id}/`);
    return hydrateDocument(mapDocument(unwrapResponse(response) as Parameters<typeof mapDocument>[0]));
  },

  async createDocument(payload: DocumentFormPayload & { status: Extract<DocumentStatus, "draft" | "in_review"> }) {
    const response = await api.post<ApiEnvelope<unknown>>("/documents/", toWritePayload(payload));
    let document = mapDocument(unwrapResponse(response) as Parameters<typeof mapDocument>[0]);

    if (payload.comment) {
      await api.post(`/documents/${document.id}/comments/`, { text: payload.comment });
    }

    await uploadPendingFiles(document.id, payload.files);

    if (payload.status === "in_review") {
      await api.post(`/documents/${document.id}/submit/`, { approvers: payload.approverIds });
      document = await this.getDocument(document.id);
    }

    return document;
  },

  async updateDocument(id: string, payload: Partial<DocumentFormPayload>): Promise<Document> {
    const response = await api.patch<ApiEnvelope<unknown>>(`/documents/${id}/`, toWritePayload(payload));
    if (payload.comment) {
      await api.post(`/documents/${id}/comments/`, { text: payload.comment });
    }
    await uploadPendingFiles(id, payload.files);
    return hydrateDocument(mapDocument(unwrapResponse(response) as Parameters<typeof mapDocument>[0]));
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

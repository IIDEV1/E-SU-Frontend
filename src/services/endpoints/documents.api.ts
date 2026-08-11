import { currentUser, documents as initialDocuments } from "@/mocks/data";
import type { Document, DocumentStatus, PaginatedResponse } from "@/types";

export interface DocumentsParams {
  status?: DocumentStatus;
  owner?: "me";
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

let documentState: Document[] = structuredClone(initialDocuments);

const wait = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function nextNumber() {
  return `ESU-2026-${String(documentState.length + 1).padStart(3, "0")}`;
}

function findDocument(id: string) {
  const document = documentState.find((item) => item.id === id);
  if (!document) {
    throw new Error("Документ не найден.");
  }
  return document;
}

function upsertDocument(nextDocument: Document) {
  documentState = documentState.map((item) => (item.id === nextDocument.id ? nextDocument : item));
  return structuredClone(nextDocument);
}

export const documentsApi = {
  async getDocuments(params: DocumentsParams = {}): Promise<PaginatedResponse<Document>> {
    await wait();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const normalizedQuery = params.query?.toLowerCase().trim();

    const filtered = documentState.filter((document) => {
      const matchesStatus = params.status ? document.status === params.status : true;
      const matchesOwner = params.owner ? document.author.id === currentUser.id : true;
      const matchesCategory = params.categoryId ? document.category.id === params.categoryId : true;
      const matchesDepartment = params.departmentId ? document.department.id === params.departmentId : true;
      const matchesAuthor = params.authorId ? document.author.id === params.authorId : true;
      const matchesDateFrom = params.dateFrom ? document.createdAt >= params.dateFrom : true;
      const matchesDateTo = params.dateTo ? document.createdAt <= params.dateTo : true;
      const matchesQuery = normalizedQuery
        ? [document.title, document.number, document.category.name, document.author.name, document.department.name].some(
            (value) => value.toLowerCase().includes(normalizedQuery),
          )
        : true;

      return (
        matchesStatus &&
        matchesOwner &&
        matchesCategory &&
        matchesDepartment &&
        matchesAuthor &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesQuery
      );
    });

    return {
      data: structuredClone(filtered.slice((page - 1) * pageSize, page * pageSize)),
      page,
      pageSize,
      total: filtered.length,
    };
  },

  async getDocument(id: string): Promise<Document> {
    await wait();
    return structuredClone(findDocument(id));
  },

  async createDocument(payload: DocumentFormPayload & { status: Extract<DocumentStatus, "draft" | "in_review"> }) {
    await wait(350);
    const source = initialDocuments[0];
    const document: Document = {
      ...source,
      ...payload,
      id: `doc-${crypto.randomUUID()}`,
      number: nextNumber(),
      title: payload.title,
      category: initialDocuments.flatMap((item) => item.category).find((item) => item.id === payload.categoryId) ?? source.category,
      department: initialDocuments.flatMap((item) => item.department).find((item) => item.id === payload.departmentId) ?? source.department,
      responsible:
        initialDocuments.flatMap((item) => [item.author, item.responsible]).find((item) => item.id === payload.responsibleId) ??
        source.responsible,
      author: currentUser,
      createdAt: new Date().toISOString().slice(0, 10),
      status: payload.status,
      files: payload.files,
      approvalSteps: payload.approverIds.map((approverId, index) => {
        const approver =
          initialDocuments.flatMap((item) => [item.author, item.responsible]).find((item) => item.id === approverId) ??
          source.responsible;
        return { id: `step-${crypto.randomUUID()}`, approver, status: index === 0 && payload.status === "in_review" ? "pending" : "pending" };
      }),
      comments: payload.comment
        ? [{ id: `comment-${crypto.randomUUID()}`, author: currentUser, text: payload.comment, createdAt: new Date().toISOString() }]
        : [],
      history: [payload.status === "draft" ? "Черновик сохранен" : "Документ создан", payload.status === "in_review" ? "Отправлен на согласование" : "Ожидает отправки"],
      currentStage: payload.status === "draft" ? "Черновик у автора" : "Согласование руководителем",
      returnReason: undefined,
    };

    documentState = [document, ...documentState];
    return structuredClone(document);
  },

  async updateDocument(id: string, payload: Partial<DocumentFormPayload>): Promise<Document> {
    await wait(300);
    const document = findDocument(id);
    const nextDocument: Document = {
      ...document,
      title: payload.title ?? document.title,
      type: payload.type ?? document.type,
      description: payload.description ?? document.description,
      deadline: payload.deadline ?? document.deadline,
      priority: payload.priority ?? document.priority,
      files: payload.files ?? document.files,
      history: ["Данные документа обновлены", ...document.history],
      currentStage: document.status === "returned" ? "Повторная подготовка" : document.currentStage,
    };

    return upsertDocument(nextDocument);
  },

  async submitDocument(id: string): Promise<Document> {
    await wait(250);
    const document = findDocument(id);
    return upsertDocument({
      ...document,
      status: "in_review",
      currentStage: "Согласование руководителем",
      history: ["Документ отправлен на согласование", ...document.history],
      returnReason: undefined,
    });
  },

  async approveDocument(id: string): Promise<Document> {
    await wait(250);
    const document = findDocument(id);
    return upsertDocument({
      ...document,
      status: "approved",
      currentStage: "Финальное согласование",
      approvalSteps: document.approvalSteps.map((step, index) =>
        index === 0 ? { ...step, status: "approved", date: new Date().toISOString() } : step,
      ),
      history: ["Документ согласован", ...document.history],
    });
  },

  async returnDocument(id: string, reason: string): Promise<Document> {
    await wait(250);
    const document = findDocument(id);
    return upsertDocument({
      ...document,
      status: "returned",
      currentStage: "Доработка автором",
      returnReason: reason,
      history: [`Документ возвращен: ${reason}`, ...document.history],
    });
  },

  async archiveDocument(id: string): Promise<Document> {
    await wait(250);
    const document = findDocument(id);
    return upsertDocument({
      ...document,
      status: "archived",
      currentStage: "Архив",
      history: ["Документ архивирован", ...document.history],
    });
  },

  async addComment(id: string, text: string): Promise<Document> {
    await wait(200);
    const document = findDocument(id);
    return upsertDocument({
      ...document,
      comments: [{ id: `comment-${crypto.randomUUID()}`, author: currentUser, text, createdAt: new Date().toISOString() }, ...document.comments],
      history: ["Добавлен комментарий", ...document.history],
    });
  },
};

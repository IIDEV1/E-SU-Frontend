import { QueryClient } from "@tanstack/react-query";
import { AxiosHeaders, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { documentKeys, invalidateDocumentWorkflow } from "@/hooks/useDocuments";
import { getDocumentWorkflowAvailability, isValidReturnComment } from "@/pages/documents/DocumentDetailPage";
import { api } from "@/services/api";
import { documentsApi, type DocumentFormPayload } from "@/services/endpoints/documents.api";
import type {
  ApiEnvelope,
  ApiPagination,
  ApprovalRouteDto,
  DocumentCommentDto,
  DocumentDetailDto,
  DocumentFileDto,
  DocumentHistoryDto,
  DocumentWriteResponseDto,
} from "@/services/types";

vi.mock("@/services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/api")>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    },
  };
});

function response<T>(data: T): AxiosResponse<ApiEnvelope<T>> {
  return {
    data: { data, message: "Success" },
    status: 200,
    statusText: "OK",
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
}

function emptyPage<T>(): ApiPagination<T> {
  return { count: 0, next: null, previous: null, results: [] };
}

const detailDto: DocumentDetailDto = {
  id: "document-workflow-1",
  registration_number: null,
  title: "Документ workflow",
  document_type: "order",
  description: "Полное описание документа",
  category: { id: "category-1", name: "Приказы", code: "orders", status: "active" },
  author: { id: "author-1", email: "author@esu.kg", full_name: "Автор", position: "Специалист" },
  department: { id: "department-1", code: "IT", name: "IT", status: "active" },
  responsible: null,
  priority: "normal",
  status: "draft",
  deadline: null,
  submitted_at: null,
  approved_at: null,
  completed_at: null,
  archived_at: null,
  current_approval_step: null,
  created_at: "2026-08-26T10:00:00+06:00",
  updated_at: "2026-08-26T10:00:00+06:00",
};

const writeResponse: DocumentWriteResponseDto = {
  id: detailDto.id,
  title: detailDto.title,
  description: detailDto.description,
  document_type: detailDto.document_type,
  category_id: detailDto.category.id,
  department_id: detailDto.department.id,
  responsible_id: null,
  priority: detailDto.priority,
  deadline: null,
};

const routeDto: ApprovalRouteDto = {
  id: "route-1",
  document: detailDto.id,
  status: "active",
  source: "manual",
  template: null,
  template_snapshot: {},
  created_by: detailDto.author,
  created_at: detailDto.created_at,
  completed_at: null,
  steps: [],
  actions: [],
};

const formPayload: DocumentFormPayload = {
  title: detailDto.title,
  categoryId: detailDto.category.id,
  type: detailDto.document_type,
  description: detailDto.description,
  departmentId: detailDto.department.id,
  responsibleId: "",
  deadline: "",
  priority: detailDto.priority,
  approverIds: ["approver-1"],
  files: [],
};

function mockHydration() {
  vi.mocked(api.get)
    .mockResolvedValueOnce(response(detailDto))
    .mockResolvedValueOnce(response(emptyPage<DocumentFileDto>()))
    .mockResolvedValueOnce(response(emptyPage<DocumentCommentDto>()))
    .mockResolvedValueOnce(response(emptyPage<DocumentHistoryDto>()));
}

describe("Release 1 document workflow API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads the approval route through its separate confirmed endpoint", async () => {
    vi.mocked(api.get).mockResolvedValueOnce(response(routeDto));

    await expect(documentsApi.getApprovalRoute(detailDto.id)).resolves.toEqual(routeDto);
    expect(api.get).toHaveBeenCalledWith(`/documents/${detailDto.id}/approval/`);
  });

  it.each([
    ["submit", (id: string) => documentsApi.submitDocument(id, ["approver-1"]), "/submit/", { approvers: ["approver-1"] }],
    ["approve", (id: string) => documentsApi.approveDocument(id), "/approve/", { comment: "" }],
    ["return", (id: string) => documentsApi.returnDocument(id, "Нужна доработка"), "/return/", { comment: "Нужна доработка" }],
    ["register", (id: string) => documentsApi.registerDocument(id), "/register/", {}],
    ["complete", (id: string) => documentsApi.completeDocument(id), "/complete/", {}],
    ["archive", (id: string) => documentsApi.archiveDocument(id), "/archive/", {}],
    ["restore", (id: string) => documentsApi.restoreDocument(id), "/restore/", {}],
  ] as const)("uses POST %s workflow endpoint", async (_, action, suffix, body) => {
    vi.mocked(api.post).mockResolvedValueOnce(response(routeDto));
    mockHydration();

    await action(detailDto.id);

    expect(api.post).toHaveBeenCalledWith(`/documents/${detailDto.id}${suffix}`, body);
  });

  it("updates the same returned document before submitting it again", async () => {
    vi.mocked(api.patch).mockResolvedValueOnce(response(writeResponse));
    vi.mocked(api.post).mockResolvedValueOnce(response(routeDto));
    mockHydration();

    await documentsApi.updateAndSubmitDocument(detailDto.id, formPayload);

    expect(api.patch).toHaveBeenCalledWith(`/documents/${detailDto.id}/`, expect.any(Object));
    expect(api.post).toHaveBeenCalledWith(`/documents/${detailDto.id}/submit/`, {
      approvers: formPayload.approverIds,
    });
    expect(vi.mocked(api.patch).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(api.post).mock.invocationCallOrder[0],
    );
  });

  it("invalidates every workflow-dependent query after a successful mutation", async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);

    await invalidateDocumentWorkflow(queryClient, detailDto.id);

    expect(invalidate).toHaveBeenCalledWith({ queryKey: documentKeys.lists() });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: documentKeys.detail(detailDto.id) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: documentKeys.approval(detailDto.id) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: documentKeys.history(detailDto.id) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["dashboard"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["notifications"] });
  });

  it("derives each visible action from both permissions and backend status", () => {
    const can = (permission?: string | string[]) => permission === "documents.create" || permission === "documents.edit";

    expect(getDocumentWorkflowAvailability("returned", can)).toMatchObject({
      canEdit: true,
      canSubmit: true,
      canApprove: false,
      canReturn: false,
    });
    expect(getDocumentWorkflowAvailability("approved", can)).toMatchObject({
      canRegister: false,
      canComplete: true,
      canArchive: false,
    });
    expect(getDocumentWorkflowAvailability("archived", can)).toMatchObject({ canRestore: false });
  });

  it("requires a non-whitespace return comment with at least three characters", () => {
    expect(isValidReturnComment(" ")).toBe(false);
    expect(isValidReturnComment("ok")).toBe(false);
    expect(isValidReturnComment("Нужно уточнение")).toBe(true);
  });
});

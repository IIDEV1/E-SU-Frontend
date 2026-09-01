import { AxiosHeaders, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDocumentListState,
  documentListReducer,
} from "@/features/documents/DocumentTable";
import { documentKeys } from "@/hooks/useDocuments";
import { api } from "@/services/api";
import {
  documentsApi,
  documentListEndpoint,
  serializeDocumentQueryParams,
  type DocumentsParams,
} from "@/services/endpoints/documents.api";
import type { ApiEnvelope, DocumentListDto, PaginatedDocumentDto } from "@/services/types";

vi.mock("@/services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/api")>();
  return {
    ...actual,
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
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

const listDocument: DocumentListDto = {
  id: "document-list-1",
  registration_number: "ESU-2026-001",
  title: "Приказ",
  document_type: "order",
  category: { id: "category-1", name: "Приказы", code: "orders", status: "active" },
  author: { id: "author-1", email: "author@esu.kg", full_name: "Автор", position: "Специалист" },
  department: { id: "department-1", code: "IT", name: "IT", status: "active" },
  responsible: null,
  priority: "high",
  status: "in_review",
  deadline: null,
  submitted_at: "2026-08-20T10:00:00+06:00",
  approved_at: null,
  completed_at: null,
  archived_at: null,
  current_approval_step: 1,
  created_at: "2026-08-20T09:00:00+06:00",
  updated_at: "2026-08-20T10:00:00+06:00",
};

describe("Release 1 server-side document lists", () => {
  beforeEach(() => vi.clearAllMocks());

  it("serializes the exact backend filter, ordering and pagination parameters", () => {
    const params: DocumentsParams = {
      scope: "approval",
      search: "  приказ  ",
      status: "in_review",
      category: "category-1",
      department: "department-1",
      author: "author-1",
      createdFrom: "2026-08-01",
      createdTo: "2026-08-31",
      ordering: "deadline",
      page: 3,
      pageSize: 50,
    };

    expect(serializeDocumentQueryParams(params)).toEqual({
      search: "приказ",
      status: "in_review",
      category: "category-1",
      department: "department-1",
      author: "author-1",
      created_from: "2026-08-01T00:00:00",
      created_to: "2026-08-31T23:59:59.999",
      ordering: "deadline",
      page: 3,
      page_size: 50,
    });
  });

  it.each([
    ["all", "/documents/"],
    ["my", "/documents/my/"],
    ["approval", "/documents/for-approval/"],
    ["returned", "/documents/returned/"],
    ["overdue", "/documents/overdue/"],
    ["archive", "/documents/archive/"],
  ] as const)("maps the %s scope to its confirmed endpoint", (scope, endpoint) => {
    expect(documentListEndpoint(scope)).toBe(endpoint);
  });

  it("builds distinct query keys for scope, page and filters", () => {
    const base = documentKeys.list({ scope: "all", page: 1, search: "приказ" });
    expect(documentKeys.list({ scope: "my", page: 1, search: "приказ" })).not.toEqual(base);
    expect(documentKeys.list({ scope: "all", page: 2, search: "приказ" })).not.toEqual(base);
    expect(documentKeys.list({ scope: "all", page: 1, search: "заявление" })).not.toEqual(base);
  });

  it("uses backend count, results and navigation links for pagination", async () => {
    const page: PaginatedDocumentDto = {
      count: 41,
      next: "http://localhost:8000/api/v1/documents/?page=3&page_size=20",
      previous: "http://localhost:8000/api/v1/documents/?page=1&page_size=20",
      results: [listDocument],
    };
    vi.mocked(api.get).mockResolvedValueOnce(response(page));

    const result = await documentsApi.getDocuments({ scope: "all", page: 2, pageSize: 20 });

    expect(result).toMatchObject({
      page: 2,
      pageSize: 20,
      total: 41,
      next: page.next,
      previous: page.previous,
    });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(listDocument.id);
  });

  it("resets page to one whenever a filter or ordering changes", () => {
    const state = { ...createDocumentListState(), page: 4 };

    const filtered = documentListReducer(state, { type: "filter", field: "category", value: "category-1" });
    const sorted = documentListReducer({ ...state, page: 3 }, { type: "ordering", value: "title" });

    expect(filtered).toMatchObject({ category: "category-1", page: 1 });
    expect(sorted).toMatchObject({ ordering: "title", page: 1 });
  });
});

import { AxiosHeaders, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/services/api";
import { documentsApi, type DocumentFormPayload } from "@/services/endpoints/documents.api";
import { mapDocumentDetail } from "@/services/mappers";
import type {
  ApiEnvelope,
  ApiPagination,
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
  id: "document-1",
  registration_number: "ESU-IT-2026-000001",
  title: "Приказ о тестировании",
  document_type: "order",
  description: "Полное описание документа",
  category: { id: "category-1", name: "Приказы", code: "orders", status: "active" },
  author: {
    id: "user-author",
    email: "author@esu.kg",
    full_name: "Иванов Иван",
    position: "Специалист",
  },
  department: { id: "department-1", code: "it", name: "IT отдел", status: "active" },
  responsible: {
    id: "user-responsible",
    email: "responsible@esu.kg",
    full_name: "Петров Пётр",
    position: "Руководитель",
  },
  priority: "high",
  status: "in_review",
  deadline: "2026-09-10T12:00:00+06:00",
  submitted_at: "2026-08-26T12:00:00+06:00",
  approved_at: null,
  completed_at: null,
  archived_at: null,
  current_approval_step: 2,
  created_at: "2026-08-26T10:00:00+06:00",
  updated_at: "2026-08-26T12:00:00+06:00",
};

const writeResponseDto: DocumentWriteResponseDto = {
  id: detailDto.id,
  title: detailDto.title,
  description: detailDto.description,
  document_type: detailDto.document_type,
  category_id: detailDto.category.id,
  department_id: detailDto.department.id,
  responsible_id: "user-responsible",
  priority: detailDto.priority,
  deadline: detailDto.deadline,
};

const formPayload: DocumentFormPayload = {
  title: detailDto.title,
  categoryId: detailDto.category.id,
  type: detailDto.document_type,
  description: detailDto.description,
  departmentId: detailDto.department.id,
  responsibleId: "user-responsible",
  deadline: "2026-09-10T12:00:00+06:00",
  priority: detailDto.priority,
  approverIds: [],
  files: [],
};

function mockFullDocumentHydration() {
  vi.mocked(api.get)
    .mockResolvedValueOnce(response(detailDto))
    .mockResolvedValueOnce(response(emptyPage<DocumentFileDto>()))
    .mockResolvedValueOnce(response(emptyPage<DocumentCommentDto>()))
    .mockResolvedValueOnce(response(emptyPage<DocumentHistoryDto>()));
}

describe("Release 1 document data layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps the confirmed full detail DTO without fallback identifiers", () => {
    const document = mapDocumentDetail(detailDto);

    expect(document).toMatchObject({
      id: detailDto.id,
      number: detailDto.registration_number,
      title: detailDto.title,
      description: detailDto.description,
      category: detailDto.category,
      department: detailDto.department,
      status: detailDto.status,
      currentStage: "Шаг 2",
    });
    expect(document.author.id).toBe(detailDto.author.id);
    expect(document.responsible.id).toBe(detailDto.responsible?.id);
  });

  it("uses the create write response only for its id and then returns hydrated detail", async () => {
    vi.mocked(api.post).mockResolvedValueOnce(response(writeResponseDto));
    mockFullDocumentHydration();

    const document = await documentsApi.createDocument({ ...formPayload, status: "draft" });

    expect(api.post).toHaveBeenCalledWith("/documents/", expect.any(Object));
    expect(api.get).toHaveBeenNthCalledWith(1, `/documents/${writeResponseDto.id}/`);
    expect(document.id).toBe(detailDto.id);
    expect(document.description).toBe(detailDto.description);
    expect(document.category.id).toBe(detailDto.category.id);
  });

  it("uses the update write response only for its id and then returns hydrated detail", async () => {
    vi.mocked(api.patch).mockResolvedValueOnce(response(writeResponseDto));
    mockFullDocumentHydration();

    const document = await documentsApi.updateDocument(writeResponseDto.id, formPayload);

    expect(api.patch).toHaveBeenCalledWith(`/documents/${writeResponseDto.id}/`, expect.any(Object));
    expect(api.get).toHaveBeenNthCalledWith(1, `/documents/${writeResponseDto.id}/`);
    expect(document).toMatchObject({ id: detailDto.id, description: detailDto.description });
  });

  it.each(["create", "update"] as const)(
    "rejects %s when the required detail hydration fails",
    async (operation) => {
      const hydrationError = new Error("detail hydration failed");
      vi.mocked(api.get)
        .mockResolvedValueOnce(response(detailDto))
        .mockRejectedValueOnce(hydrationError)
        .mockResolvedValueOnce(response(emptyPage<DocumentCommentDto>()))
        .mockResolvedValueOnce(response(emptyPage<DocumentHistoryDto>()));

      if (operation === "create") {
        vi.mocked(api.post).mockResolvedValueOnce(response(writeResponseDto));
        await expect(
          documentsApi.createDocument({ ...formPayload, status: "draft" }),
        ).rejects.toBe(hydrationError);
      } else {
        vi.mocked(api.patch).mockResolvedValueOnce(response(writeResponseDto));
        await expect(documentsApi.updateDocument(writeResponseDto.id, formPayload)).rejects.toBe(
          hydrationError,
        );
      }
    },
  );
});

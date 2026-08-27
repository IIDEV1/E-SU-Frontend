import { AxiosHeaders, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/services/api";
import { documentsApi, uploadPendingFiles } from "@/services/endpoints/documents.api";
import type { ApiEnvelope, ApiPagination, DocumentFileDto, DocumentHistoryDto } from "@/services/types";
import type { DocumentFile } from "@/types";

vi.mock("@/services/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/api")>();
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
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

const fileDto: DocumentFileDto = {
  id: "file-1",
  document: "document-1",
  file: "/media/documents/server.pdf",
  original_name: "server.pdf",
  file_type: "pdf",
  mime_type: "application/pdf",
  size: 128,
  is_main: true,
  uploaded_by: null,
  created_at: "2026-08-26T10:00:00+06:00",
};

describe("Release 1 document files, comments and history API", () => {
  beforeEach(() => vi.resetAllMocks());

  it("uploads multipart data with the backend file and is_main fields", async () => {
    const file = new File(["%PDF-1.4"], "draft.pdf", { type: "application/pdf" });
    vi.mocked(api.post).mockResolvedValueOnce(response(fileDto));

    await documentsApi.uploadDocumentFile("document-1", file, true);

    const [, formData] = vi.mocked(api.post).mock.calls[0];
    expect(formData).toBeInstanceOf(FormData);
    expect((formData as FormData).get("file")).toBe(file);
    expect((formData as FormData).get("is_main")).toBe("true");
    expect(api.post).toHaveBeenCalledWith(
      "/documents/document-1/files/",
      expect.any(FormData),
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  });

  it("downloads an authenticated blob and uses the attachment filename", async () => {
    const blob = new Blob(["%PDF-1.4"], { type: "application/pdf" });
    vi.mocked(api.get).mockResolvedValueOnce({
      data: blob,
      status: 200,
      statusText: "OK",
      headers: new AxiosHeaders({ "content-disposition": 'attachment; filename="contract.pdf"' }),
      config: { headers: new AxiosHeaders() },
    } as AxiosResponse<Blob>);

    const downloaded = await documentsApi.downloadDocumentFile(fileDto.id, fileDto.original_name);

    expect(api.get).toHaveBeenCalledWith(`/document-files/${fileDto.id}/download/`, { responseType: "blob" });
    expect(downloaded).toEqual({ blob, filename: "contract.pdf" });
  });

  it("deletes an existing server file through the exact endpoint", async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ status: 204 } as AxiosResponse<void>);

    await documentsApi.deleteDocumentFile(fileDto.id);

    expect(api.delete).toHaveBeenCalledWith(`/document-files/${fileDto.id}/`);
  });

  it("does not upload an existing server file again", async () => {
    const serverFile: DocumentFile = {
      id: fileDto.id,
      name: fileDto.original_name,
      size: fileDto.size,
      type: fileDto.mime_type,
      url: fileDto.file,
      uploadedAt: fileDto.created_at,
    };

    await uploadPendingFiles(fileDto.document, [serverFile]);

    expect(api.post).not.toHaveBeenCalled();
  });

  it.each([
    ["files", () => documentsApi.getDocumentFiles("document-1")],
    ["comments", () => documentsApi.getDocumentComments("document-1")],
    ["history", () => documentsApi.getDocumentHistory("document-1")],
  ] as const)("propagates %s endpoint errors instead of returning an empty list", async (_, request) => {
    const networkError = new Error("network unavailable");
    vi.mocked(api.get).mockRejectedValueOnce(networkError);

    await expect(request()).rejects.toBe(networkError);
  });

  it("maps structured history fields returned by the backend", async () => {
    const page: ApiPagination<DocumentHistoryDto> = {
      count: 1,
      next: null,
      previous: null,
      results: [{
        id: "history-1",
        document: "document-1",
        user: { id: "user-1", email: "user@esu.kg", full_name: "Иван Иванов", position: "Специалист" },
        action: "file_uploaded",
        old_values: {},
        new_values: {},
        description: "Загружен файл contract.pdf",
        created_at: "2026-08-26T10:00:00+06:00",
      }],
    };
    vi.mocked(api.get).mockResolvedValueOnce(response(page));

    await expect(documentsApi.getDocumentHistory("document-1")).resolves.toEqual([{
      id: "history-1",
      user: expect.objectContaining({ name: "Иван Иванов" }),
      action: "file_uploaded",
      description: "Загружен файл contract.pdf",
      createdAt: "2026-08-26T10:00:00+06:00",
    }]);
  });
});

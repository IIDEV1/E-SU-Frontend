import { AxiosHeaders, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminApi } from "@/services/endpoints/admin.api";
import { departmentsApi } from "@/services/endpoints/departments.api";
import { notificationsApi } from "@/services/endpoints/notifications.api";
import { usersApi } from "@/services/endpoints/users.api";
import { api } from "@/services/api";
import type { ApiEnvelope } from "@/services/types";

vi.mock("@/services/api", () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() }, unwrapResponse: (response: { data: ApiEnvelope<unknown> }) => response.data.data }));
const response = <T,>(data: T): AxiosResponse<ApiEnvelope<T>> => ({ data: { data, message: "Success" }, status: 200, statusText: "OK", headers: new AxiosHeaders(), config: { headers: new AxiosHeaders() } });

describe("admin core API", () => {
  beforeEach(() => vi.resetAllMocks());
  it("updates profile before a separate user status action", async () => {
    vi.mocked(api.patch).mockResolvedValue(response({ id: "u-1" }));
    await usersApi.updateUser("u-1", { position: "Менеджер" });
    expect(api.patch).toHaveBeenCalledWith("/users/u-1/", { position: "Менеджер" });
  });
  it("deactivates a department through PATCH status inactive", async () => {
    vi.mocked(api.patch).mockResolvedValue(response({ id: "d-1" }));
    await departmentsApi.updateDepartment("d-1", { status: "inactive" });
    expect(api.patch).toHaveBeenCalledWith("/departments/d-1/", { status: "inactive" });
  });
  it("deletes a category through its real endpoint", async () => {
    vi.mocked(api.delete).mockResolvedValue(response(undefined));
    await adminApi.deleteCategory("c-1");
    expect(api.delete).toHaveBeenCalledWith("/document-categories/c-1/");
  });
  it("marks one or all notifications read and retrieves unread count", async () => {
    vi.mocked(api.post).mockResolvedValue(response({ id: "n-1", type: "document_submitted", title: "t", message: "m", is_read: true, document: null, created_at: "2026-01-01" }));
    await notificationsApi.markRead("n-1");
    expect(api.post).toHaveBeenCalledWith("/notifications/n-1/read/");
    vi.mocked(api.post).mockResolvedValue(response({ updated: 2 }));
    await notificationsApi.markAllRead();
    expect(api.post).toHaveBeenCalledWith("/notifications/read-all/");
  });
});

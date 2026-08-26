import { AxiosHeaders, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { auditLogListReducer, getAuditScreenState, initialAuditLogListState, toAuditLogsParams } from "./auditLogState";
import { api } from "@/services/api";
import { adminApi, serializeAuditLogQueryParams, type AuditLogDto } from "@/services/endpoints/admin.api";
import type { ApiEnvelope, ApiPagination } from "@/services/types";

vi.mock("@/services/api", () => ({
  api: { get: vi.fn() },
  unwrapResponse: (response: { data: ApiEnvelope<unknown> }) => response.data.data,
}));

function response<T>(data: T): AxiosResponse<ApiEnvelope<T>> {
  return {
    data: { data, message: "Success" },
    status: 200,
    statusText: "OK",
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
}

const log: AuditLogDto = {
  id: "audit-1",
  user: { id: "user-1", email: "admin@esu.kg", full_name: "Администратор" },
  action: "user_block",
  action_display: "Блокировка пользователя",
  object_type: "user",
  object_id: "user-2",
  description: "Пользователь заблокирован",
  ip_address: null,
  user_agent: "vitest",
  result: "success",
  result_display: "Успешно",
  metadata: {},
  created_at: "2026-08-27T10:00:00+06:00",
};

describe("Release 1 audit log integration", () => {
  beforeEach(() => vi.resetAllMocks());

  it("serializes every confirmed audit query parameter", () => {
    expect(serializeAuditLogQueryParams({
      page: 3,
      pageSize: 50,
      search: "  блокировка  ",
      user: " user-1 ",
      userEmail: " admin@esu.kg ",
      action: "user_block",
      objectType: " user ",
      objectId: " user-2 ",
      result: "failure",
      dateFrom: "2026-08-01T00:00",
      dateTo: "2026-08-31T23:59",
      ordering: "-action",
    })).toEqual({
      page: 3,
      page_size: 50,
      search: "блокировка",
      user: "user-1",
      user_email: "admin@esu.kg",
      action: "user_block",
      object_type: "user",
      object_id: "user-2",
      result: "failure",
      date_from: "2026-08-01T00:00",
      date_to: "2026-08-31T23:59",
      ordering: "-action",
    });
  });

  it("uses backend count, next, previous, and results for pagination", async () => {
    const page: ApiPagination<AuditLogDto> = {
      count: 41,
      next: "http://localhost:8000/api/v1/audit/?page=3&page_size=20",
      previous: "http://localhost:8000/api/v1/audit/?page=1&page_size=20",
      results: [log],
    };
    vi.mocked(api.get).mockResolvedValueOnce(response(page));

    const result = await adminApi.getAuditLogs({ page: 2, pageSize: 20 });

    expect(api.get).toHaveBeenCalledWith("/audit/", { params: expect.objectContaining({ page: 2, page_size: 20 }) });
    expect(result).toMatchObject({ page: 2, pageSize: 20, total: 41, next: page.next, previous: page.previous });
    expect(result.data).toEqual([expect.objectContaining({ id: log.id, actionDisplay: log.action_display })]);
  });

  it("resets pagination when a filter, ordering, or reset is applied", () => {
    const pageFour = { ...initialAuditLogListState, page: 4 };

    expect(auditLogListReducer(pageFour, { type: "filter", field: "search", value: "вход" })).toMatchObject({ search: "вход", page: 1 });
    expect(auditLogListReducer(pageFour, { type: "ordering", value: "action" })).toMatchObject({ ordering: "action", page: 1 });
    expect(auditLogListReducer({ ...pageFour, search: "вход" }, { type: "reset" })).toEqual(initialAuditLogListState);
    expect(toAuditLogsParams({ ...pageFour, result: "failure" }, 20)).toMatchObject({ page: 4, pageSize: 20, result: "failure" });
  });

  it("loads the available actions from the backend reference endpoint", async () => {
    vi.mocked(api.get).mockResolvedValueOnce(response([{ code: "login", name: "Вход в систему" }]));

    await expect(adminApi.getAuditActions()).resolves.toEqual([{ code: "login", name: "Вход в систему" }]);
    expect(api.get).toHaveBeenCalledWith("/audit/actions/");
  });

  it("does not turn loading or errors into an empty audit state", () => {
    expect(getAuditScreenState({ isLoading: true, isError: false }, { isLoading: false, isError: false })).toBe("loading");
    expect(getAuditScreenState({ isLoading: false, isError: true }, { isLoading: false, isError: false })).toBe("error");
    expect(getAuditScreenState({ isLoading: false, isError: false }, { isLoading: false, isError: false })).toBe("content");
  });
});

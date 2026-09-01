import { QueryClient } from "@tanstack/react-query";
import { AxiosHeaders, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminKeys, invalidateSystemSettingsQuery } from "@/features/admin/hooks";
import { api } from "@/services/api";
import { adminApi, settingsFromBackend, type SystemSettingDto, type SystemSettingsValues } from "@/services/endpoints/admin.api";
import type { ApiEnvelope } from "@/services/types";
import { buildSystemSettingsPatch, getSettingsScreenState, saveSystemSettingsDraft } from "./settingsState";

vi.mock("@/services/api", () => ({
  api: { get: vi.fn(), patch: vi.fn() },
  unwrapResponse: (response: { data: ApiEnvelope<unknown> }) => response.data.data,
}));

function response<T>(data: T): AxiosResponse<ApiEnvelope<T>> {
  return { data: { data, message: "Success" }, status: 200, statusText: "OK", headers: new AxiosHeaders(), config: { headers: new AxiosHeaders() } };
}

const settings: SystemSettingDto[] = [
  { key: "university_name", value: "Салымбеков Университет", typed_value: "Салымбеков Университет", value_type: "string", description: "", is_public: true, updated_at: "2026-08-27T10:00:00Z" },
  { key: "sender_email", value: "noreply@esu.kg", typed_value: "noreply@esu.kg", value_type: "string", description: "", is_public: false, updated_at: "2026-08-27T10:00:00Z" },
  { key: "allowed_file_extensions", value: "[\"pdf\", \"docx\"]", typed_value: ["pdf", "docx"], value_type: "json", description: "", is_public: true, updated_at: "2026-08-27T10:00:00Z" },
  { key: "max_file_size_mb", value: "20", typed_value: 20, value_type: "integer", description: "", is_public: true, updated_at: "2026-08-27T10:00:00Z" },
  { key: "document_number_format", value: "{year}-{sequence}", typed_value: "{year}-{sequence}", value_type: "string", description: "", is_public: false, updated_at: "2026-08-27T10:00:00Z" },
  { key: "reminder_days_before_deadline", value: "3", typed_value: 3, value_type: "integer", description: "", is_public: true, updated_at: "2026-08-27T10:00:00Z" },
  { key: "unsupported", value: "ignored", typed_value: "ignored", value_type: "string", description: "", is_public: false, updated_at: "2026-08-27T10:00:00Z" },
];

describe("Release 1 system settings integration", () => {
  beforeEach(() => vi.resetAllMocks());

  it("maps only supported backend settings with their actual types", () => {
    expect(settingsFromBackend(settings).values).toEqual({ university_name: "Салымбеков Университет", sender_email: "noreply@esu.kg", allowed_file_extensions: ["pdf", "docx"], max_file_size_mb: 20, document_number_format: "{year}-{sequence}", reminder_days_before_deadline: 3 });
  });

  it("sends only changed supported keys and excludes an unknown key", async () => {
    const saved = settingsFromBackend(settings).values;
    const draft = { ...saved, max_file_size_mb: 40, unknown: "must not leave the browser" } as SystemSettingsValues & { unknown: string };
    const patch = buildSystemSettingsPatch(saved, draft);
    vi.mocked(api.patch).mockResolvedValueOnce(response(settings));

    await adminApi.updateSettings({ ...patch, unknown: "must not leave the browser" } as SystemSettingsValues);

    expect(patch).toEqual({ max_file_size_mb: 40 });
    expect(api.patch).toHaveBeenCalledWith("/settings/", { max_file_size_mb: 40 });
  });

  it("invalidates settings after a successful update", async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);

    await invalidateSystemSettingsQuery(queryClient);

    expect(invalidate).toHaveBeenCalledWith({ queryKey: adminKeys.settings });
  });

  it("refetches the server snapshot after a successful save", async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const refetch = vi.fn().mockResolvedValue(undefined);

    await expect(saveSystemSettingsDraft({ max_file_size_mb: 20 }, { max_file_size_mb: 40 }, update, refetch)).resolves.toBe(true);
    expect(update).toHaveBeenCalledWith({ max_file_size_mb: 40 });
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("keeps the dirty draft and does not reach refetch when save fails", async () => {
    const saved: SystemSettingsValues = { max_file_size_mb: 20 };
    const draft: SystemSettingsValues = { max_file_size_mb: 40 };
    const update = vi.fn().mockRejectedValue(new Error("Некорректные данные"));
    const refetch = vi.fn();

    await expect(saveSystemSettingsDraft(saved, draft, update, refetch)).rejects.toThrow("Некорректные данные");
    expect(draft).toEqual({ max_file_size_mb: 40 });
    expect(refetch).not.toHaveBeenCalled();
  });

  it("uses loading and error states instead of default settings", () => {
    expect(getSettingsScreenState({ isLoading: true, isError: false })).toBe("loading");
    expect(getSettingsScreenState({ isLoading: false, isError: true })).toBe("error");
    expect(getSettingsScreenState({ isLoading: false, isError: false })).toBe("content");
  });
});

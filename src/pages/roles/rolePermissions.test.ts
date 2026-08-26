import { QueryClient } from "@tanstack/react-query";
import { AxiosHeaders, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminKeys, invalidateRolePermissionQueries } from "@/features/admin/hooks";
import type { AdminRole } from "@/features/admin/types";
import { api } from "@/services/api";
import { adminApi } from "@/services/endpoints/admin.api";
import type { ApiEnvelope } from "@/services/types";
import { saveRolePermissionDraft } from "./rolePermissions";

vi.mock("@/services/api", () => ({
  api: { get: vi.fn(), put: vi.fn() },
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

const savedRoles: AdminRole[] = [
  { id: "admin", code: "admin", name: "Администратор", description: "", permissions: ["documents.view"] },
  { id: "office", code: "office", name: "Канцелярия", description: "", permissions: ["documents.create"] },
];

describe("roles and permissions release 1 integration", () => {
  beforeEach(() => vi.resetAllMocks());

  it("sends the backend permission-code payload to the confirmed PUT endpoint", async () => {
    vi.mocked(api.put).mockResolvedValue(response({ ...savedRoles[0], permissions: ["documents.view", "users.manage"] }));

    await adminApi.setRolePermissions("admin", ["documents.view", "users.manage"]);

    expect(api.put).toHaveBeenCalledWith("/roles/admin/permissions/", {
      permissions: ["documents.view", "users.manage"],
    });
  });

  it("keeps the caller draft intact when save fails", async () => {
    const draft: AdminRole[] = [{ ...savedRoles[0], permissions: ["documents.view", "users.manage"] }, savedRoles[1]];
    const update = vi.fn().mockRejectedValue(new Error("Запрещено"));

    await expect(saveRolePermissionDraft(savedRoles, draft, update)).rejects.toThrow("Запрещено");
    expect(draft).toEqual([{ ...savedRoles[0], permissions: ["documents.view", "users.manage"] }, savedRoles[1]]);
  });

  it("resets the saved role snapshot only from successful server responses", async () => {
    const draft: AdminRole[] = [{ ...savedRoles[0], permissions: ["documents.view", "users.manage"] }, savedRoles[1]];
    const updated = { ...draft[0], permissions: ["documents.view", "users.manage"] };
    const update = vi.fn().mockResolvedValue(updated);

    await expect(saveRolePermissionDraft(savedRoles, draft, update)).resolves.toEqual([updated, savedRoles[1]]);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith("admin", ["documents.view", "users.manage"]);
  });

  it("invalidates roles, permissions, and the authenticated user after a successful save", async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);

    await invalidateRolePermissionQueries(queryClient);

    expect(invalidate).toHaveBeenCalledWith({ queryKey: adminKeys.roles });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: adminKeys.permissions });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["auth", "me"] });
  });
});

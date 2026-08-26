import { describe, expect, it } from "vitest";
import { canAccessRoute } from "@/features/auth/RoleRoute";

describe("RoleRoute", () => {
  it("rejects direct admin routes when the authenticated user lacks their required permission", () => {
    const employeeCan = (permission?: string | string[]) => {
      const required = Array.isArray(permission) ? permission : [permission];
      return required.every((item) => item === "documents.view");
    };

    expect(canAccessRoute(employeeCan, ["users.manage"])).toBe(false);
    expect(canAccessRoute(employeeCan, ["audit.view"])).toBe(false);
    expect(canAccessRoute(employeeCan, ["settings.manage"])).toBe(false);
  });
});

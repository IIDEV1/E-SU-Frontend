import { Navigate } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RoleRoute, canAccessRoute } from "@/features/auth/RoleRoute";

const mockCan = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/AuthContext", () => ({
  useAuth: () => ({ can: mockCan }),
}));

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

  it("redirects an employee from a direct admin URL to the dashboard", () => {
    mockCan.mockReturnValue(false);

    const route = RoleRoute({ permissions: ["settings.manage"] });

    expect(route.type).toBe(Navigate);
    expect(route.props).toMatchObject({ to: "/dashboard", replace: true });
  });
});

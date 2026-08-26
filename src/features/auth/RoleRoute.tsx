import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import type { Permission } from "@/types";

export function canAccessRoute(
  can: (permission?: Permission | Permission[]) => boolean,
  permissions: Permission[],
) {
  return can(permissions);
}

export function RoleRoute({ permissions }: { permissions: Permission[] }) {
  const { can } = useAuth();

  if (!canAccessRoute(can, permissions)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import type { Permission } from "@/types";

export function RoleRoute({ permissions }: { permissions: Permission[] }) {
  const { can } = useAuth();

  if (!can(permissions)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

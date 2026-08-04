import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import type { UserRole } from "@/types";

export function RoleRoute({ roles }: { roles: UserRole[] }) {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { RoleRoute } from "@/features/auth/RoleRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { DocumentCreatePage } from "@/pages/documents/DocumentCreatePage";
import { DocumentDetailPage } from "@/pages/documents/DocumentDetailPage";
import { DocumentEditPage } from "@/pages/documents/DocumentEditPage";
import { DocumentsPage } from "@/pages/documents/DocumentsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { UsersPage } from '../pages/users/UsersPage';
import { UserCreatePage } from '../pages/users/UserCreatePage';
import { UserEditPage } from '../pages/users/UserEditPage';
import { DepartmentsPage } from '../pages/departments/DepartmentsPage';
import CategoriesPage from '../pages/categories/CategoriesPage';
import { RolesPage } from '../pages/roles/RolesPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { AuditPage } from '../pages/audit/AuditPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/my" element={<DocumentsPage scope="my" />} />
          <Route element={<RoleRoute permissions={["documents.approve"]} />}>
            <Route path="/documents/approval" element={<DocumentsPage scope="approval" />} />
          </Route>
          <Route path="/documents/returned" element={<DocumentsPage scope="returned" />} />
          <Route path="/documents/archive" element={<DocumentsPage scope="archive" />} />
          <Route path="/documents/create" element={<DocumentCreatePage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/documents/:id/edit" element={<DocumentEditPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route element={<RoleRoute permissions={["users.manage"]} />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/create" element={<UserCreatePage />} />
            <Route path="/users/:id/edit" element={<UserEditPage />} />
          </Route>
          <Route element={<RoleRoute permissions={["departments.manage"]} />}>
            <Route path="/departments" element={<DepartmentsPage />} />
          </Route>
          <Route element={<RoleRoute permissions={["categories.manage"]} />}>
            <Route path="/categories" element={<CategoriesPage />} />
          </Route>
          <Route element={<RoleRoute permissions={["users.manage"]} />}>
            <Route path="/roles" element={<RolesPage />} />
          </Route>
          <Route element={<RoleRoute permissions={["audit.view"]} />}>
            <Route path="/audit" element={<AuditPage />} />
          </Route>
          <Route element={<RoleRoute permissions={["settings.manage"]} />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

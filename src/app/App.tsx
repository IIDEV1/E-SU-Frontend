import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { RoleRoute } from "@/features/auth/RoleRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { DocumentCreatePage } from "@/pages/documents/DocumentCreatePage";
import { DocumentDetailPage } from "@/pages/documents/DocumentDetailPage";
import { DocumentEditPage } from "@/pages/documents/DocumentEditPage";
import { DocumentsPage } from "@/pages/documents/DocumentsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/my" element={<DocumentsPage scope="my" />} />
          <Route element={<RoleRoute roles={["admin", "rector", "department_head", "approver"]} />}>
            <Route path="/documents/approval" element={<DocumentsPage scope="approval" />} />
          </Route>
          <Route path="/documents/returned" element={<DocumentsPage scope="returned" />} />
          <Route path="/documents/archive" element={<DocumentsPage scope="archive" />} />
          <Route path="/documents/create" element={<DocumentCreatePage />} />
          <Route path="/documents/:id" element={<DocumentDetailPage />} />
          <Route path="/documents/:id/edit" element={<DocumentEditPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

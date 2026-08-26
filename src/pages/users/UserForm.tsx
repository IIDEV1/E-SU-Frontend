import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button, FormField, Input, Select, Toast, UnsavedChangesDialog } from "@/components/ui";
import { useAdminActions, useAdminDepartments, useAdminRoles, useAdminUsers } from "@/features/admin/hooks";
import type { AdminUser } from "@/features/admin/types";
import { useUnsavedChangesGuard } from "@/features/admin/useUnsavedChangesGuard";

const schema = z.object({
  fullName: z.string().min(2, "Укажите ФИО"),
  email: z.string().email("Введите корректный email"),
  phone: z.string().min(5, "Укажите телефон"),
  position: z.string().min(2, "Укажите должность"),
  departmentId: z.string().min(1, "Выберите подразделение"),
  managerId: z.string().optional(),
  roleId: z.string().min(1, "Выберите роль"),
  status: z.enum(["active", "blocked", "pending"]),
});
type UserFormValues = z.infer<typeof schema>;
const statusOptions = [{ value: "active", label: "Активен" }, { value: "blocked", label: "Заблокирован" }, { value: "pending", label: "Ожидает активации" }];

export function UserForm({ user }: { user?: AdminUser }) {
  const createMode = !user;
  const navigate = useNavigate();
  const departments = useAdminDepartments();
  const users = useAdminUsers();
  const roles = useAdminRoles();
  const actions = useAdminActions();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<UserFormValues>({ resolver: zodResolver(schema), defaultValues: { fullName: user?.fullName ?? "", email: user?.email ?? "", phone: user?.phone ?? "", position: user?.position ?? "", departmentId: user?.departmentId ?? "", managerId: user?.managerId ?? "", roleId: user?.roleId ?? "", status: user?.status ?? "active" } });
  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting } } = form;
  const unsavedChangesGuard = useUnsavedChangesGuard(isDirty && !isSubmitting);
  const submit = async (values: UserFormValues) => {
    setError(null);
    const selectedRole = roles.find((role) => role.id === values.roleId);
    const value = { fullName: values.fullName, email: values.email, phone: values.phone, position: values.position, departmentId: values.departmentId, managerId: values.managerId || undefined, role: selectedRole?.code ?? "employee", roleId: values.roleId, status: values.status, lastActive: user?.lastActive ?? "" };
    try {
      if (user) await actions.users.update(user.id, value, user.status);
      else await actions.users.create(value);
      navigate("/users", { state: { toast: createMode ? "Пользователь создан" : "Пользователь сохранён" } });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось сохранить пользователя.");
    }
  };
  return <div className="page-stack users-form-page"><Link className="users-back" to="/users"><ArrowLeft size={16} />К списку пользователей</Link><section className="page-heading"><h1>{createMode ? "Создать пользователя" : "Редактировать пользователя"}</h1><p>{createMode ? "Пароль генерирует сервер; доступы отправляются на email пользователя." : "Изменения профиля сохраняются на сервере."}</p></section><section className="content-card"><form className="users-form" onSubmit={handleSubmit(submit)}><FormField label="ФИО" htmlFor="fullName" error={errors.fullName?.message}><Input id="fullName" aria-label="ФИО" {...register("fullName")} /></FormField><FormField label="Email" htmlFor="email" error={errors.email?.message}><Input id="email" type="email" aria-label="Email" disabled={!createMode} {...register("email")} /></FormField><FormField label="Телефон" htmlFor="phone" error={errors.phone?.message}><Input id="phone" aria-label="Телефон" {...register("phone")} /></FormField><FormField label="Должность" htmlFor="position" error={errors.position?.message}><Input id="position" aria-label="Должность" {...register("position")} /></FormField><FormField label="Подразделение" htmlFor="departmentId" error={errors.departmentId?.message}><Select id="departmentId" aria-label="Подразделение" options={departments.map((department) => ({ value: department.id, label: department.name }))} {...register("departmentId")} /></FormField><FormField label="Руководитель" htmlFor="managerId"><Select id="managerId" aria-label="Руководитель" options={[{ value: "", label: "Не назначен" }, ...users.filter((item) => item.id !== user?.id).map((item) => ({ value: item.id, label: item.fullName }))]} {...register("managerId")} /></FormField><FormField label="Роль" htmlFor="roleId" error={errors.roleId?.message}><Select id="roleId" aria-label="Роль" options={roles.map((role) => ({ value: role.id, label: role.name }))} {...register("roleId")} /></FormField><FormField label="Статус" htmlFor="status" error={errors.status?.message}><Select id="status" aria-label="Статус" options={statusOptions} {...register("status")} /></FormField><div className="form-actions"><Link to="/users"><Button variant="secondary" type="button">Отмена</Button></Link><Button type="submit" disabled={isSubmitting} loading={isSubmitting} icon={<Save size={16} />}>{createMode ? "Создать" : "Сохранить"}</Button></div></form></section>{error && <Toast kind="error" message={error} onClose={() => setError(null)} />}{unsavedChangesGuard.isDialogOpen && <UnsavedChangesDialog isOpen onClose={unsavedChangesGuard.cancelNavigation} onConfirm={unsavedChangesGuard.confirmNavigation} />}</div>;
}

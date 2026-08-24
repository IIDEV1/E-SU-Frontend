import { Ban, Pencil, Plus, RotateCcw, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { Button, DataTable, DepartmentBadge, EmptyState, Input, RoleBadge, Select, StatusBadge, TableToolbar, Toast, UserAvatar, type TableColumn } from "@/components/ui";
import { useAdminActions, useAdminDepartments, useAdminUsers } from "@/features/admin/hooks";
import type { AdminUser, AdminUserStatus } from "@/features/admin/types";

const PAGE_SIZE = 8;
const roleLabels: Record<string, string> = { admin: "Администратор", manager: "Менеджер", office: "Канцелярия", employee: "Сотрудник" };

export function UsersPage() {
  const users = useAdminUsers();
  const departments = useAdminDepartments();
  const actions = useAdminActions();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<AdminUser["role"] | "all">("all");
  const [departmentId, setDepartmentId] = useState("all");
  const [status, setStatus] = useState<AdminUserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>((location.state as { toast?: string } | null)?.toast ?? null);
  const departmentMap = useMemo(() => new Map(departments.map((department) => [department.id, department.name])), [departments]);
  const userMap = useMemo(() => new Map(users.map((user) => [user.id, user.fullName])), [users]);
  const filtered = useMemo(() => users.filter((user) => {
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || [user.fullName, user.email, user.phone, user.position].some((value) => value.toLowerCase().includes(needle));
    return matchesQuery && (role === "all" || user.role === role) && (departmentId === "all" || user.departmentId === departmentId) && (status === "all" || user.status === status);
  }), [departmentId, query, role, status, users]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((Math.min(page, pageCount) - 1) * PAGE_SIZE, Math.min(page, pageCount) * PAGE_SIZE);
  const reset = () => { setQuery(""); setRole("all"); setDepartmentId("all"); setStatus("all"); setPage(1); };
  const changeStatus = (user: AdminUser) => {
    const nextStatus: AdminUserStatus = user.status === "blocked" ? "active" : "blocked";
    actions.users.update(user.id, { status: nextStatus });
    setToast(nextStatus === "active" ? "Пользователь активирован" : "Пользователь заблокирован");
  };
  const columns: TableColumn<AdminUser>[] = [
    { id: "name", header: "ФИО", cell: (user) => <span className="users-name"><UserAvatar name={user.fullName} src={user.avatarUrl} size="sm" />{user.fullName}</span> },
    { id: "email", header: "Email", cell: (user) => user.email }, { id: "phone", header: "Телефон", cell: (user) => user.phone },
    { id: "position", header: "Должность", cell: (user) => user.position }, { id: "department", header: "Подразделение", cell: (user) => <DepartmentBadge department={departmentMap.get(user.departmentId) ?? "Не назначено"} /> },
    { id: "manager", header: "Руководитель", cell: (user) => user.managerId ? userMap.get(user.managerId) ?? "Не назначен" : "Не назначен" },
    { id: "role", header: "Роль", cell: (user) => <RoleBadge role={roleLabels[user.role]} /> }, { id: "status", header: "Статус", cell: (user) => <StatusBadge status={user.status} /> },
    { id: "active", header: "Активность", cell: (user) => user.lastActive },
    { id: "actions", header: "Действия", cell: (user) => <div className="users-actions"><Link to={`/users/${user.id}/edit`} aria-label={`Редактировать ${user.fullName}`}><Button variant="ghost" icon={<Pencil size={15} />}>Изменить</Button></Link><Button variant={user.status === "blocked" ? "secondary" : "danger"} icon={user.status === "blocked" ? <RotateCcw size={15} /> : <Ban size={15} />} onClick={() => changeStatus(user)}>{user.status === "blocked" ? "Активировать" : "Заблокировать"}</Button></div> },
  ];
  return <div className="page-stack users-page"><section className="page-hero"><div><h1>Пользователи</h1><p>Управление учетными записями, ролями и доступом сотрудников.</p></div><Link to="/users/create"><Button icon={<Plus size={18} />}>Создать пользователя</Button></Link></section><section className="content-card"><DataTable columns={columns} rows={visible} toolbar={<TableToolbar><Input aria-label="Поиск пользователей" placeholder="Поиск по ФИО, email, телефону или должности" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /><Select aria-label="Фильтр по роли" value={role} onChange={(event) => { setRole(event.target.value as AdminUser["role"] | "all"); setPage(1); }} options={[{ value: "all", label: "Все роли" }, ...Object.entries(roleLabels).map(([value, label]) => ({ value, label }))]} /><Select aria-label="Фильтр по подразделению" value={departmentId} onChange={(event) => { setDepartmentId(event.target.value); setPage(1); }} options={[{ value: "all", label: "Все подразделения" }, ...departments.map((department) => ({ value: department.id, label: department.name }))]} /><Select aria-label="Фильтр по статусу" value={status} onChange={(event) => { setStatus(event.target.value as AdminUserStatus | "all"); setPage(1); }} options={[{ value: "all", label: "Все статусы" }, { value: "active", label: "Активные" }, { value: "blocked", label: "Заблокированные" }, { value: "pending", label: "Ожидающие" }]} /><Button variant="secondary" icon={<Search size={16} />} onClick={reset}>Сбросить</Button></TableToolbar>} empty={<EmptyState title="Пользователи не найдены" description="Измените параметры поиска или создайте нового пользователя." />} pagination={{ page: Math.min(page, pageCount), pageCount, onPageChange: setPage }} renderMobileCard={(user) => <div className="users-mobile-card"><div className="users-name"><UserAvatar name={user.fullName} src={user.avatarUrl} />{user.fullName}</div><span>{user.email}</span><span>{user.phone}</span><DepartmentBadge department={departmentMap.get(user.departmentId) ?? "Не назначено"} /><RoleBadge role={roleLabels[user.role]} /><StatusBadge status={user.status} /><div className="users-actions"><Link to={`/users/${user.id}/edit`}><Button variant="ghost">Изменить</Button></Link><Button variant={user.status === "blocked" ? "secondary" : "danger"} onClick={() => changeStatus(user)}>{user.status === "blocked" ? "Активировать" : "Заблокировать"}</Button></div></div>} /></section>{toast && <Toast message={toast} kind="success" onClose={() => setToast(null)} />}</div>;
}

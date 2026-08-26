import { RotateCcw, Save, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Checkbox, DataTable, EmptyState, Input, PageError, PageLoader, RoleBadge, TableToolbar, Toast, type TableColumn } from "@/components/ui";
import { adminKeys, useAdminActions, useAdminPermissions, useAdminRolesQuery } from "@/features/admin/hooks";
import type { AdminPermission, AdminPermissionDefinition, AdminRole } from "@/features/admin/types";
import { cloneRoles, rolePermissionsChanged, saveRolePermissionDraft } from "./rolePermissions";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function RolesPage() {
  const rolesQuery = useAdminRolesQuery();
  const permissionsQuery = useAdminPermissions();
  const actions = useAdminActions();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<AdminRole[] | null>(null);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const savedRoles = rolesQuery.data ?? [];
  const displayedRoles = draft ?? savedRoles;
  const dirty = draft !== null && draft.some((role) => rolePermissionsChanged(savedRoles.find((savedRole) => savedRole.id === role.id), role));

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (permissionsQuery.data ?? []).filter((permission) => (
      !normalizedQuery
      || permission.name.toLowerCase().includes(normalizedQuery)
      || permission.code.toLowerCase().includes(normalizedQuery)
      || permission.group.toLowerCase().includes(normalizedQuery)
    ));
  }, [permissionsQuery.data, query]);

  const apply = (roleId: string, permission: AdminPermission, checked: boolean) => {
    setDraft((currentDraft) => (currentDraft ?? cloneRoles(savedRoles)).map((role) => {
      if (role.id !== roleId) {
        return role;
      }

      return {
        ...role,
        permissions: checked
          ? [...new Set([...role.permissions, permission])]
          : role.permissions.filter((item) => item !== permission),
      };
    }));
  };

  const save = async () => {
    setSaving(true);
    setToast(null);

    try {
      const updatedRoles = await saveRolePermissionDraft(
        savedRoles,
        draft ?? savedRoles,
        (roleId, permissions) => actions.roles.update(roleId, { permissions }),
      );
      queryClient.setQueryData(adminKeys.roles, cloneRoles(updatedRoles));
      setDraft(null);
      setToast({ kind: "success", message: "Права ролей сохранены" });
    } catch (error) {
      setToast({ kind: "error", message: getErrorMessage(error, "Не удалось сохранить права ролей.") });
    } finally {
      setSaving(false);
    }
  };

  if (rolesQuery.isLoading || permissionsQuery.isLoading) {
    return <PageLoader label="Загрузка ролей и прав" />;
  }

  if (rolesQuery.isError || permissionsQuery.isError) {
    const error = rolesQuery.isError ? rolesQuery.error : permissionsQuery.error;
    return <PageError description={getErrorMessage(error, "Не удалось загрузить роли и права.")} action={<Button variant="secondary" onClick={() => void Promise.all([rolesQuery.refetch(), permissionsQuery.refetch()])}>Повторить</Button>} />;
  }

  const columns: TableColumn<AdminPermissionDefinition>[] = [
    {
      id: "permission",
      header: "Право",
      cell: (permission) => <span className="roles-permission"><strong>{permission.name}</strong>{permission.description && <small>{permission.description}</small>}</span>,
    },
    ...displayedRoles.map((role) => ({
      id: role.id,
      header: <RoleBadge role={role.name} />,
      cell: (permission: AdminPermissionDefinition) => <Checkbox aria-label={`${role.name}: ${permission.name}`} label="" checked={role.permissions.includes(permission.code)} disabled={saving} onChange={(event) => apply(role.id, permission.code, event.target.checked)} />,
    })),
  ];

  return <div className="page-stack admin-page roles-page"><section className="page-hero"><div><h1>Роли и права</h1><p>Матрица прав применяется только после сохранения.</p></div><div className="roles-header-actions"><Button variant="secondary" icon={<RotateCcw size={16} />} disabled={!dirty || saving} onClick={() => setDraft(null)}>Отменить изменения</Button><Button icon={<Save size={16} />} loading={saving} disabled={!dirty || saving} onClick={() => void save()}>Сохранить</Button></div></section><section className="content-card"><div className="roles-list">{displayedRoles.map((role) => <RoleBadge key={role.id} role={role.name} />)}</div>{dirty && <p className="roles-dirty">Есть несохранённые изменения.</p>}<DataTable columns={columns} rows={rows} toolbar={<TableToolbar><Input aria-label="Поиск права" placeholder="Поиск права" value={query} onChange={(event) => setQuery(event.target.value)} /><Button variant="secondary" icon={<Search size={16} />} onClick={() => setQuery("")}>Сбросить</Button></TableToolbar>} empty={<EmptyState title="Права не найдены" description="Сервер не вернул ни одного права для отображения." />} /></section>{toast && <Toast message={toast.message} kind={toast.kind} onClose={() => setToast(null)} />}</div>;
}

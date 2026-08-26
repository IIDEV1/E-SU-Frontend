import type { AdminPermission, AdminRole } from "@/features/admin/types";

export const cloneRoles = (roles: AdminRole[]) => roles.map((role) => ({ ...role, permissions: [...role.permissions] }));

export function rolePermissionsChanged(savedRole: AdminRole | undefined, draftRole: AdminRole) {
  if (!savedRole || savedRole.permissions.length !== draftRole.permissions.length) {
    return true;
  }

  const savedPermissions = new Set(savedRole.permissions);
  return draftRole.permissions.some((permission) => !savedPermissions.has(permission));
}

export function getChangedRolePermissionDrafts(savedRoles: AdminRole[], draftRoles: AdminRole[]) {
  const savedById = new Map(savedRoles.map((role) => [role.id, role]));
  return draftRoles.filter((role) => rolePermissionsChanged(savedById.get(role.id), role));
}

export async function saveRolePermissionDraft(
  savedRoles: AdminRole[],
  draftRoles: AdminRole[],
  updatePermissions: (roleId: string, permissions: AdminPermission[]) => Promise<AdminRole>,
) {
  const changedRoles = getChangedRolePermissionDrafts(savedRoles, draftRoles);
  const updatedRoles = await Promise.all(changedRoles.map((role) => updatePermissions(role.id, role.permissions)));
  const updatedById = new Map(updatedRoles.map((role) => [role.id, role]));
  return draftRoles.map((role) => updatedById.get(role.id) ?? role);
}

import { useMemo } from "react";
import { adminStore, useAdminStore } from "./store";

export const useAdminUsers = () => useAdminStore((state) => state.users);
export const useAdminDepartments = () => useAdminStore((state) => state.departments);
export const useAdminCategories = () => useAdminStore((state) => state.categories);
export const useAdminRoles = () => useAdminStore((state) => state.roles);
export const useAdminNotifications = () => useAdminStore((state) => state.notifications);
export const useAdminAuditLogs = () => useAdminStore((state) => state.auditLogs);
export const useAdminSettings = () => useAdminStore((state) => state.settings);
export function useAdminActions() { return useMemo(() => adminStore, []); }

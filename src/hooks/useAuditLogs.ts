import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/endpoints/admin.api";

export const auditLogKeys = {
  all: ["auditLogs"] as const,
};

export function useAuditLogs() {
  return useQuery({ queryKey: auditLogKeys.all, queryFn: () => adminApi.getAuditLogs() });
}

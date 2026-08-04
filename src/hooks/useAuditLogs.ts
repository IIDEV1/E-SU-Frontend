import { useQuery } from "@tanstack/react-query";
import { mockAuditLogs } from "@/mocks/data";

export const auditLogKeys = {
  all: ["auditLogs"] as const,
};

export function useAuditLogs() {
  return useQuery({
    queryKey: auditLogKeys.all,
    queryFn: () => Promise.resolve(mockAuditLogs),
  });
}
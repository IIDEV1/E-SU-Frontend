import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/endpoints/admin.api";

export const roleKeys = {
  all: ["roles"] as const,
};

export function useRoles() {
  return useQuery({ queryKey: roleKeys.all, queryFn: adminApi.getRoles });
}

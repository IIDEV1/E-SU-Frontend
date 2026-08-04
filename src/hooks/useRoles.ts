import { useQuery } from "@tanstack/react-query";
import { mockRoles } from "@/mocks/data";

export const roleKeys = {
  all: ["roles"] as const,
};

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.all,
    queryFn: () => Promise.resolve(mockRoles),
  });
}
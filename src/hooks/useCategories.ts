import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/endpoints/admin.api";

export const categoryKeys = {
  all: ["categories"] as const,
};

export function useCategories() {
  return useQuery({ queryKey: categoryKeys.all, queryFn: adminApi.getCategories });
}

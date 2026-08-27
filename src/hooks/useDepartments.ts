import { useQuery } from "@tanstack/react-query";
import { departmentsApi } from "@/services/endpoints/departments.api";

export const departmentKeys = {
  all: ["departments"] as const,
};

export function useDepartments() {
  return useQuery({ queryKey: departmentKeys.all, queryFn: () => departmentsApi.getDepartments() });
}

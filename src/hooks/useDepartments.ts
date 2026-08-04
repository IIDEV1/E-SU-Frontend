import { useQuery } from "@tanstack/react-query";
import { departments } from "@/mocks/data";

export const departmentKeys = {
  all: ["departments"] as const,
};

export function useDepartments() {
  return useQuery({
    queryKey: departmentKeys.all,
    queryFn: () => Promise.resolve(departments),
  });
}
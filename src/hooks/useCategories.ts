import { useQuery } from "@tanstack/react-query";
import { categories } from "@/mocks/data";

export const categoryKeys = {
  all: ["categories"] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => Promise.resolve(categories),
  });
}
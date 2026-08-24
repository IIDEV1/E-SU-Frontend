import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/endpoints/admin.api";

export const settingKeys = {
  all: ["settings"] as const,
};

export function useSettings() {
  return useQuery({ queryKey: settingKeys.all, queryFn: adminApi.getSettings });
}

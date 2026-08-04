import { useQuery } from "@tanstack/react-query";
import { mockSettings } from "@/mocks/data";

export const settingKeys = {
  all: ["settings"] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: settingKeys.all,
    queryFn: () => Promise.resolve(mockSettings),
  });
}
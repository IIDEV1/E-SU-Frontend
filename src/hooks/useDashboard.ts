import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services/endpoints/dashboard.api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: dashboardApi.getDashboard,
  });
}

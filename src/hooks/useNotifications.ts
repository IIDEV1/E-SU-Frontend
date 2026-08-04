import { useQuery } from "@tanstack/react-query";
import { mockNotifications } from "@/mocks/data";

export const notificationKeys = {
  all: ["notifications"] as const,
};

export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => Promise.resolve(mockNotifications),
  });
}
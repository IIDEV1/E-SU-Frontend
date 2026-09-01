import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/services/endpoints/users.api";
import type { User } from "@/types";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

export function useUsers() {
  return useQuery({ queryKey: userKeys.lists(), queryFn: () => usersApi.getUsers() });
}

export function useUser(id: string) {
  return useQuery({ queryKey: userKeys.detail(id), queryFn: () => usersApi.getUser(id), enabled: Boolean(id) });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<User>) => usersApi.createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<User>) => usersApi.updateUser(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
      void queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

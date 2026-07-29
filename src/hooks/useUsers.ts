import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { users } from "@/mocks/data";
import type { User } from "@/types";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => Promise.resolve(users),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => Promise.resolve(users.find((u) => u.id === id) || null),
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<User>) => {
      const newUser = { id: `u-${Date.now()}`, ...payload } as User;
      users.push(newUser);
      return Promise.resolve(newUser);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<User>) => {
      const index = users.findIndex((u) => u.id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...payload };
      }
      return Promise.resolve(users[index]);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
      void queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}
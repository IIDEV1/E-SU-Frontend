import { useSyncExternalStore } from "react";
import type { AdminState } from "./types";

const state: AdminState = {
  users: [],
  departments: [],
  categories: [],
  notifications: [],
};

export const adminStore = {
  getSnapshot: () => state,
  subscribe: () => () => undefined,
  users: { create: () => undefined, update: () => undefined },
  departments: { create: () => undefined, update: () => undefined, remove: () => undefined },
  categories: { create: () => undefined, update: () => undefined, remove: () => undefined },
  notifications: { markRead: () => undefined, markAllRead: () => undefined },
};

export function useAdminStore<T>(selector: (snapshot: AdminState) => T): T {
  return useSyncExternalStore(
    adminStore.subscribe,
    () => selector(adminStore.getSnapshot()),
    () => selector(adminStore.getSnapshot()),
  );
}

export const currentAdminUser = undefined;

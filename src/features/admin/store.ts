import { useSyncExternalStore } from "react";
import type { AdminSettings, AdminState } from "./types";

const emptySettings: AdminSettings = {
  general: { systemName: "E-SU", timezone: "Asia/Bishkek", language: "ru", dateFormat: "DD.MM.YYYY" },
  university: { name: "Salymbekov University", rector: "", address: "", email: "", shortName: "SU", phone: "" },
  numbering: { prefix: "ESU", format: "{prefix}-{department}-{year}-{number}", startNumber: "1", includeYear: true, includeDepartment: true, includeSequence: true },
  fileFormats: { pdf: true, docx: true, xlsx: true, png: true, jpg: true },
  maxFileSizeMb: 25,
  documentStatuses: [],
  emailNotifications: { enabled: true, assigned: true, approved: true, returned: true, deadlineReminder: true },
  allowedExtensions: ["pdf", "docx", "xlsx", "png", "jpg"],
  fileLimits: { maxSizeMb: 25, maxFiles: 10 },
};

const state: AdminState = {
  users: [],
  departments: [],
  categories: [],
  notifications: [],
  auditLogs: [],
  settings: emptySettings,
};

export const adminStore = {
  getSnapshot: () => state,
  subscribe: () => () => undefined,
  users: { create: () => undefined, update: () => undefined },
  departments: { create: () => undefined, update: () => undefined, remove: () => undefined },
  categories: { create: () => undefined, update: () => undefined, remove: () => undefined },
  notifications: { markRead: () => undefined, markAllRead: () => undefined },
  settings: { update: () => undefined },
};

export function useAdminStore<T>(selector: (snapshot: AdminState) => T): T {
  return useSyncExternalStore(
    adminStore.subscribe,
    () => selector(adminStore.getSnapshot()),
    () => selector(adminStore.getSnapshot()),
  );
}

export const currentAdminUser = undefined;

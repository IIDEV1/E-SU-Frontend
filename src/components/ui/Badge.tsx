import type { DocumentPriority, DocumentStatus } from "@/types";
import type { AdminUserStatus } from "@/features/admin/types";
import { priorityLabels, statusLabels } from "@/utils/format";

type ToggleStatus = "active" | "disabled";
const adminStatusLabels: Record<AdminUserStatus | ToggleStatus, string> = { active: "Активен", blocked: "Заблокирован", pending: "Ожидает", disabled: "Отключен" };

export function StatusBadge({ status }: { status: DocumentStatus | AdminUserStatus | ToggleStatus }) {
  const label = status in adminStatusLabels ? adminStatusLabels[status as keyof typeof adminStatusLabels] : statusLabels[status as DocumentStatus];
  return <span className={`badge badge--${status}`}>{label}</span>;
}

export function PriorityBadge({ priority }: { priority: DocumentPriority }) {
  return <span className={`badge badge--priority-${priority}`}>{priorityLabels[priority]}</span>;
}

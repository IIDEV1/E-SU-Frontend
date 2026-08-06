import type { DocumentPriority, DocumentStatus } from "@/types";
import type { AdminUserStatus } from "@/features/admin/types";
import { priorityLabels, statusLabels } from "@/utils/format";

const adminStatusLabels: Record<AdminUserStatus, string> = { active: "Активен", blocked: "Заблокирован", pending: "Ожидает" };

export function StatusBadge({ status }: { status: DocumentStatus | AdminUserStatus }) {
  const label = status in adminStatusLabels ? adminStatusLabels[status as AdminUserStatus] : statusLabels[status as DocumentStatus];
  return <span className={`badge badge--${status}`}>{label}</span>;
}

export function PriorityBadge({ priority }: { priority: DocumentPriority }) {
  return <span className={`badge badge--priority-${priority}`}>{priorityLabels[priority]}</span>;
}

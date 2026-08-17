import type { AdminUserStatus } from "@/features/admin/types";
import type { DocumentPriority, DocumentStatus } from "@/types";
import { priorityLabels, statusLabels } from "@/utils/format";

type ToggleStatus = "active" | "disabled";

const adminStatusLabels: Record<AdminUserStatus | ToggleStatus, string> = {
  active: "Активен",
  blocked: "Заблокирован",
  pending: "Ожидает",
  disabled: "Отключен",
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: DocumentStatus | AdminUserStatus | ToggleStatus;
  className?: string;
}) {
  const label =
    status in adminStatusLabels
      ? adminStatusLabels[status as keyof typeof adminStatusLabels]
      : statusLabels[status as DocumentStatus];

  return <span className={`badge badge--${status} ${className}`}>{label}</span>;
}

export function PriorityBadge({
  priority,
  className = "",
}: {
  priority: DocumentPriority;
  className?: string;
}) {
  return <span className={`badge badge--priority-${priority} ${className}`}>{priorityLabels[priority]}</span>;
}

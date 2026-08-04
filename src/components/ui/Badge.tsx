import type { DocumentPriority, DocumentStatus } from "@/types";
import { priorityLabels, statusLabels } from "@/utils/format";

export function StatusBadge({ status }: { status: DocumentStatus }) {
  return <span className={`badge badge--${status}`}>{statusLabels[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: DocumentPriority }) {
  return <span className={`badge badge--priority-${priority}`}>{priorityLabels[priority]}</span>;
}

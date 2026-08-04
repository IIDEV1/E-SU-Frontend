import type { DocumentPriority, DocumentStatus } from "@/types";

export const statusLabels: Record<DocumentStatus, string> = {
  draft: "Черновик",
  in_review: "На согласовании",
  returned: "Возвращен",
  approved: "Согласован",
  completed: "Исполнен",
  overdue: "Просрочен",
  archived: "Архив",
};

export const priorityLabels: Record<DocumentPriority, string> = {
  low: "Низкий",
  normal: "Обычный",
  high: "Высокий",
  urgent: "Срочный",
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatBytes(value: number) {
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

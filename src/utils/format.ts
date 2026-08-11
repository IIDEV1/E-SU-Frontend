import type { DocumentPriority, DocumentStatus, NotificationType } from "@/types";

export const statusLabels: Record<DocumentStatus, string> = {
  draft: "Черновик",
  in_review: "На согласовании",
  returned: "Возвращен",
  approved: "Согласован",
  completed: "Исполнен",
  overdue: "Просрочен",
  archived: "Архив",
  rejected: "Отклонен",
};

export const priorityLabels: Record<DocumentPriority, string> = {
  low: "Низкий",
  normal: "Обычный",
  high: "Высокий",
  urgent: "Срочный",
};

export const notificationTypeLabels: Record<NotificationType, string> = {
  sent: "Документ отправлен",
  approved: "Документ согласован",
  returned: "Документ возвращен",
  deadline: "Приближается дедлайн",
  overdue: "Документ просрочен",
  assigned: "Назначен ответственный",
  comment: "Добавлен комментарий",
  system: "Системное уведомление",
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatBytes(value: number) {
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

import { AlertTriangle, Bell, Check, CheckCircle2, Clock, ExternalLink, MessageSquare, RotateCcw, Send, UserPlus, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import type { AdminNotification } from "@/features/admin/types";
import { Button } from "./Button";

const notificationMeta: Record<AdminNotification["type"], { label: string; Icon: LucideIcon }> = {
  sent: { label: "Документ отправлен", Icon: Send }, approved: { label: "Документ согласован", Icon: CheckCircle2 }, returned: { label: "Документ возвращён", Icon: RotateCcw }, deadline: { label: "Приближается дедлайн", Icon: Clock }, overdue: { label: "Документ просрочен", Icon: AlertTriangle }, assigned: { label: "Назначен ответственный", Icon: UserPlus }, comment: { label: "Добавлен комментарий", Icon: MessageSquare }, system: { label: "Системное уведомление", Icon: Bell },
};

export interface NotificationItemProps { notification: AdminNotification; onMarkRead?: (notificationId: string) => void; }

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const { label, Icon } = notificationMeta[notification.type];
  return <article className={`notification-item ${notification.isRead ? "is-read" : "is-unread"}`}><div className="notification-item__icon" aria-hidden="true"><Icon size={20} /></div><div className="notification-item__content"><div className="notification-item__heading"><div><span className="notification-item__type">{label}</span><h3>{notification.title}</h3></div><time dateTime={notification.createdAt}>{notification.createdAt}</time></div><p>{notification.message}</p><div className="notification-item__actions">{!notification.isRead && onMarkRead && <Button type="button" variant="secondary" icon={<Check size={16} />} onClick={() => onMarkRead(notification.id)}>Прочитано</Button>}{notification.documentId && <Link className="notification-item__link" to={`/documents/${notification.documentId}`}><ExternalLink size={15} />Открыть документ</Link>}</div></div></article>;
}

import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  RotateCcw,
  Send,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { AdminNotification } from "@/features/admin/types";
import { notificationTypeLabels } from "@/utils/format";
import { Button } from "./Button";

const notificationIcons: Record<AdminNotification["type"], LucideIcon> = {
  document_submitted: Send,
  document_approved: CheckCircle2,
  document_returned: RotateCcw,
  deadline_approaching: Clock,
  document_overdue: AlertTriangle,
  responsible_assigned: UserPlus,
  comment_added: MessageSquare,
  approval_required: Check,
  document_registered: CheckCircle2,
  document_archived: Bell,
  sent: Send,
  approved: CheckCircle2,
  returned: RotateCcw,
  deadline: Clock,
  overdue: AlertTriangle,
  assigned: UserPlus,
  comment: MessageSquare,
  system: Bell,
};

export interface NotificationItemProps {
  notification: AdminNotification;
  onMarkRead?: (notificationId: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type];
  return (
    <article className={`notification-item ${notification.isRead ? "is-read" : "is-unread"}`}>
      <div className="notification-item__icon" aria-hidden="true">
        <Icon size={20} />
      </div>
      <div className="notification-item__content">
        <div className="notification-item__heading">
          <div>
            <span className="notification-item__type">{notificationTypeLabels[notification.type]}</span>
            <h3>{notification.title}</h3>
          </div>
          <time dateTime={notification.createdAt}>{notification.createdAt}</time>
        </div>
        <p>{notification.message}</p>
        <div className="notification-item__actions">
          {!notification.isRead && onMarkRead && (
            <Button type="button" variant="secondary" icon={<Check size={16} />} onClick={() => onMarkRead(notification.id)}>
              Прочитано
            </Button>
          )}
          {notification.documentId && (
            <Link className="notification-item__link" to={`/documents/${notification.documentId}`}>
              <ExternalLink size={15} />
              Открыть документ
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

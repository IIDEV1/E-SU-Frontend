import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ExternalLink } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/useNotifications";
import { formatDate } from "@/utils/format";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { data: notifications = [] } = useNotifications();
  const { data: serverUnreadCount } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = serverUnreadCount ?? notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [isOpen]);

  return (
    <div className="notification-dropdown" ref={wrapperRef}>
      <IconButton aria-label="Уведомления" onClick={() => setIsOpen((value) => !value)}>
        <Bell size={18} />
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </IconButton>
      {isOpen && (
        <div className="notification-menu">
          <header>
            <strong>Уведомления</strong>
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              Все ({notifications.length})
            </Link>
          </header>
          <div className="notification-menu__list">
            {notifications.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--color-fog)", fontSize: "13px" }}>
                Уведомлений нет
              </div>
            ) : (
              notifications.slice(0, 6).map((notification) => (
                <article className={notification.isRead ? "is-read" : "is-unread"} key={notification.id}>
                  <div>
                    <strong>{notification.title}</strong>
                    <span>{notification.createdAt ? formatDate(notification.createdAt) : ""}</span>
                  </div>
                  <p>{notification.message}</p>
                  <div className="notification-menu__actions">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        loading={markRead.isPending}
                        onClick={() => markRead.mutate(notification.id)}
                      >
                        Прочитано
                      </Button>
                    )}
                    {notification.documentId && (
                      <Link to={`/documents/${notification.documentId}`} onClick={() => setIsOpen(false)}>
                        <ExternalLink size={13} />
                        Открыть
                      </Link>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
          <footer>
            <Button
              variant="secondary"
              disabled={unreadCount === 0 || markAllRead.isPending}
              loading={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              Отметить все
            </Button>
          </footer>
        </div>
      )}
    </div>
  );
}

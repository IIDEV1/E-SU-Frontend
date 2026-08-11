import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ExternalLink } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { useAdminActions, useAdminNotifications } from "@/features/admin/hooks";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const notifications = useAdminNotifications();
  const actions = useAdminActions();
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

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
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </IconButton>
      {isOpen && (
        <div className="notification-menu">
          <header>
            <strong>Уведомления</strong>
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              Все
            </Link>
          </header>
          <div className="notification-menu__list">
            {notifications.slice(0, 5).map((notification) => (
              <article className={notification.isRead ? "is-read" : "is-unread"} key={notification.id}>
                <div>
                  <strong>{notification.title}</strong>
                  <span>{notification.createdAt}</span>
                </div>
                <p>{notification.message}</p>
                <div className="notification-menu__actions">
                  {!notification.isRead && (
                    <Button variant="ghost" onClick={() => actions.notifications.markRead(notification.id)}>
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
            ))}
          </div>
          <footer>
            <Button
              variant="secondary"
              disabled={unreadCount === 0}
              onClick={() => actions.notifications.markAllRead()}
            >
              Отметить все
            </Button>
          </footer>
        </div>
      )}
    </div>
  );
}

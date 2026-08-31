import { CheckCheck, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, EmptyState, Input, NotificationItem, PageError, PageLoader, Select, TableToolbar, Toast } from "@/components/ui";
import { useAdminActions, useAdminNotifications } from "@/features/admin/hooks";
import type { AdminNotificationType } from "@/features/admin/types";
import { notificationTypeLabels } from "@/utils/format";

type ReadFilter = "all" | "unread" | "read";

const typeOptions: Array<{ value: AdminNotificationType; label: string }> = Object.entries(notificationTypeLabels).map(
  ([value, label]) => ({ value: value as AdminNotificationType, label }),
);

export function NotificationsPage() {
  const notifications = useAdminNotifications();
  const actions = useAdminActions();
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [typeFilter, setTypeFilter] = useState<AdminNotificationType | "all">("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string>();
  const isLoading = false;
  const error: string | undefined = undefined;

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return notifications.filter((notification) => {
      const matchesRead = readFilter === "all" || (readFilter === "read" ? notification.isRead : !notification.isRead);
      const matchesType = typeFilter === "all" || notification.type === typeFilter;
      const matchesQuery = !query || `${notification.title} ${notification.message}`.toLocaleLowerCase().includes(query);
      return matchesRead && matchesType && matchesQuery;
    });
  }, [notifications, readFilter, search, typeFilter]);

  const resetFilters = () => {
    setReadFilter("all");
    setTypeFilter("all");
    setSearch("");
  };

  const markAllRead = () => {
    actions.notifications.markAllRead();
    setToast("Все уведомления отмечены как прочитанные.");
  };

  if (isLoading) return <PageLoader label="Загрузка уведомлений" />;
  if (error) return <PageError description={error} />;

  return (
    <section className="admin-page notifications-page">
      <div className="admin-page__header">
        <div>
          <h1>Уведомления</h1>
          <p>Все события по документам в текущей сессии.</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          icon={<CheckCheck size={17} />}
          onClick={markAllRead}
          disabled={!notifications.some((item) => !item.isRead)}
        >
          Отметить все прочитанными
        </Button>
      </div>
      <div className="notifications-tabs" role="tablist" aria-label="Статус уведомлений">
        {(["all", "unread", "read"] as ReadFilter[]).map((value) => (
          <Button
            key={value}
            type="button"
            role="tab"
            aria-selected={readFilter === value}
            variant={readFilter === value ? "primary" : "ghost"}
            onClick={() => setReadFilter(value)}
          >
            {value === "all" ? "Все" : value === "unread" ? "Непрочитанные" : "Прочитанные"}
          </Button>
        ))}
      </div>
      <TableToolbar className="notifications-toolbar">
        <Input
          aria-label="Поиск уведомлений"
          placeholder="Поиск по заголовку или тексту"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          aria-label="Фильтр по типу"
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value as AdminNotificationType | "all")}
          options={[{ value: "all", label: "Все типы" }, ...typeOptions]}
        />
        <Button type="button" variant="ghost" icon={<RotateCcw size={16} />} onClick={resetFilters}>
          Сбросить
        </Button>
      </TableToolbar>
      <div className="notifications-summary">
        <Search size={16} aria-hidden="true" />
        Показано: {filteredNotifications.length} из {notifications.length}
      </div>
      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} onMarkRead={actions.notifications.markRead} />
          ))
        ) : (
          <EmptyState
            title="Уведомления не найдены"
            description="Измените поиск или сбросьте фильтры."
            action={
              <Button type="button" variant="secondary" onClick={resetFilters}>
                Сбросить фильтры
              </Button>
            }
          />
        )}
      </div>
      {toast && <Toast kind="success" message={toast} onClose={() => setToast(undefined)} />}
    </section>
  );
}

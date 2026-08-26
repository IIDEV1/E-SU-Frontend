import { CheckCheck, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button, EmptyState, PageError, PageLoader, Select, TableToolbar, Toast } from "@/components/ui";
import { NotificationItem } from "@/components/ui/NotificationItem";
import { useAdminActions, useAdminNotificationsQuery, useAdminUnreadNotificationCount } from "@/features/admin/hooks";
import type { AdminNotificationType } from "@/features/admin/types";

type ReadFilter = "all" | "unread" | "read";
const typeOptions: Array<{ value: AdminNotificationType; label: string }> = [{ value: "document_submitted", label: "Документ отправлен" }, { value: "document_approved", label: "Документ согласован" }, { value: "document_returned", label: "Документ возвращён" }, { value: "deadline_approaching", label: "Приближается дедлайн" }, { value: "document_overdue", label: "Документ просрочен" }, { value: "responsible_assigned", label: "Назначен ответственный" }, { value: "comment_added", label: "Добавлен комментарий" }];

export function NotificationsPage() {
  const [read, setRead] = useState<ReadFilter>("all"); const [type, setType] = useState<AdminNotificationType | "all">("all"); const [toast, setToast] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  const query = useAdminNotificationsQuery({ page_size: 100, is_read: read === "all" ? undefined : read === "read", type: type === "all" ? undefined : type }); const unread = useAdminUnreadNotificationCount(); const actions = useAdminActions();
  const markRead = async (id: string) => { try { await actions.notifications.markRead(id); } catch (reason) { setError(reason instanceof Error ? reason.message : "Не удалось отметить уведомление."); } };
  const markAll = async () => { try { await actions.notifications.markAllRead(); setToast("Все уведомления отмечены как прочитанные."); } catch (reason) { setError(reason instanceof Error ? reason.message : "Не удалось обновить уведомления."); } };
  if (query.isLoading) return <PageLoader label="Загрузка уведомлений" />; if (query.isError) return <PageError description={query.error instanceof Error ? query.error.message : "Не удалось загрузить уведомления."} />;
  const notifications = query.data?.results ?? [];
  return <section className="admin-page notifications-page"><div className="admin-page__header"><div><h1>Уведомления</h1><p>События загружаются с сервера.</p></div><Button variant="secondary" icon={<CheckCheck size={17} />} disabled={(unread.data ?? 0) === 0} onClick={() => void markAll()}>Отметить все прочитанными</Button></div><div className="notifications-tabs" role="tablist">{(["all", "unread", "read"] as ReadFilter[]).map((value) => <Button key={value} role="tab" aria-selected={read === value} variant={read === value ? "primary" : "ghost"} onClick={() => setRead(value)}>{value === "all" ? "Все" : value === "unread" ? "Непрочитанные" : "Прочитанные"}</Button>)}</div><TableToolbar><Select aria-label="Тип" value={type} onChange={(event) => setType(event.target.value as AdminNotificationType | "all")} options={[{ value: "all", label: "Все типы" }, ...typeOptions]} /><Button variant="ghost" icon={<RotateCcw size={16} />} onClick={() => { setRead("all"); setType("all"); }}>Сбросить</Button></TableToolbar><div className="notifications-list">{notifications.length ? notifications.map((item) => <NotificationItem key={item.id} notification={item} onMarkRead={(id) => void markRead(id)} />) : <EmptyState title="Уведомления не найдены" />}</div>{toast && <Toast kind="success" message={toast} onClose={() => setToast(null)} />}{error && <Toast kind="error" message={error} onClose={() => setError(null)} />}</section>;
}

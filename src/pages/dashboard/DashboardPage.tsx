import { ArrowRight, Bell, FilePlus2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { StateBlock } from "@/components/ui/StateBlock";
import { useAuth } from "@/features/auth/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";
import { formatDate, formatDateTime } from "@/utils/format";

const quickActionRoutes: Record<string, string> = {
  create_document: "/documents/create",
  review_documents: "/documents/approval",
  register_documents: "/documents",
};

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isError, isLoading, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="page-stack" aria-busy="true">
        <section className="page-hero skeleton-hero" />
        <section className="metric-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <article className="metric-card ui-skeleton" key={index}>
              <span />
              <span />
            </article>
          ))}
        </section>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="page-stack">
        <StateBlock
          title="Не удалось загрузить Dashboard"
          description="Сводка недоступна. Проверьте подключение и повторите запрос."
          action={<Button onClick={() => void refetch()}>Повторить</Button>}
        />
      </div>
    );
  }

  const metrics = [
    { label: "Все документы", value: data.counters.all, to: "/documents" },
    { label: "Мои документы", value: data.counters.my, to: "/documents/my" },
    { label: "На согласовании", value: data.counters.for_approval, to: "/documents/approval" },
    { label: "Возвращено", value: data.counters.returned, to: "/documents/returned" },
    { label: "Просрочено", value: data.counters.overdue, to: "/documents?scope=overdue" },
    { label: "В архиве", value: data.counters.archived, to: "/documents/archive" },
  ];

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <span className="accent-badge">{formatDate(new Date().toISOString())}</span>
          <h1>Здравствуйте, {user?.name}</h1>
          <p>Актуальная сводка документов, согласований и уведомлений.</p>
        </div>
        {data.quickActions.length > 0 && (
          <div className="quick-actions">
            {data.quickActions.map((action) => (
              <Link key={action.code} to={quickActionRoutes[action.code] ?? action.url}>
                <Button
                  variant={action.code === "create_document" ? "primary" : "secondary"}
                  icon={action.code === "create_document" ? <FilePlus2 size={18} /> : <ArrowRight size={18} />}
                >
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="metric-grid" aria-label="Счётчики документов">
        {metrics.map((metric) => (
          <Link className="metric-card" key={metric.label} to={metric.to}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </Link>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="content-card">
          <h2>На согласовании</h2>
          {data.approvalDocuments.length === 0 ? (
            <StateBlock title="Нет документов" description="Сейчас от вас не ожидается согласование." />
          ) : (
            <div className="document-list compact">
              {data.approvalDocuments.map((document) => (
                <Link to={`/documents/${document.id}`} key={document.id}>
                  <strong>{document.title}</strong>
                  <span>{document.number}</span>
                  <StatusBadge status={document.status} />
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="content-card">
          <h2>Последние документы</h2>
          {data.recentDocuments.length === 0 ? (
            <StateBlock title="Документов нет" description="Доступные вам документы пока отсутствуют." />
          ) : (
            <div className="document-list compact">
              {data.recentDocuments.map((document) => (
                <Link to={`/documents/${document.id}`} key={document.id}>
                  <strong>{document.title}</strong>
                  <span>{formatDate(document.createdAt)}</span>
                  <StatusBadge status={document.status} />
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="content-card">
          <h2>Последние уведомления</h2>
          {data.recentNotifications.length === 0 ? (
            <StateBlock title="Уведомлений нет" description="Новых событий пока нет." />
          ) : (
            <div className="timeline-list">
              {data.recentNotifications.map((notification) => (
                <Link
                  to={notification.documentId ? `/documents/${notification.documentId}` : "/notifications"}
                  key={notification.id}
                >
                  <span><Bell size={15} /> {formatDateTime(notification.createdAt)}</span>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                </Link>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

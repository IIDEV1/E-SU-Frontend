import { Link } from "react-router-dom";
import { Bell, Clock, FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { useAuth } from "@/features/auth/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDate } from "@/utils/format";

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isError, isLoading } = useDocuments();
  const { data: notifications = [] } = useNotifications();
  const documents = data?.data ?? [];
  const metrics = [
    { label: "Всего документов", value: documents.length, to: "/documents" },
    { label: "На согласовании", value: documents.filter((item) => item.status === "in_review").length, to: "/documents/approval" },
    { label: "Возвращено", value: documents.filter((item) => item.status === "returned").length, to: "/documents/returned" },
    { label: "Просрочено", value: documents.filter((item) => item.status === "overdue").length, to: "/documents" },
    { label: "Исполнено", value: documents.filter((item) => item.status === "completed").length, to: "/documents" },
  ];

  if (isLoading) {
    return (
      <div className="page-stack">
        <section className="page-hero skeleton-hero" />
        <section className="metric-grid">
          {Array.from({ length: 5 }, (_, index) => (
            <article className="metric-card ui-skeleton" key={index}>
              <span />
              <span />
            </article>
          ))}
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-stack">
        <section className="content-card">
          <h1>Не удалось загрузить Dashboard</h1>
          <p>Попробуйте обновить страницу.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <span className="accent-badge">{formatDate(new Date().toISOString())}</span>
          <h1>Здравствуйте, {user?.name}</h1>
          <p>
            Документы, согласования и дедлайны Salymbekov University в одном рабочем контуре.
          </p>
        </div>
        <div className="quick-actions">
          <Link to="/documents/create">
            <Button icon={<FilePlus2 size={18} />}>Создать документ</Button>
          </Link>
          <Link to="/notifications">
            <Button variant="secondary" icon={<Bell size={18} />}>Уведомления</Button>
          </Link>
        </div>
      </section>

      <section className="metric-grid">
        {metrics.map((metric) => (
          <Link className="metric-card" key={metric.label} to={metric.to}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </Link>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="content-card">
          <h2>Требуют внимания</h2>
          <div className="document-list compact">
            {documents
              .filter((item) => ["overdue", "returned", "in_review"].includes(item.status))
              .slice(0, 6)
              .map((document) => (
                <Link to={`/documents/${document.id}`} key={document.id}>
                  <strong>{document.title}</strong>
                  <span>{document.number}</span>
                  <StatusBadge status={document.status} />
                </Link>
              ))}
          </div>
        </article>
        <article className="content-card">
          <h2>Последние документы</h2>
          <div className="document-list compact">
            {documents.slice(0, 6).map((document) => (
              <Link to={`/documents/${document.id}`} key={document.id}>
                <strong>{document.title}</strong>
                <span>{formatDate(document.createdAt)}</span>
                <StatusBadge status={document.status} />
              </Link>
            ))}
          </div>
        </article>
        <article className="content-card">
          <h2>Ближайшие дедлайны</h2>
          <div className="timeline-list">
            {documents
              .filter((document) => !["archived", "completed"].includes(document.status))
              .slice(0, 5)
              .map((document) => (
                <Link to={`/documents/${document.id}`} key={document.id}>
                  <span><Clock size={15} /> {formatDate(document.deadline)}</span>
                  <strong>{document.title}</strong>
                </Link>
              ))}
          </div>
        </article>
        <article className="content-card">
          <h2>Последние уведомления</h2>
          <div className="timeline-list">
            {notifications.slice(0, 5).map((notification) => (
              <Link to={notification.documentId ? `/documents/${notification.documentId}` : "/notifications"} key={notification.id}>
                <span>{notification.createdAt}</span>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

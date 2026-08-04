import { Link } from "react-router-dom";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { useAuth } from "@/features/auth/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";
import { documents } from "@/mocks/data";
import { formatDate } from "@/utils/format";

export function DashboardPage() {
  const { user } = useAuth();
  const { data } = useDocuments();
  const source = data?.data ?? documents;
  const metrics = [
    { label: "Всего документов", value: documents.length },
    {
      label: "На согласовании",
      value: documents.filter((item) => item.status === "in_review").length,
    },
    { label: "Возвращено", value: documents.filter((item) => item.status === "returned").length },
    { label: "Просрочено", value: documents.filter((item) => item.status === "overdue").length },
    { label: "Исполнено", value: documents.filter((item) => item.status === "completed").length },
  ];

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <span className="accent-badge">{formatDate(new Date().toISOString())}</span>
          <h1>Здравствуйте, {user?.name}</h1>
          <p>Документы, согласования и дедлайны Salymbekov University в одном рабочем контуре.</p>
        </div>
        <Link to="/documents/create">
          <Button icon={<FilePlus2 size={18} />}>Создать документ</Button>
        </Link>
      </section>

      <section className="metric-grid">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="content-card">
          <h2>Требуют внимания</h2>
          <div className="document-list compact">
            {documents
              .filter((item) => ["overdue", "returned", "in_review"].includes(item.status))
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
            {source.slice(0, 4).map((document) => (
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
            {documents.slice(0, 4).map((document) => (
              <div key={document.id}>
                <span>{formatDate(document.deadline)}</span>
                <strong>{document.title}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="content-card dark-card">
          <h2>Последние действия</h2>
          {documents[0].history.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </article>
      </section>
    </div>
  );
}

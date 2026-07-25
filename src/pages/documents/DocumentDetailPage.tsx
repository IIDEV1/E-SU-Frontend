import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Archive, CheckCircle2, Download, Pencil, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { StateBlock } from "@/components/ui/StateBlock";
import { useArchiveDocument, useDocument } from "@/hooks/useDocuments";
import { formatBytes, formatDate } from "@/utils/format";

type Tab = "info" | "files" | "approval" | "comments" | "history";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "info", label: "Информация" },
  { id: "files", label: "Файлы" },
  { id: "approval", label: "Согласование" },
  { id: "comments", label: "Комментарии" },
  { id: "history", label: "История" },
];

export function DocumentDetailPage() {
  const { id = "" } = useParams();
  const { data: document, isError, isLoading } = useDocument(id);
  const archiveDocument = useArchiveDocument();
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnComment, setReturnComment] = useState("");

  if (isLoading) {
    return (
      <StateBlock
        title="Загружаем документ"
        description="Получаем карточку и историю согласований."
      />
    );
  }

  if (isError || !document) {
    return (
      <StateBlock
        title="Документ не найден"
        description="Проверьте ссылку или вернитесь к списку документов."
      />
    );
  }

  return (
    <div className="page-stack">
      <section className="document-header">
        <div>
          <span className="accent-badge">{document.number}</span>
          <h1>{document.title}</h1>
          <div className="document-meta">
            <StatusBadge status={document.status} />
            <PriorityBadge priority={document.priority} />
            <span>{document.category.name}</span>
          </div>
        </div>
        <div className="document-actions">
          <Link to={`/documents/${document.id}/edit`}>
            <Button variant="secondary" icon={<Pencil size={18} />}>
              Редактировать
            </Button>
          </Link>
          <Button variant="secondary" type="button" icon={<CheckCircle2 size={18} />}>
            Согласовать
          </Button>
          <Button
            variant="ghost"
            type="button"
            icon={<RotateCcw size={18} />}
            onClick={() => setIsReturnOpen(true)}
          >
            Вернуть
          </Button>
          <Button variant="ghost" type="button" icon={<Download size={18} />}>
            Скачать
          </Button>
          <Button
            variant="ghost"
            type="button"
            icon={<Archive size={18} />}
            onClick={() => archiveDocument.mutate(document.id)}
          >
            Архивировать
          </Button>
        </div>
      </section>

      <section className="summary-grid">
        {[
          ["Автор", document.author.name],
          ["Подразделение", document.department.name],
          ["Ответственный", document.responsible.name],
          ["Дата создания", formatDate(document.createdAt)],
          ["Дедлайн", formatDate(document.deadline)],
        ].map(([label, value]) => (
          <article key={label} className="summary-card">
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="content-card">
        <div className="tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              className={activeTab === tab.id ? "is-active" : ""}
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "info" && (
          <div className="tab-panel">
            <h2>Описание</h2>
            <p>{document.description}</p>
            {document.returnReason && (
              <div className="form-warning">Причина возврата: {document.returnReason}</div>
            )}
          </div>
        )}
        {activeTab === "files" && (
          <div className="tab-panel file-list">
            {document.files.length ? (
              document.files.map((file) => (
                <div key={file.id}>
                  <strong>{file.name}</strong>
                  <span>
                    {formatBytes(file.size)} · {file.type}
                  </span>
                </div>
              ))
            ) : (
              <StateBlock
                title="Файлов нет"
                description="К документу пока не добавлены вложения."
              />
            )}
          </div>
        )}
        {activeTab === "approval" && (
          <div className="tab-panel timeline-list">
            {document.approvalSteps.map((step) => (
              <div key={step.id}>
                <span>{step.status}</span>
                <strong>{step.approver.name}</strong>
                {step.comment && <p>{step.comment}</p>}
              </div>
            ))}
          </div>
        )}
        {activeTab === "comments" && (
          <div className="tab-panel timeline-list">
            {document.comments.length ? (
              document.comments.map((comment) => (
                <div key={comment.id}>
                  <span>{formatDate(comment.createdAt)}</span>
                  <strong>{comment.author.name}</strong>
                  <p>{comment.text}</p>
                </div>
              ))
            ) : (
              <StateBlock
                title="Комментариев нет"
                description="Обсуждение по документу еще не началось."
              />
            )}
          </div>
        )}
        {activeTab === "history" && (
          <div className="tab-panel timeline-list">
            {document.history.map((item) => (
              <div key={item}>
                <span>Событие</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      {isReturnOpen && (
        <div className="modal-backdrop">
          <form
            className="modal"
            onSubmit={(event) => {
              event.preventDefault();
              if (returnComment.trim().length >= 3) {
                setIsReturnOpen(false);
              }
            }}
          >
            <h2>Вернуть документ</h2>
            <p>Комментарий обязателен, чтобы автор понял, что нужно исправить.</p>
            <textarea
              value={returnComment}
              onChange={(event) => setReturnComment(event.target.value)}
              rows={5}
            />
            {returnComment.trim().length > 0 && returnComment.trim().length < 3 && (
              <small>Минимум 3 символа</small>
            )}
            <div className="form-actions">
              <Button type="submit" disabled={returnComment.trim().length < 3}>
                Вернуть
              </Button>
              <Button variant="ghost" type="button" onClick={() => setIsReturnOpen(false)}>
                Отмена
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

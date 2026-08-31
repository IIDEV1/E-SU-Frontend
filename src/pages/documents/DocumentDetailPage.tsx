import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Archive, CheckCircle2, Download, MessageSquarePlus, Pencil, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog, Toast } from "@/components/ui";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { StateBlock } from "@/components/ui/StateBlock";
import { useAdminNotifications } from "@/features/admin/hooks";
import {
  useAddDocumentComment,
  useApproveDocument,
  useArchiveDocument,
  useDocument,
  useReturnDocument,
  useSubmitDocument,
} from "@/hooks/useDocuments";
import { formatBytes, formatDate } from "@/utils/format";

type Tab = "info" | "files" | "approval" | "comments" | "history" | "notifications";
type PendingAction = "submit" | "approve" | "archive" | null;

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "info", label: "Информация" },
  { id: "files", label: "Файлы" },
  { id: "approval", label: "Согласование" },
  { id: "comments", label: "Комментарии" },
  { id: "history", label: "История" },
  { id: "notifications", label: "Уведомления" },
];

export function DocumentDetailPage() {
  const { id = "" } = useParams();
  const { data: document, isError, isLoading } = useDocument(id);
  const notifications = useAdminNotifications();
  const submitDocument = useSubmitDocument(id);
  const approveDocument = useApproveDocument(id);
  const returnDocument = useReturnDocument(id);
  const archiveDocument = useArchiveDocument();
  const addComment = useAddDocumentComment(id);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnComment, setReturnComment] = useState("");
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState<string>();

  const relatedNotifications = useMemo(
    () => notifications.filter((notification) => notification.documentId === id),
    [id, notifications],
  );

  if (isLoading) {
    return <StateBlock title="Загружаем документ" description="Получаем карточку, файлы и историю согласований." />;
  }

  if (isError || !document) {
    return <StateBlock title="Документ не найден" description="Проверьте ссылку или вернитесь к списку документов." />;
  }

  const canEdit = ["draft", "returned"].includes(document.status);
  const canSubmit = ["draft", "returned"].includes(document.status);
  const canApprove = document.status === "in_review";
  const canReturn = document.status === "in_review";
  const canArchive = !["archived", "draft"].includes(document.status);

  const runAction = async () => {
    if (pendingAction === "submit") {
      await submitDocument.mutateAsync();
      setToast("Документ отправлен на согласование.");
    }
    if (pendingAction === "approve") {
      await approveDocument.mutateAsync();
      setToast("Документ согласован.");
    }
    if (pendingAction === "archive") {
      await archiveDocument.mutateAsync(document.id);
      setToast("Документ архивирован.");
    }
    setPendingAction(null);
  };

  const addNewComment = async () => {
    if (commentText.trim().length < 2) return;
    await addComment.mutateAsync(commentText.trim());
    setCommentText("");
    setActiveTab("comments");
    setToast("Комментарий добавлен.");
  };

  const returnCurrentDocument = async () => {
    if (returnComment.trim().length < 3) return;
    await returnDocument.mutateAsync(returnComment.trim());
    setReturnComment("");
    setIsReturnOpen(false);
    setToast("Документ возвращен на доработку.");
  };

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
            <span>{document.currentStage}</span>
          </div>
        </div>
        <div className="document-actions">
          {canEdit && (
            <Link to={`/documents/${document.id}/edit`}>
              <Button variant="secondary" icon={<Pencil size={18} />}>Редактировать</Button>
            </Link>
          )}
          {canSubmit && <Button variant="secondary" icon={<Send size={18} />} onClick={() => setPendingAction("submit")}>Отправить</Button>}
          {canApprove && <Button variant="secondary" icon={<CheckCircle2 size={18} />} onClick={() => setPendingAction("approve")}>Согласовать</Button>}
          {canReturn && <Button variant="ghost" icon={<RotateCcw size={18} />} onClick={() => setIsReturnOpen(true)}>Вернуть</Button>}
          <Button variant="ghost" icon={<Download size={18} />} onClick={() => setToast("Файл подготовлен к скачиванию в mock-режиме.")}>Скачать</Button>
          {canArchive && <Button variant="ghost" icon={<Archive size={18} />} onClick={() => setPendingAction("archive")}>Архивировать</Button>}
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
            <button className={activeTab === tab.id ? "is-active" : ""} key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "info" && (
          <div className="tab-panel">
            <h2>Описание</h2>
            <p>{document.description}</p>
            {document.returnReason && <div className="form-warning">Причина возврата: {document.returnReason}</div>}
          </div>
        )}
        {activeTab === "files" && (
          <div className="tab-panel file-list">
            {document.files.length ? (
              document.files.map((file) => (
                <div key={file.id}>
                  <strong>{file.name}</strong>
                  <span>{formatBytes(file.size)} · {file.type}</span>
                </div>
              ))
            ) : (
              <StateBlock title="Файлов нет" description="К документу пока не добавлены вложения." />
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
          <div className="tab-panel">
            <div className="comment-composer">
              <textarea rows={3} placeholder="Добавить комментарий" value={commentText} onChange={(event) => setCommentText(event.target.value)} />
              <Button icon={<MessageSquarePlus size={17} />} loading={addComment.isPending} disabled={commentText.trim().length < 2} onClick={addNewComment}>
                Добавить
              </Button>
            </div>
            <div className="timeline-list">
              {document.comments.length ? (
                document.comments.map((comment) => (
                  <div key={comment.id}>
                    <span>{formatDate(comment.createdAt)}</span>
                    <strong>{comment.author.name}</strong>
                    <p>{comment.text}</p>
                  </div>
                ))
              ) : (
                <StateBlock title="Комментариев нет" description="Обсуждение по документу еще не началось." />
              )}
            </div>
          </div>
        )}
        {activeTab === "history" && (
          <div className="tab-panel timeline-list">
            {document.history.map((item, index) => (
              <div key={`${item}-${index}`}>
                <span>Событие</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        )}
        {activeTab === "notifications" && (
          <div className="tab-panel timeline-list">
            {relatedNotifications.length ? (
              relatedNotifications.map((notification) => (
                <Link to="/notifications" key={notification.id}>
                  <span>{notification.createdAt}</span>
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                </Link>
              ))
            ) : (
              <StateBlock title="Уведомлений нет" description="По этому документу пока нет связанных уведомлений." />
            )}
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={() => void runAction()}
        title="Подтвердите действие"
        description="Действие изменит состояние документа в mock-сессии."
        confirmLabel="Подтвердить"
      />

      {isReturnOpen && (
        <div className="modal-backdrop">
          <form
            className="modal"
            onSubmit={(event) => {
              event.preventDefault();
              void returnCurrentDocument();
            }}
          >
            <h2>Вернуть документ</h2>
            <p>Комментарий обязателен, чтобы автор понял, что нужно исправить.</p>
            <textarea value={returnComment} onChange={(event) => setReturnComment(event.target.value)} rows={5} />
            {returnComment.trim().length > 0 && returnComment.trim().length < 3 && <small>Минимум 3 символа</small>}
            <div className="form-actions">
              <Button type="submit" loading={returnDocument.isPending} disabled={returnComment.trim().length < 3}>Вернуть</Button>
              <Button variant="ghost" onClick={() => setIsReturnOpen(false)}>Отмена</Button>
            </div>
          </form>
        </div>
      )}
      {toast && <Toast kind="success" message={toast} onClose={() => setToast(undefined)} />}
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Archive, CheckCircle2, ClipboardCheck, FileCheck2, MessageSquarePlus, Pencil, RotateCcw, Send, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog, Toast } from "@/components/ui";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { StateBlock } from "@/components/ui/StateBlock";
import { useAuth } from "@/features/auth/AuthContext";
import {
  useAddDocumentComment,
  useApproveDocument,
  useArchiveDocument,
  useCompleteDocument,
  useDocument,
  useDocumentApprovalRoute,
  useRegisterDocument,
  useReturnDocument,
  useRestoreDocument,
  useSubmitDocument,
} from "@/hooks/useDocuments";
import { useNotifications } from "@/hooks/useNotifications";
import { formatBytes, formatDate } from "@/utils/format";
import type { DocumentStatus, Permission } from "@/types";

type Tab = "info" | "files" | "approval" | "comments" | "history" | "notifications";
type PendingAction = "submit" | "approve" | "register" | "complete" | "archive" | "restore" | null;
type PermissionCheck = (permission?: Permission | Permission[]) => boolean;

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "info", label: "Информация" },
  { id: "files", label: "Файлы" },
  { id: "approval", label: "Согласование" },
  { id: "comments", label: "Комментарии" },
  { id: "history", label: "История" },
  { id: "notifications", label: "Уведомления" },
];

export function getDocumentWorkflowAvailability(status: DocumentStatus, can: PermissionCheck) {
  const isEditable = status === "draft" || status === "returned";

  return {
    canEdit: isEditable && can("documents.create"),
    canSubmit: isEditable && can("documents.create"),
    canApprove: status === "in_review" && can("documents.approve"),
    canReturn: status === "in_review" && can("documents.return"),
    canRegister: status === "approved" && can("documents.register"),
    canComplete: status === "approved" && (can("documents.edit") || can("documents.create")),
    canArchive: status === "completed" && can("documents.archive"),
    canRestore: status === "archived" && can("documents.archive"),
  };
}

function getApiErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Не удалось выполнить действие. Попробуйте ещё раз.";
}

function isNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    error.status === 404
  );
}

export function isValidReturnComment(value: string) {
  return value.trim().length >= 3;
}

export function DocumentDetailPage() {
  const { id = "" } = useParams();
  const { data: document, isError, isLoading } = useDocument(id);
  const { can } = useAuth();
  const { data: notifications = [] } = useNotifications();
  const approvalRoute = useDocumentApprovalRoute(id);
  const submitDocument = useSubmitDocument(id);
  const approveDocument = useApproveDocument(id);
  const returnDocument = useReturnDocument(id);
  const archiveDocument = useArchiveDocument();
  const registerDocument = useRegisterDocument(id);
  const completeDocument = useCompleteDocument(id);
  const restoreDocument = useRestoreDocument(id);
  const addComment = useAddDocumentComment(id);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnComment, setReturnComment] = useState("");
  const [commentText, setCommentText] = useState("");
  const [toast, setToast] = useState<string>();
  const [actionError, setActionError] = useState<string>();

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

  const {
    canEdit,
    canSubmit,
    canApprove,
    canReturn,
    canRegister,
    canComplete,
    canArchive,
    canRestore,
  } = getDocumentWorkflowAvailability(document.status, can);

  const runAction = async () => {
    if (!pendingAction) return;

    try {
      setActionError(undefined);
      if (pendingAction === "submit") {
        await submitDocument.mutateAsync([]);
        setToast("Документ отправлен на согласование.");
      }
      if (pendingAction === "approve") {
        await approveDocument.mutateAsync();
        setToast("Документ согласован.");
      }
      if (pendingAction === "register") {
        await registerDocument.mutateAsync();
        setToast("Документ зарегистрирован.");
      }
      if (pendingAction === "complete") {
        await completeDocument.mutateAsync();
        setToast("Документ завершён.");
      }
      if (pendingAction === "archive") {
        await archiveDocument.mutateAsync(document.id);
        setToast("Документ архивирован.");
      }
      if (pendingAction === "restore") {
        await restoreDocument.mutateAsync();
        setToast("Документ восстановлен.");
      }
      setPendingAction(null);
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  };

  const addNewComment = async () => {
    if (commentText.trim().length < 2) return;
    await addComment.mutateAsync(commentText.trim());
    setCommentText("");
    setActiveTab("comments");
    setToast("Комментарий добавлен.");
  };

  const returnCurrentDocument = async () => {
    if (!isValidReturnComment(returnComment)) return;
    try {
      setActionError(undefined);
      await returnDocument.mutateAsync(returnComment.trim());
      setReturnComment("");
      setIsReturnOpen(false);
      setToast("Документ возвращен на доработку.");
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
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
          {canRegister && <Button variant="secondary" icon={<ClipboardCheck size={18} />} onClick={() => setPendingAction("register")}>Зарегистрировать</Button>}
          {canComplete && <Button variant="secondary" icon={<FileCheck2 size={18} />} onClick={() => setPendingAction("complete")}>Завершить</Button>}
          {canArchive && <Button variant="ghost" icon={<Archive size={18} />} onClick={() => setPendingAction("archive")}>Архивировать</Button>}
          {canRestore && <Button variant="ghost" icon={<Undo2 size={18} />} onClick={() => setPendingAction("restore")}>Восстановить</Button>}
        </div>
      </section>

      {actionError && <div className="form-error" role="alert">{actionError}</div>}

      <section className="summary-grid">
        {[
          ["Автор", document.author.name],
          ["Подразделение", document.department.name],
          ["Ответственный", document.responsible?.name ?? "Не назначен"],
          ["Дата создания", formatDate(document.createdAt)],
          ["Дедлайн", formatDate(document.deadline ?? undefined)],
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
            {approvalRoute.isLoading && (
              <StateBlock title="Загружаем маршрут" description="Получаем актуальные шаги согласования." />
            )}
            {approvalRoute.isError && (
              <StateBlock
                title={isNotFoundError(approvalRoute.error) ? "Маршрут ещё не создан" : "Не удалось загрузить маршрут"}
                description={isNotFoundError(approvalRoute.error) ? "Документ пока не отправлен на согласование." : getApiErrorMessage(approvalRoute.error)}
              />
            )}
            {approvalRoute.data && approvalRoute.data.steps.length === 0 && (
              <StateBlock title="Шагов нет" description="Backend вернул маршрут без шагов согласования." />
            )}
            {approvalRoute.data?.steps.map((step) => (
              <div key={step.id}>
                <span>Шаг {step.order} · {step.status}</span>
                <strong>{step.approver.full_name}</strong>
                {step.approver.position && <p>{step.approver.position}</p>}
                {step.comment && <p>{step.comment}</p>}
                {step.acted_at && <p>{formatDate(step.acted_at)}</p>}
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
        description="Состояние документа будет изменено на сервере."
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
            {returnComment.trim().length > 0 && !isValidReturnComment(returnComment) && <small>Минимум 3 символа</small>}
            {actionError && <div className="form-error" role="alert">{actionError}</div>}
            <div className="form-actions">
              <Button type="submit" loading={returnDocument.isPending} disabled={!isValidReturnComment(returnComment)}>Вернуть</Button>
              <Button variant="ghost" onClick={() => setIsReturnOpen(false)}>Отмена</Button>
            </div>
          </form>
        </div>
      )}
      {toast && <Toast kind="success" message={toast} onClose={() => setToast(undefined)} />}
    </div>
  );
}

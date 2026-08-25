import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { FilePlus2, Save, Send, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui";
import { useCategories } from "@/hooks/useCategories";
import { useCreateDocument, useUpdateDocument } from "@/hooks/useDocuments";
import { useDepartments } from "@/hooks/useDepartments";
import { useUsers } from "@/hooks/useUsers";
import type { Document, DocumentFile, DocumentStatus } from "@/types";

const schema = z.object({
  title: z.string().min(3, "Укажите название документа"),
  categoryId: z.string().min(1, "Выберите категорию"),
  type: z.string().min(2, "Укажите тип"),
  description: z.string().min(10, "Опишите документ подробнее"),
  departmentId: z.string().min(1, "Выберите подразделение"),
  responsibleId: z.string().min(1, "Выберите ответственного"),
  deadline: z.string().min(1, "Укажите дедлайн"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  comment: z.string().optional(),
  approverIds: z.array(z.string()).min(1, "Выберите хотя бы одного согласующего"),
});

type DocumentFormValues = z.infer<typeof schema>;

interface DocumentFormProps {
  document?: Document;
  mode: "create" | "edit";
}

const allowedFileExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg"];
const maxFileSize = 25 * 1024 * 1024;

function toDocumentFile(file: File): DocumentFile {
  return {
    id: `file-${crypto.randomUUID()}`,
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    url: "#",
    uploadedAt: new Date().toISOString(),
    sourceFile: file,
  };
}

function validateFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!allowedFileExtensions.includes(extension)) {
    throw new Error(`Формат .${extension || "unknown"} не поддерживается.`);
  }
  if (file.size > maxFileSize) {
    throw new Error(`Файл ${file.name} больше 25 MB.`);
  }
}

export function DocumentForm({ document, mode }: DocumentFormProps) {
  const navigate = useNavigate();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument(document?.id ?? "");
  const { data: categories = [] } = useCategories();
  const { data: departments = [] } = useDepartments();
  const { data: users = [] } = useUsers();
  const [files, setFiles] = useState<DocumentFile[]>(document?.files ?? []);
  const [fileError, setFileError] = useState("");
  const [toast, setToast] = useState<string>();
  const isLocked = document ? ["completed", "archived"].includes(document.status) : false;

  const defaultApprovers = useMemo(
    () => document?.approvalSteps.map((step) => step.approver.id) ?? users.slice(0, 2).map((user) => user.id),
    [document, users],
  );

  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: document?.title ?? "",
      categoryId: document?.category.id ?? categories[0]?.id ?? "",
      type: document?.type ?? "document",
      description: document?.description ?? "",
      departmentId: document?.department.id ?? departments[0]?.id ?? "",
      responsibleId: document?.responsible.id ?? users[0]?.id ?? "",
      deadline: document?.deadline ?? "",
      priority: document?.priority ?? "normal",
      comment: "",
      approverIds: defaultApprovers,
    },
  });

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setFileError("");
    try {
      const nextFiles = Array.from(fileList);
      nextFiles.forEach(validateFile);
      setFiles((current) => [...current, ...nextFiles.map(toDocumentFile)]);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Не удалось добавить файл.");
    }
  };

  const removeFile = (fileId: string) => setFiles((current) => current.filter((file) => file.id !== fileId));

  const save = (status: Extract<DocumentStatus, "draft" | "in_review">) =>
    handleSubmit(async (values) => {
      if (mode === "create") {
        const createdDocument = await createDocument.mutateAsync({ ...values, files, status });
        setToast(status === "draft" ? "Черновик сохранен." : "Документ отправлен на согласование.");
        setTimeout(() => navigate(`/documents/${createdDocument.id}`), 350);
        return;
      }

      if (!document) return;
      const updatedDocument = await updateDocument.mutateAsync({ ...values, files });
      setToast("Изменения сохранены.");
      setTimeout(() => navigate(`/documents/${updatedDocument.id}`), 350);
    })();

  if (isLocked) {
    return (
      <div className="content-card">
        <h2>Редактирование недоступно</h2>
        <p>Завершенные и архивные документы нельзя изменять.</p>
      </div>
    );
  }

  return (
    <form className="content-card document-form" onSubmit={(event) => event.preventDefault()}>
      {document?.returnReason && <div className="form-warning">Причина возврата: {document.returnReason}</div>}
      <div className="form-grid">
        <label>
          Название
          <input {...register("title")} />
          {errors.title && <small>{errors.title.message}</small>}
        </label>
        <label>
          Категория
          <select {...register("categoryId")}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <small>{errors.categoryId.message}</small>}
        </label>
        <label>
          Тип
          <input {...register("type")} />
          {errors.type && <small>{errors.type.message}</small>}
        </label>
        <label>
          Подразделение
          <select {...register("departmentId")}>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          {errors.departmentId && <small>{errors.departmentId.message}</small>}
        </label>
        <label>
          Ответственный
          <select {...register("responsibleId")}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          {errors.responsibleId && <small>{errors.responsibleId.message}</small>}
        </label>
        <label>
          Дедлайн
          <input type="date" {...register("deadline")} />
          {errors.deadline && <small>{errors.deadline.message}</small>}
        </label>
        <label>
          Приоритет
          <select {...register("priority")}>
            <option value="low">Низкий</option>
            <option value="normal">Обычный</option>
            <option value="high">Высокий</option>
            <option value="urgent">Срочный</option>
          </select>
        </label>
        <label>
          Согласующие
          <select multiple {...register("approverIds")}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          {errors.approverIds && <small>{errors.approverIds.message}</small>}
        </label>
      </div>
      <label>
        Описание
        <textarea rows={5} {...register("description")} />
        {errors.description && <small>{errors.description.message}</small>}
      </label>
      <label className="dropzone document-uploader">
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          onChange={(event) => addFiles(event.target.files)}
        />
        <FilePlus2 size={22} />
        <strong>Файлы документа</strong>
        <span>Перетащите файлы или выберите вручную. PDF, DOCX, XLSX, PNG/JPG до 25 MB.</span>
      </label>
      {fileError && <div className="form-error">{fileError}</div>}
      <div className="uploaded-files">
        {files.length ? (
          files.map((file) => (
            <div key={file.id}>
              <span>{file.name}</span>
              <Button variant="ghost" icon={<Trash2 size={15} />} onClick={() => removeFile(file.id)}>
                Удалить
              </Button>
            </div>
          ))
        ) : (
          <p>Файлы пока не добавлены.</p>
        )}
      </div>
      <label>
        Комментарий
        <textarea rows={3} {...register("comment")} />
      </label>
      <div className="form-actions">
        <Button
          variant="secondary"
          icon={<Save size={18} />}
          loading={createDocument.isPending && mode === "create"}
          disabled={isSubmitting || createDocument.isPending || updateDocument.isPending}
          onClick={() => void save("draft")}
        >
          Сохранить черновик
        </Button>
        <Button
          icon={<Send size={18} />}
          loading={createDocument.isPending || updateDocument.isPending}
          disabled={isSubmitting || createDocument.isPending || updateDocument.isPending}
          onClick={() => void save("in_review")}
        >
          {mode === "edit" ? "Сохранить и отправить" : "Отправить на согласование"}
        </Button>
        <Button variant="ghost" icon={<X size={18} />} onClick={() => navigate(-1)}>
          Отмена
        </Button>
      </div>
      {toast && <Toast kind="success" message={toast} onClose={() => setToast(undefined)} />}
    </form>
  );
}

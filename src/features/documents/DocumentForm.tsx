import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { FilePlus2, Save, Send, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Toast, type ToastKind } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthContext";
import { useCategories } from "@/hooks/useCategories";
import { useCreateDocument, useUpdateDocument } from "@/hooks/useDocuments";
import { useDepartments } from "@/hooks/useDepartments";
import { useUsers } from "@/hooks/useUsers";
import type { Document, DocumentFile, DocumentStatus } from "@/types";

const submitSchema = z.object({
  title: z.string().min(3, "Укажите название документа (минимум 3 символа)"),
  categoryId: z.string().min(1, "Выберите категорию документа"),
  type: z.string().min(2, "Укажите тип документа"),
  description: z.string().min(5, "Опишите документ подробнее (минимум 5 символов)"),
  departmentId: z.string().min(1, "Выберите подразделение"),
  responsibleId: z.string().min(1, "Выберите ответственного"),
  deadline: z.string().min(1, "Укажите дедлайн"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  comment: z.string().optional(),
  approverIds: z.array(z.string()).optional(),
});

const draftSchema = z.object({
  title: z.string().min(1, "Укажите хотя бы краткое название для черновика"),
  categoryId: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  responsibleId: z.string().optional(),
  deadline: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  comment: z.string().optional(),
  approverIds: z.array(z.string()).optional(),
});

type DocumentFormValues = z.infer<typeof submitSchema>;

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

function getSevenDaysAhead(): string {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return date.toISOString().split("T")[0];
}

export function DocumentForm({ document, mode }: DocumentFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument(document?.id ?? "");
  const { data: categories = [] } = useCategories();
  const { data: departments = [] } = useDepartments();
  const { data: users = [] } = useUsers();
  const [files, setFiles] = useState<DocumentFile[]>(document?.files ?? []);
  const [fileError, setFileError] = useState("");
  const [toast, setToast] = useState<{ message: string; kind: ToastKind } | null>(null);
  const isLocked = document ? ["completed", "archived"].includes(document.status) : false;

  const defaultApprovers = useMemo(
    () => document?.approvalSteps?.map((step) => step.approver.id) ?? users.slice(0, 2).map((u) => u.id),
    [document, users],
  );

  const {
    formState: { errors, isDirty, isSubmitting },
    getValues,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      title: document?.title ?? "",
      categoryId: document?.category.id ?? categories[0]?.id ?? "",
      type: document?.type ?? "document",
      description: document?.description ?? "",
      departmentId: document?.department.id ?? user?.department?.id ?? departments[0]?.id ?? "",
      responsibleId: document?.responsible.id ?? user?.id ?? users[0]?.id ?? "",
      deadline: document?.deadline ? document.deadline.split("T")[0] : getSevenDaysAhead(),
      priority: document?.priority ?? "normal",
      comment: "",
      approverIds: defaultApprovers,
    },
  });

  // Re-sync default values when asynchronous options load (for create mode, if pristine)
  useEffect(() => {
    if (mode === "create" && !isDirty) {
      const currentVals = getValues();
      reset({
        title: currentVals.title || "",
        categoryId: currentVals.categoryId || categories[0]?.id || "",
        type: currentVals.type || "document",
        description: currentVals.description || "",
        departmentId: currentVals.departmentId || user?.department?.id || departments[0]?.id || "",
        responsibleId: currentVals.responsibleId || user?.id || users[0]?.id || "",
        deadline: currentVals.deadline || getSevenDaysAhead(),
        priority: currentVals.priority || "normal",
        comment: currentVals.comment || "",
        approverIds: currentVals.approverIds && currentVals.approverIds.length > 0 ? currentVals.approverIds : (users.slice(0, 2).map((u) => u.id)),
      });
    }
  }, [categories, departments, users, user, mode, isDirty, reset, getValues]);

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

  const selectedApprovers = watch("approverIds") ?? [];

  const handleApproverToggle = (approverId: string) => {
    const current = getValues("approverIds") ?? [];
    const next = current.includes(approverId)
      ? current.filter((id) => id !== approverId)
      : [...current, approverId];
    setValue("approverIds", next, { shouldDirty: true });
  };

  const save = async (status: Extract<DocumentStatus, "draft" | "in_review">) => {
    const currentValues = getValues();

    if (status === "draft") {
      // Draft validation
      const result = draftSchema.safeParse(currentValues);
      if (!result.success) {
        const firstError = result.error.issues[0]?.message || "Заполните название документа.";
        setToast({ message: firstError, kind: "error" });
        return;
      }

      const payload = {
        title: currentValues.title.trim() || "Новый документ",
        categoryId: currentValues.categoryId || categories[0]?.id || "",
        type: currentValues.type || "document",
        description: currentValues.description || "",
        departmentId: currentValues.departmentId || user?.department?.id || departments[0]?.id || "",
        responsibleId: currentValues.responsibleId || user?.id || users[0]?.id || "",
        deadline: currentValues.deadline || getSevenDaysAhead(),
        priority: currentValues.priority || "normal",
        comment: currentValues.comment || "",
        approverIds: currentValues.approverIds || [],
        files,
        status: "draft" as const,
      };

      try {
        if (mode === "create") {
          const createdDocument = await createDocument.mutateAsync(payload);
          setToast({ message: "Черновик успешно сохранён.", kind: "success" });
          setTimeout(() => navigate(`/documents/${createdDocument.id}`), 400);
        } else if (document) {
          const updatedDocument = await updateDocument.mutateAsync(payload);
          setToast({ message: "Изменения сохранены.", kind: "success" });
          setTimeout(() => navigate(`/documents/${updatedDocument.id}`), 400);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        setToast({
          message: error?.message || "Ошибка при сохранении черновика. Проверьте данные.",
          kind: "error",
        });
      }
      return;
    }

    // Full validation when sending to review
    await handleSubmit(
      async (values) => {
        try {
          const resolvedDepartmentId = values.departmentId || user?.department?.id || departments[0]?.id || "";
          const resolvedCategoryId = values.categoryId || categories[0]?.id || "";
          const resolvedResponsibleId = values.responsibleId || user?.id || users[0]?.id || "";

          const payload = {
            ...values,
            departmentId: resolvedDepartmentId,
            categoryId: resolvedCategoryId,
            responsibleId: resolvedResponsibleId,
            approverIds: values.approverIds || [],
            files,
            status: "in_review" as const,
          };

          if (mode === "create") {
            const createdDocument = await createDocument.mutateAsync(payload);
            setToast({ message: "Документ отправлен на согласование.", kind: "success" });
            setTimeout(() => navigate(`/documents/${createdDocument.id}`), 400);
          } else if (document) {
            const updatedDocument = await updateDocument.mutateAsync(payload);
            setToast({ message: "Изменения сохранены и документ отправлен.", kind: "success" });
            setTimeout(() => navigate(`/documents/${updatedDocument.id}`), 400);
          }
        } catch (err: unknown) {
          const error = err as { message?: string };
          setToast({
            message: error?.message || "Ошибка при отправке документа. Проверьте данные.",
            kind: "error",
          });
        }
      },
      (invalidErrors) => {
        const errorList = Object.values(invalidErrors)
          .map((item) => item?.message)
          .filter(Boolean);
        const firstError = errorList[0] || "Пожалуйста, заполните все обязательные поля формы.";
        setToast({ message: firstError, kind: "error" });
      },
    )();
  };

  if (isLocked) {
    return (
      <div className="content-card">
        <h2>Редактирование недоступно</h2>
        <p>Завершенные и архивные документы нельзя изменять.</p>
      </div>
    );
  }

  const isUserAdmin = user?.is_superuser || user?.role?.code === "admin";

  return (
    <form className="content-card document-form" onSubmit={(event) => event.preventDefault()}>
      {document?.returnReason && <div className="form-warning">Причина возврата: {document.returnReason}</div>}
      <div className="form-grid">
        <label>
          Название документа *
          <input placeholder="Например: Служебная записка на закупку оборудования" {...register("title")} />
          {errors.title && <small>{errors.title.message}</small>}
        </label>
        <label>
          Категория *
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
          Тип документа *
          <input placeholder="document, report, request, memo..." {...register("type")} />
          {errors.type && <small>{errors.type.message}</small>}
        </label>
        <label>
          Подразделение *
          <select {...register("departmentId")}>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name} {user?.department?.id === department.id ? "(Ваше подразделение)" : ""}
              </option>
            ))}
          </select>
          {!isUserAdmin && user?.department && (
            <span style={{ fontSize: "12px", color: "var(--color-fog)" }}>
              Документ привязывается к вашему подразделению: {user.department.name}
            </span>
          )}
          {errors.departmentId && <small>{errors.departmentId.message}</small>}
        </label>
        <label>
          Ответственный *
          <select {...register("responsibleId")}>
            {users.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} {user?.id === item.id ? "(Вы)" : ""}
              </option>
            ))}
          </select>
          {errors.responsibleId && <small>{errors.responsibleId.message}</small>}
        </label>
        <label>
          Дедлайн *
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
        <div style={{ display: "grid", gap: "6px" }}>
          <label style={{ margin: 0 }}>Согласующие лица</label>
          <div
            style={{
              maxHeight: "130px",
              overflowY: "auto",
              border: "1px solid var(--color-cloud)",
              borderRadius: "14px",
              padding: "8px 12px",
              display: "grid",
              gap: "6px",
              background: "var(--color-snow)",
            }}
          >
            {users.map((u) => (
              <label
                key={u.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "normal",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  style={{ width: "auto" }}
                  checked={selectedApprovers.includes(u.id)}
                  onChange={() => handleApproverToggle(u.id)}
                />
                <span>{u.name} {u.position ? `(${u.position})` : ""}</span>
              </label>
            ))}
          </div>
          <span style={{ fontSize: "11px", color: "var(--color-fog)" }}>
            Если не выбраны вручную, будет использован стандартный маршрут выбранной категории.
          </span>
        </div>
      </div>
      <label>
        Описание *
        <textarea rows={4} placeholder="Подробно опишите суть и цель документа..." {...register("description")} />
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
          <p style={{ color: "var(--color-fog)", fontSize: "13px" }}>Файлы пока не добавлены.</p>
        )}
      </div>
      <label>
        Комментарий
        <textarea rows={2} placeholder="Примечание к документу..." {...register("comment")} />
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
      {toast && (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </form>
  );
}

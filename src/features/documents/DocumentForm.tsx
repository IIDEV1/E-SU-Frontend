import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Send, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { categories, departments, users } from "@/mocks/data";
import type { Document } from "@/types";

const schema = z.object({
  title: z.string().min(3, "Минимум 3 символа"),
  categoryId: z.string().min(1, "Выберите категорию"),
  type: z.string().min(2, "Укажите тип"),
  description: z.string().min(10, "Опишите документ подробнее"),
  departmentId: z.string().min(1, "Выберите подразделение"),
  responsibleId: z.string().min(1, "Выберите ответственного"),
  deadline: z.string().min(1, "Укажите дедлайн"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  comment: z.string().optional(),
  approvers: z.array(z.string()).min(1, "Выберите хотя бы одного согласующего"),
  mainFile: z.instanceof(FileList).optional(),
  extraFiles: z.instanceof(FileList).optional(),
});

const allowedFileTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
];
const maxFileSize = 20 * 1024 * 1024;

type DocumentFormValues = z.infer<typeof schema>;

interface DocumentFormProps {
  document?: Document;
  mode: "create" | "edit";
}

export function DocumentForm({ document, mode }: DocumentFormProps) {
  const navigate = useNavigate();
  const isLocked = document ? ["completed", "archived"].includes(document.status) : false;
  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: document?.title ?? "",
      categoryId: document?.category.id ?? categories[0].id,
      type: document?.type ?? "",
      description: document?.description ?? "",
      departmentId: document?.department.id ?? departments[0].id,
      responsibleId: document?.responsible.id ?? users[0].id,
      deadline: document?.deadline ?? "",
      priority: document?.priority ?? "normal",
      comment: "",
      approvers: document?.approvalSteps.map((step) => step.approver.id) ?? [users[1].id],
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

  const mainFile = watch("mainFile");
  const extraFiles = watch("extraFiles");

  const validateFiles = (fileList?: FileList) => {
    const files = Array.from(fileList ?? []);
    const oversizedFile = files.find((file) => file.size > maxFileSize);
    const invalidFile = files.find((file) => !allowedFileTypes.includes(file.type));

    if (oversizedFile) {
      throw new Error(`Файл ${oversizedFile.name} больше 20 MB.`);
    }

    if (invalidFile) {
      throw new Error(`Формат файла ${invalidFile.name} не поддерживается.`);
    }
  };

  const submit = handleSubmit(async (values) => {
    validateFiles(values.mainFile);
    validateFiles(values.extraFiles);
    await new Promise((resolve) => setTimeout(resolve, 350));
    navigate("/documents");
  });

  const saveDraft = handleSubmit(async (values) => {
    validateFiles(values.mainFile);
    validateFiles(values.extraFiles);
    await new Promise((resolve) => setTimeout(resolve, 250));
    navigate("/documents/my");
  });

  if (isLocked) {
    return (
      <div className="content-card">
        <h2>Редактирование недоступно</h2>
        <p>Завершенные и архивные документы нельзя изменять.</p>
      </div>
    );
  }

  return (
    <form className="content-card document-form" onSubmit={submit}>
      {document?.returnReason && (
        <div className="form-warning">Причина возврата: {document.returnReason}</div>
      )}
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
          <select multiple {...register("approvers")}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          {errors.approvers && <small>{errors.approvers.message}</small>}
        </label>
      </div>
      <label>
        Описание
        <textarea rows={5} {...register("description")} />
        {errors.description && <small>{errors.description.message}</small>}
      </label>
      <div className="upload-grid">
        <label className="dropzone">
          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" {...register("mainFile")} />
          <strong>Основной файл</strong>
          <span>{mainFile?.[0]?.name ?? "Перетащите файл или выберите вручную. До 20 MB."}</span>
        </label>
        <label className="dropzone">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
            {...register("extraFiles")}
          />
          <strong>Дополнительные файлы</strong>
          <span>
            {extraFiles?.length
              ? `${extraFiles.length} файлов выбрано`
              : "Можно добавить несколько вложений."}
          </span>
        </label>
      </div>
      <label>
        Комментарий
        <textarea rows={3} {...register("comment")} />
      </label>
      <div className="form-actions">
        <Button
          variant="secondary"
          type="button"
          icon={<Save size={18} />}
          onClick={() => void saveDraft()}
        >
          Сохранить черновик
        </Button>
        <Button disabled={isSubmitting} type="submit" icon={<Send size={18} />}>
          {mode === "edit" ? "Повторно отправить" : "Отправить на согласование"}
        </Button>
        <Button variant="ghost" type="button" icon={<X size={18} />} onClick={() => navigate(-1)}>
          Отмена
        </Button>
      </div>
    </form>
  );
}

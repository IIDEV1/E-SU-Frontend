import { RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { Button, EmptyState, FormField, Input, PageError, PageLoader, Toast, UnsavedChangesDialog } from "@/components/ui";
import { useAdminSettingsQuery, useUpdateSystemSettings } from "@/features/admin/hooks";
import { useUnsavedChangesGuard } from "@/features/admin/useUnsavedChangesGuard";
import type { SystemSettingKey, SystemSettingsValues } from "@/services/endpoints/admin.api";
import { cloneSystemSettings, getSettingsScreenState, isSystemSettingsDirty, saveSystemSettingsDraft } from "./settingsState";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") return error.message;
  return "Не удалось сохранить настройки.";
}

export function SettingsPage() {
  const settingsQuery = useAdminSettingsQuery();
  const updateSettings = useUpdateSystemSettings();
  const [draft, setDraft] = useState<SystemSettingsValues | null>(null);
  const [extension, setExtension] = useState("");
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const screenState = getSettingsScreenState(settingsQuery);
  const saved = settingsQuery.data?.values ?? {};
  const values = draft ?? saved;
  const dirty = draft !== null && isSystemSettingsDirty(saved, draft);
  const unsavedChangesGuard = useUnsavedChangesGuard(dirty && !updateSettings.isPending);

  const setValue = (key: SystemSettingKey, value: SystemSettingsValues[SystemSettingKey]) => {
    setDraft((currentDraft) => ({ ...(currentDraft ?? cloneSystemSettings(saved)), [key]: value }));
  };

  const addExtension = () => {
    const normalized = extension.trim().replace(/^\./, "").toLowerCase();
    const currentExtensions = values.allowed_file_extensions;
    if (!normalized || !Array.isArray(currentExtensions) || currentExtensions.includes(normalized)) return;
    setValue("allowed_file_extensions", [...currentExtensions, normalized]);
    setExtension("");
  };

  const removeExtension = (extensionToRemove: string) => {
    const currentExtensions = values.allowed_file_extensions;
    if (Array.isArray(currentExtensions)) setValue("allowed_file_extensions", currentExtensions.filter((item) => item !== extensionToRemove));
  };

  const save = async () => {
    setToast(null);
    try {
      const savedChanges = await saveSystemSettingsDraft(saved, values, updateSettings.mutateAsync, async () => {
        const result = await settingsQuery.refetch();
        if (result.isError) throw result.error;
      });
      if (!savedChanges) return;
      setDraft(null);
      setToast({ kind: "success", message: "Настройки сохранены" });
    } catch (error) {
      setToast({ kind: "error", message: getErrorMessage(error) });
    }
  };

  if (screenState === "loading") return <PageLoader label="Загрузка настроек" />;
  if (screenState === "error") return <PageError description={getErrorMessage(settingsQuery.error)} action={<Button variant="secondary" onClick={() => void settingsQuery.refetch()}>Повторить</Button>} />;
  if (!Object.keys(saved).length) return <div className="page-stack settings-page"><section className="page-hero"><div><h1>Настройки системы</h1><p>Только настройки, поддерживаемые Release 1 backend.</p></div></section><EmptyState title="Настройки не найдены" description="Backend не вернул поддерживаемых настроек Release 1." /></div>;

  return <div className="page-stack settings-page"><section className="page-hero"><div><h1>Настройки системы</h1><p>Только настройки, поддерживаемые Release 1 backend.</p></div></section><section className="content-card"><div className="settings-form"><h2>Поддерживаемые настройки</h2>{"university_name" in values && <FormField label="Название университета" htmlFor="university-name"><Input id="university-name" value={String(values.university_name ?? "")} disabled={updateSettings.isPending} onChange={(event) => setValue("university_name", event.target.value)} /></FormField>}{"sender_email" in values && <FormField label="Email отправителя" htmlFor="sender-email"><Input id="sender-email" type="email" value={String(values.sender_email ?? "")} disabled={updateSettings.isPending} onChange={(event) => setValue("sender_email", event.target.value)} /></FormField>}{"document_number_format" in values && <FormField label="Формат номера документа" htmlFor="document-number-format"><Input id="document-number-format" value={String(values.document_number_format ?? "")} disabled={updateSettings.isPending} onChange={(event) => setValue("document_number_format", event.target.value)} /></FormField>}{"max_file_size_mb" in values && <FormField label="Максимальный размер файла, МБ" htmlFor="max-file-size"><Input id="max-file-size" type="number" min="0" value={String(values.max_file_size_mb ?? "")} disabled={updateSettings.isPending} onChange={(event) => setValue("max_file_size_mb", Number(event.target.value))} /></FormField>}{"reminder_days_before_deadline" in values && <FormField label="Напомнить за дней до срока" htmlFor="reminder-days"><Input id="reminder-days" type="number" min="0" value={String(values.reminder_days_before_deadline ?? "")} disabled={updateSettings.isPending} onChange={(event) => setValue("reminder_days_before_deadline", Number(event.target.value))} /></FormField>}{"allowed_file_extensions" in values && <><FormField label="Допустимые расширения" htmlFor="new-extension"><div className="settings-extension-list">{Array.isArray(values.allowed_file_extensions) && values.allowed_file_extensions.map((item) => <span key={item} className="settings-extension">.{item}<Button type="button" variant="ghost" disabled={updateSettings.isPending} onClick={() => removeExtension(item)}>Удалить</Button></span>)}</div></FormField><FormField label="Новое расширение" htmlFor="new-extension"><Input id="new-extension" value={extension} disabled={updateSettings.isPending} onChange={(event) => setExtension(event.target.value)} placeholder="Например, pdf" /></FormField><Button type="button" variant="secondary" disabled={updateSettings.isPending} onClick={addExtension}>Добавить расширение</Button></>}</div>{dirty && <p className="roles-dirty">Есть несохранённые изменения.</p>}<div className="form-actions"><Button type="button" variant="secondary" icon={<RotateCcw size={16} />} disabled={!dirty || updateSettings.isPending} onClick={() => setDraft(null)}>Отменить изменения</Button><Button type="button" icon={<Save size={16} />} loading={updateSettings.isPending} disabled={!dirty || updateSettings.isPending} onClick={() => void save()}>Сохранить</Button></div></section>{toast && <Toast message={toast.message} kind={toast.kind} onClose={() => setToast(null)} />}{unsavedChangesGuard.isDialogOpen && <UnsavedChangesDialog isOpen onClose={unsavedChangesGuard.cancelNavigation} onConfirm={unsavedChangesGuard.confirmNavigation} />}</div>;
}

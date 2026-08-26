import { RotateCcw } from "lucide-react";
import { useMemo, useReducer } from "react";
import { AuditActionBadge, Button, DataTable, EmptyState, Input, PageError, PageLoader, Select, StatusIcon, TableToolbar, type TableColumn } from "@/components/ui";
import { useAdminAuditActionsQuery, useAdminAuditLogsQuery } from "@/features/admin/hooks";
import type { AdminAuditLog } from "@/features/admin/types";
import { auditLogListReducer, getAuditScreenState, initialAuditLogListState, toAuditLogsParams } from "./auditLogState";

const PAGE_SIZE = 20;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Не удалось загрузить журнал действий.";
}

export function AuditPage() {
  const [state, dispatch] = useReducer(auditLogListReducer, initialAuditLogListState);
  const params = useMemo(() => toAuditLogsParams(state, PAGE_SIZE), [state]);
  const logsQuery = useAdminAuditLogsQuery(params);
  const actionsQuery = useAdminAuditActionsQuery();
  const screenState = getAuditScreenState(logsQuery, actionsQuery);

  if (screenState === "loading") return <PageLoader label="Загрузка журнала действий" />;
  if (screenState === "error") {
    const error = logsQuery.isError ? logsQuery.error : actionsQuery.error;
    return <PageError description={getErrorMessage(error)} action={<Button variant="secondary" onClick={() => void Promise.all([logsQuery.refetch(), actionsQuery.refetch()])}>Повторить</Button>} />;
  }

  const logs = logsQuery.data?.data ?? [];
  const pageCount = Math.max(1, Math.ceil((logsQuery.data?.total ?? 0) / PAGE_SIZE));
  const columns: TableColumn<AdminAuditLog>[] = [
    { id: "date", header: "Дата и время", cell: (log) => log.createdAt },
    { id: "user", header: "Пользователь", cell: (log) => log.user?.fullName || log.user?.email || "Система" },
    { id: "action", header: "Действие", cell: (log) => <AuditActionBadge action={log.actionDisplay} /> },
    { id: "object", header: "Объект", cell: (log) => <>{log.objectType || "—"}{log.objectId && <small> · {log.objectId}</small>}</> },
    { id: "description", header: "Описание", cell: (log) => log.description || "—" },
    { id: "result", header: "Результат", cell: (log) => <span className={`audit-result audit-result--${log.result === "success" ? "success" : "error"}`}><StatusIcon status={log.result === "success" ? "success" : "error"} />{log.resultDisplay}</span> },
  ];

  return <div className="page-stack admin-page audit-page"><section className="page-hero"><div><h1>Журнал действий</h1><p>Только чтение. Всего записей: {logsQuery.data?.total ?? 0}.</p></div></section><section className="content-card"><DataTable columns={columns} rows={logs} toolbar={<TableToolbar><Input aria-label="Поиск по журналу" placeholder="Поиск по журналу" value={state.search} onChange={(event) => dispatch({ type: "filter", field: "search", value: event.target.value })} /><Input aria-label="ID пользователя" placeholder="ID пользователя" value={state.user} onChange={(event) => dispatch({ type: "filter", field: "user", value: event.target.value })} /><Input aria-label="Email пользователя" placeholder="Email пользователя" value={state.userEmail} onChange={(event) => dispatch({ type: "filter", field: "userEmail", value: event.target.value })} /><Select aria-label="Действие" value={state.action} options={[{ value: "", label: "Все действия" }, ...(actionsQuery.data ?? []).map((item) => ({ value: item.code, label: item.name }))]} onChange={(event) => dispatch({ type: "filter", field: "action", value: event.target.value })} /><Input aria-label="Тип объекта" placeholder="Тип объекта" value={state.objectType} onChange={(event) => dispatch({ type: "filter", field: "objectType", value: event.target.value })} /><Input aria-label="ID объекта" placeholder="ID объекта" value={state.objectId} onChange={(event) => dispatch({ type: "filter", field: "objectId", value: event.target.value })} /><Select aria-label="Результат" value={state.result} options={[{ value: "all", label: "Все результаты" }, { value: "success", label: "Успешно" }, { value: "failure", label: "Ошибка" }]} onChange={(event) => dispatch({ type: "filter", field: "result", value: event.target.value })} /><Input aria-label="Дата от" type="datetime-local" value={state.dateFrom} onChange={(event) => dispatch({ type: "filter", field: "dateFrom", value: event.target.value })} /><Input aria-label="Дата до" type="datetime-local" value={state.dateTo} onChange={(event) => dispatch({ type: "filter", field: "dateTo", value: event.target.value })} /><Select aria-label="Сортировка" value={state.ordering} options={[{ value: "-created_at", label: "Сначала новые" }, { value: "created_at", label: "Сначала старые" }, { value: "action", label: "Действие А–Я" }, { value: "-action", label: "Действие Я–А" }]} onChange={(event) => dispatch({ type: "ordering", value: event.target.value as typeof state.ordering })} /><Button variant="secondary" icon={<RotateCcw size={16} />} onClick={() => dispatch({ type: "reset" })}>Сбросить</Button></TableToolbar>} empty={<EmptyState title="Записи не найдены" description="Сервер не вернул записей по заданным параметрам." />} pagination={{ page: state.page, pageCount, onPageChange: (page) => dispatch({ type: "page", value: page }) }} renderMobileCard={(log) => <div className="audit-mobile-card"><strong>{log.description || log.objectType || "Действие"}</strong><span>{log.createdAt}</span><span>{log.user?.fullName || log.user?.email || "Система"}</span><AuditActionBadge action={log.actionDisplay} /><span>{log.objectType}{log.objectId && ` · ${log.objectId}`}</span><span className={`audit-result audit-result--${log.result === "success" ? "success" : "error"}`}><StatusIcon status={log.result === "success" ? "success" : "error"} />{log.resultDisplay}</span></div>} /></section></div>;
}

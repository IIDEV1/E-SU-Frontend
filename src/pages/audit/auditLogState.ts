import type { AuditLogsParams } from "@/services/endpoints/admin.api";

export interface AuditLogListState {
  page: number;
  search: string;
  user: string;
  userEmail: string;
  action: string;
  objectType: string;
  objectId: string;
  result: "all" | "success" | "failure";
  dateFrom: string;
  dateTo: string;
  ordering: NonNullable<AuditLogsParams["ordering"]>;
}

export const initialAuditLogListState: AuditLogListState = {
  page: 1,
  search: "",
  user: "",
  userEmail: "",
  action: "",
  objectType: "",
  objectId: "",
  result: "all",
  dateFrom: "",
  dateTo: "",
  ordering: "-created_at",
};

type AuditLogFilter = Exclude<keyof AuditLogListState, "page" | "ordering">;

export type AuditLogListAction =
  | { type: "filter"; field: AuditLogFilter; value: string }
  | { type: "ordering"; value: AuditLogListState["ordering"] }
  | { type: "page"; value: number }
  | { type: "reset" };

export function auditLogListReducer(state: AuditLogListState, action: AuditLogListAction): AuditLogListState {
  if (action.type === "filter") return { ...state, [action.field]: action.value, page: 1 };
  if (action.type === "ordering") return { ...state, ordering: action.value, page: 1 };
  if (action.type === "page") return { ...state, page: action.value };
  return initialAuditLogListState;
}

export function toAuditLogsParams(state: AuditLogListState, pageSize: number): AuditLogsParams {
  return {
    page: state.page,
    pageSize,
    search: state.search || undefined,
    user: state.user || undefined,
    userEmail: state.userEmail || undefined,
    action: state.action || undefined,
    objectType: state.objectType || undefined,
    objectId: state.objectId || undefined,
    result: state.result === "all" ? undefined : state.result,
    dateFrom: state.dateFrom || undefined,
    dateTo: state.dateTo || undefined,
    ordering: state.ordering,
  };
}

export function getAuditScreenState(logs: { isLoading: boolean; isError: boolean }, actions: { isLoading: boolean; isError: boolean }) {
  if (logs.isLoading || actions.isLoading) return "loading";
  if (logs.isError || actions.isError) return "error";
  return "content";
}

import { api, unwrapResponse } from "@/services/api";
import { mapDocumentList } from "@/services/mappers";
import type { ApiEnvelope, DocumentListDto } from "@/services/types";
import type { DocumentListItem, Notification, NotificationType } from "@/types";

export interface DashboardCountersDto {
  all: number;
  my: number;
  for_approval: number;
  returned: number;
  overdue: number;
  archived: number;
}

export interface DashboardNotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  document: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface DashboardQuickActionDto {
  code: string;
  label: string;
  url: string;
}

export interface DashboardDto {
  counters: DashboardCountersDto;
  recent_documents: DocumentListDto[];
  approval_documents: DocumentListDto[];
  recent_notifications: DashboardNotificationDto[];
  quick_actions: DashboardQuickActionDto[];
}

export interface DashboardData {
  counters: DashboardCountersDto;
  recentDocuments: DocumentListItem[];
  approvalDocuments: DocumentListItem[];
  recentNotifications: Notification[];
  quickActions: DashboardQuickActionDto[];
}

function mapDashboardNotification(notification: DashboardNotificationDto): Notification {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    time: notification.created_at,
    createdAt: notification.created_at,
    isRead: notification.is_read,
    documentId: notification.document ?? undefined,
  };
}

export function mapDashboard(dto: DashboardDto): DashboardData {
  return {
    counters: dto.counters,
    recentDocuments: dto.recent_documents.map(mapDocumentList),
    approvalDocuments: dto.approval_documents.map(mapDocumentList),
    recentNotifications: dto.recent_notifications.map(mapDashboardNotification),
    quickActions: dto.quick_actions,
  };
}

export const dashboardApi = {
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get<ApiEnvelope<DashboardDto>>("/dashboard/");
    return mapDashboard(unwrapResponse(response));
  },
};

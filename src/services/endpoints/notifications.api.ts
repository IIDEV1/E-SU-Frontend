import { api, unwrapResponse } from "@/services/api";
import { mapNotification } from "@/services/mappers";
import type { ApiEnvelope, ApiPagination } from "@/services/types";
import type { Notification } from "@/types";

export interface NotificationsQueryParams {
  page?: number;
  page_size?: number;
  type?: string;
  is_read?: boolean;
  document?: string;
}

export const notificationsApi = {
  async getNotificationsPage(params: NotificationsQueryParams = {}) {
    const response = await api.get<ApiEnvelope<ApiPagination<Parameters<typeof mapNotification>[0]>>>("/notifications/", {
      params: { page: 1, page_size: 20, ...params },
    });
    const page = unwrapResponse(response);
    return { ...page, results: page.results.map(mapNotification) };
  },
  async getNotifications() { return (await this.getNotificationsPage({ page_size: 100 })).results; },

  async getUnreadCount() {
    const response = await api.get<ApiEnvelope<{ count: number }>>("/notifications/unread-count/");
    return unwrapResponse(response).count;
  },

  async markRead(id: string): Promise<Notification> {
    const response = await api.post<ApiEnvelope<Parameters<typeof mapNotification>[0]>>(`/notifications/${id}/read/`);
    return mapNotification(unwrapResponse(response));
  },

  async markAllRead() {
    const response = await api.post<ApiEnvelope<{ updated: number }>>("/notifications/read-all/");
    return unwrapResponse(response);
  },
};

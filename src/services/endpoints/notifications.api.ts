import { api, unwrapResponse } from "@/services/api";
import { mapNotification } from "@/services/mappers";
import type { ApiEnvelope, ApiPagination } from "@/services/types";
import type { Notification } from "@/types";

export const notificationsApi = {
  async getNotifications() {
    const response = await api.get<ApiEnvelope<ApiPagination<unknown>>>("/notifications/", { params: { page_size: 50 } });
    return unwrapResponse(response).results.map((item) => mapNotification(item as Parameters<typeof mapNotification>[0]));
  },

  async getUnreadCount() {
    const response = await api.get<ApiEnvelope<{ count: number }>>("/notifications/unread-count/");
    return unwrapResponse(response).count;
  },

  async markRead(id: string): Promise<Notification> {
    const response = await api.post<ApiEnvelope<unknown>>(`/notifications/${id}/read/`);
    return mapNotification(unwrapResponse(response) as Parameters<typeof mapNotification>[0]);
  },

  async markAllRead() {
    const response = await api.post<ApiEnvelope<{ updated: number }>>("/notifications/read-all/");
    return unwrapResponse(response);
  },
};

export const notificationsApi = {
  async getNotifications() {
    return [
      { id: "n-1", title: "Документ ожидает согласования", createdAt: "2026-07-25" },
      { id: "n-2", title: "Дедлайн договора LMS просрочен", createdAt: "2026-07-24" },
    ];
  },
};

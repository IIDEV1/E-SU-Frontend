import { describe, expect, it } from "vitest";
import { mapDashboard, type DashboardDto } from "@/services/endpoints/dashboard.api";
import type { DocumentListDto } from "@/services/types";

const listDocument: DocumentListDto = {
  id: "document-dashboard-1",
  registration_number: null,
  title: "Документ без назначенного ответственного",
  document_type: "memo",
  category: { id: "category-1", name: "Записки", code: "memo", status: "active" },
  author: { id: "user-1", email: "user@esu.kg", full_name: "Иван Иванов", position: "Сотрудник" },
  department: { id: "department-1", code: "IT", name: "IT", status: "active" },
  responsible: null,
  priority: "normal",
  status: "draft",
  deadline: null,
  submitted_at: null,
  approved_at: null,
  completed_at: null,
  archived_at: null,
  current_approval_step: null,
  created_at: "2026-08-26T10:00:00+06:00",
  updated_at: "2026-08-26T10:00:00+06:00",
};

describe("Release 1 dashboard mapping", () => {
  it("maps every confirmed dashboard field without deriving counters from lists", () => {
    const dto: DashboardDto = {
      counters: { all: 42, my: 7, for_approval: 3, returned: 2, overdue: 4, archived: 9 },
      recent_documents: [listDocument],
      approval_documents: [],
      recent_notifications: [
        {
          id: "notification-1",
          type: "approval_required",
          title: "Требуется согласование",
          message: "Откройте документ",
          document: listDocument.id,
          is_read: false,
          created_at: "2026-08-26T11:00:00+06:00",
          read_at: null,
        },
      ],
      quick_actions: [{ code: "create_document", label: "Создать документ", url: "/documents/new" }],
    };

    const dashboard = mapDashboard(dto);

    expect(dashboard.counters.all).toBe(42);
    expect(dashboard.recentDocuments).toHaveLength(1);
    expect(dashboard.recentDocuments[0]).toMatchObject({
      id: listDocument.id,
      number: "Без номера",
      responsible: null,
      deadline: null,
    });
    expect(dashboard.recentNotifications[0]).toMatchObject({
      documentId: listDocument.id,
      isRead: false,
    });
    expect(dashboard.quickActions).toEqual(dto.quick_actions);
  });
});

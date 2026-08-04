import type { Department, Document, DocumentCategory, User } from "@/types";

export const departments: Department[] = [
  { id: "dep-1", name: "Учебный отдел", code: "EDU" },
  { id: "dep-2", name: "Финансовый отдел", code: "FIN" },
  { id: "dep-3", name: "IT департамент", code: "IT" },
];

export const users: User[] = [
  {
    id: "u-1",
    name: "Айдана Садыкова",
    email: "aidana@esu.kg",
    role: "department_head",
    department: departments[0],
    position: "Руководитель учебного отдела",
  },
  {
    id: "u-2",
    name: "Нурбек Алиев",
    email: "nurbek@esu.kg",
    role: "approver",
    department: departments[1],
    position: "Финансовый контролер",
  },
  {
    id: "u-3",
    name: "Мээрим Осмонова",
    email: "meerim@esu.kg",
    role: "employee",
    department: departments[2],
    position: "Frontend coordinator",
  },
];

export const currentUser = users[0];

export const categories: DocumentCategory[] = [
  { id: "cat-1", name: "Приказ", code: "ORD" },
  { id: "cat-2", name: "Договор", code: "AGR" },
  { id: "cat-3", name: "Заявка", code: "REQ" },
];

export const documents: Document[] = [
  {
    id: "doc-1",
    number: "ESU-2026-001",
    title: "Приказ о запуске летней сессии",
    category: categories[0],
    type: "Внутренний документ",
    description: "Согласование расписания, ответственных преподавателей и дедлайнов.",
    author: users[0],
    department: departments[0],
    responsible: users[1],
    createdAt: "2026-07-15",
    deadline: "2026-07-28",
    status: "in_review",
    priority: "high",
    files: [
      {
        id: "file-1",
        name: "session-order.pdf",
        size: 1450000,
        type: "application/pdf",
        url: "#",
        uploadedAt: "2026-07-15",
      },
    ],
    approvalSteps: [
      { id: "step-1", approver: users[1], status: "approved", date: "2026-07-16" },
      { id: "step-2", approver: users[2], status: "pending" },
    ],
    comments: [
      { id: "c-1", author: users[1], text: "Финальная смета приложена.", createdAt: "2026-07-16" },
    ],
    history: ["Документ создан", "Отправлен на согласование", "Финансовый отдел согласовал"],
  },
  {
    id: "doc-2",
    number: "ESU-2026-014",
    title: "Договор на обновление LMS",
    category: categories[1],
    type: "Внешний договор",
    description: "Закупка лицензий и сопровождение платформы дистанционного обучения.",
    author: users[2],
    department: departments[2],
    responsible: users[0],
    createdAt: "2026-07-10",
    deadline: "2026-07-24",
    status: "overdue",
    priority: "urgent",
    files: [],
    approvalSteps: [{ id: "step-3", approver: users[0], status: "pending" }],
    comments: [],
    history: ["Черновик сохранен", "Отправлен на согласование"],
  },
  {
    id: "doc-3",
    number: "ESU-2026-020",
    title: "Заявка на аудит кабинетов",
    category: categories[2],
    type: "Служебная заявка",
    description: "Проверка готовности аудиторий к новому учебному году.",
    author: users[1],
    department: departments[1],
    responsible: users[2],
    createdAt: "2026-07-18",
    deadline: "2026-08-03",
    status: "returned",
    priority: "normal",
    files: [],
    approvalSteps: [
      {
        id: "step-4",
        approver: users[0],
        status: "returned",
        comment: "Нужно уточнить список аудиторий.",
      },
    ],
    comments: [],
    history: ["Документ создан", "Возвращен на доработку"],
    returnReason: "Нужно уточнить список аудиторий и ответственных.",
  },
  {
    id: "doc-4",
    number: "ESU-2026-021",
    title: "Черновик регламента деканата",
    category: categories[0],
    type: "Регламент",
    description: "Обновление процесса обработки студенческих заявлений.",
    author: users[0],
    department: departments[0],
    responsible: users[0],
    createdAt: "2026-07-20",
    deadline: "2026-08-10",
    status: "draft",
    priority: "low",
    files: [],
    approvalSteps: [],
    comments: [],
    history: ["Черновик сохранен"],
  },
  {
    id: "doc-5",
    number: "ESU-2026-010",
    title: "Архивный акт приемки",
    category: categories[2],
    type: "Акт",
    description: "Документ завершен и перенесен в архив.",
    author: users[1],
    department: departments[1],
    responsible: users[1],
    createdAt: "2026-06-28",
    deadline: "2026-07-05",
    status: "archived",
    priority: "normal",
    files: [],
    approvalSteps: [],
    comments: [],
    history: ["Согласован", "Исполнен", "Архивирован"],
  },
];

// Дополнительные mock-данные (уведомления, роли, журнал аудита, настройки)
export const mockNotifications = [
  { id: '1', type: 'approved', title: 'Документ согласован', message: 'Приказ №45-У успешно прошел все этапы согласования.', time: '14:20', isRead: false, documentId: 'doc-1' },
  { id: '2', type: 'deadline', title: 'Приближается дедлайн', message: 'Срок рассмотрения служебной записки истекает завтра.', time: '11:05', isRead: false, documentId: 'doc-2' },
  { id: '3', type: 'comment', title: 'Добавлен комментарий', message: 'Оставлено замечание к проекту договора подряда.', time: 'Вчера', isRead: true, documentId: 'doc-3' },
];

export const mockRoles = [
  { id: 'admin', name: 'Администратор системы', description: 'Полный доступ ко всем модулям и настройкам', usersCount: 1 },
  { id: 'department_head', name: 'Руководитель', description: 'Согласование и утверждение документов', usersCount: 1 },
  { id: 'approver', name: 'Согласующий / Контролер', description: 'Проверка финансовых и юридических аспектов', usersCount: 1 },
  { id: 'employee', name: 'Сотрудник', description: 'Создание и отправка внутренних документов', usersCount: 1 },
];

export const mockAuditLogs = [
  { id: '1', dateTime: '2026-07-27 14:20:15', user: 'Айдана Садыкова', role: 'Руководитель', action: 'Согласование', object: 'Документ', document: 'Приказ ESU-2026-001', department: 'Учебный отдел', result: 'success' },
  { id: '2', dateTime: '2026-07-27 11:05:40', user: 'Нурбек Алиев', role: 'Контролер', action: 'Создание', object: 'Документ', document: 'Заявка ESU-2026-020', department: 'Финансовый отдел', result: 'success' },
  { id: '3', dateTime: '2026-07-26 16:45:10', user: 'Мээрим Осмонова', role: 'Сотрудник', action: 'Возврат', object: 'Документ', document: 'Договор ESU-2026-014', department: 'IT департамент', result: 'error' },
];

export const mockSettings = {
  general: { systemName: 'Электронный документооборот ВУЗа', timezone: 'UTC+6 (Бишкек)', language: 'Русский' },
  university: { name: 'Международный Университет', rector: 'Садыков Б. К.', address: 'ул. Манаса 42', email: 'info@esu.kg' },
  numbering: { prefix: 'ESU', format: '[PREFIX]-[YEAR]-[ID]', startNumber: '101' },
  fileFormats: { pdf: true, docx: true, xlsx: true, png: true, jpg: true },
  maxFileSizeMb: 25,
};
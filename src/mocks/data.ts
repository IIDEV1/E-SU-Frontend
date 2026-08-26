/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import type { Department, Document, DocumentCategory, Notification, User } from "@/types";

export const departments: Department[] = [
  { id: "dep-edu", name: "Учебный отдел", code: "EDU" },
  { id: "dep-fin", name: "Финансовый отдел", code: "FIN" },
  { id: "dep-it", name: "IT департамент", code: "IT" },
  { id: "dep-office", name: "Канцелярия", code: "OFF" },
];

export const users: User[] = [
  {
    id: "u-1",
    name: "Айдана Садыкова",
    email: "aidana@esu.kg",
    role: "admin",
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
    position: "Координатор цифровых сервисов",
  },
  {
    id: "u-4",
    name: "Бекжан Токтосунов",
    email: "bekzhan@esu.kg",
    role: "rector",
    department: departments[3],
    position: "Ректор",
  },
  {
    id: "u-5",
    name: "Алина Жээнбекова",
    email: "alina@esu.kg",
    role: "department_head",
    department: departments[3],
    position: "Руководитель канцелярии",
  },
];

export const currentUser = users[0];

export const categories: DocumentCategory[] = [
  { id: "cat-order", name: "Приказ", code: "ORD" },
  { id: "cat-contract", name: "Договор", code: "AGR" },
  { id: "cat-request", name: "Заявка", code: "REQ" },
  { id: "cat-memo", name: "Служебная записка", code: "MEMO" },
  { id: "cat-act", name: "Акт", code: "ACT" },
];

const statuses: Document["status"][] = [
  "in_review",
  "overdue",
  "returned",
  "draft",
  "archived",
  "approved",
  "completed",
  "in_review",
  "draft",
  "overdue",
  "returned",
  "approved",
  "completed",
  "in_review",
  "draft",
  "archived",
  "in_review",
  "completed",
  "returned",
  "approved",
];

const titles = [
  "Приказ о запуске летней сессии",
  "Договор на обновление LMS",
  "Заявка на аудит кабинетов",
  "Черновик регламента деканата",
  "Архивный акт приемки оборудования",
  "Согласование учебного календаря",
  "Отчет о выполнении закупок",
  "Служебная записка по расписанию",
  "Заявка на доступ к электронному журналу",
  "Договор на техническую поддержку",
  "Возврат заявки на командировку",
  "Приказ о составе комиссии",
  "Акт сверки с поставщиком",
  "Служебная записка по ремонту аудиторий",
  "Черновик положения о практике",
  "Архив договора с подрядчиком",
  "Заявка на согласование мероприятия",
  "Отчет по исполнению поручения",
  "Возвращенный приказ по кафедре",
  "Согласованный акт инвентаризации",
];

function makeFiles(index: number) {
  if (index % 5 === 0) return [];
  const main = {
    id: `file-${index}-1`,
    name: `esu-document-${index}.pdf`,
    size: 850_000 + index * 45_000,
    type: "application/pdf",
    url: "#",
    uploadedAt: `2026-08-${String(Math.min(index, 9) + 1).padStart(2, "0")}`,
  };
  const extra = {
    id: `file-${index}-2`,
    name: `appendix-${index}.docx`,
    size: 420_000 + index * 12_000,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    url: "#",
    uploadedAt: main.uploadedAt,
  };
  return index % 3 === 0 ? [main, extra] : [main];
}

export const documents: Document[] = titles.map((title, index) => {
  const status = statuses[index];
  const category = categories[index % categories.length];
  const author = users[index % users.length];
  const responsible = users[(index + 1) % users.length];
  const department = departments[index % departments.length];
  const createdDay = String((index % 24) + 1).padStart(2, "0");
  const deadlineDay = String(((index + 7) % 26) + 1).padStart(2, "0");
  const currentStage =
    status === "draft"
      ? "Черновик у автора"
      : status === "returned"
        ? "Доработка автором"
        : status === "approved" || status === "completed"
          ? "Финальный этап"
          : status === "archived"
            ? "Архив"
            : "Согласование руководителем";

  return {
    id: `doc-${index + 1}`,
    number: `ESU-2026-${String(index + 1).padStart(3, "0")}`,
    title,
    category,
    type: index % 2 === 0 ? "Внутренний документ" : "Внешний документ",
    description:
      "Mock-документ для демонстрации пользовательского сценария: создание, согласование, возврат, комментарии и контроль дедлайна.",
    author,
    department,
    responsible,
    createdAt: `2026-07-${createdDay}`,
    deadline: `2026-08-${deadlineDay}`,
    status,
    priority: index % 5 === 0 ? "urgent" : index % 3 === 0 ? "high" : index % 2 === 0 ? "normal" : "low",
    files: makeFiles(index + 1),
    approvalSteps: [
      {
        id: `step-${index + 1}-1`,
        approver: users[1],
        status: status === "draft" ? "pending" : "approved",
        date: status === "draft" ? undefined : `2026-07-${createdDay}`,
      },
      {
        id: `step-${index + 1}-2`,
        approver: users[4],
        status: status === "returned" ? "returned" : status === "approved" || status === "completed" ? "approved" : "pending",
        comment: status === "returned" ? "Нужно уточнить обоснование и вложения." : undefined,
      },
    ],
    comments:
      index % 4 === 0
        ? [
            {
              id: `comment-${index + 1}`,
              author: responsible,
              text: "Проверил данные, ожидаю финальное вложение.",
              createdAt: `2026-07-${createdDay}`,
            },
          ]
        : [],
    history: [
      "Документ создан",
      status === "draft" ? "Сохранен как черновик" : "Отправлен на согласование",
      status === "returned" ? "Возвращен на доработку" : currentStage,
    ],
    currentStage,
    returnReason: status === "returned" ? "Нужно уточнить список согласующих и приложить обновленный файл." : undefined,
  };
});

export const mockNotifications: Notification[] = [
  {
    id: "notification-1",
    type: "sent",
    title: "Документ отправлен",
    message: "Приказ о запуске летней сессии отправлен на согласование.",
    time: "Сегодня, 10:30",
    isRead: false,
    documentId: "doc-1",
  },
  {
    id: "notification-2",
    type: "deadline",
    title: "Приближается дедлайн",
    message: "У договора на обновление LMS дедлайн завтра.",
    time: "Сегодня, 11:05",
    isRead: false,
    documentId: "doc-2",
  },
  {
    id: "notification-3",
    type: "comment",
    title: "Добавлен комментарий",
    message: "Новый комментарий в заявке на аудит кабинетов.",
    time: "Вчера, 16:20",
    isRead: true,
    documentId: "doc-3",
  },
  {
    id: "notification-4",
    type: "returned",
    title: "Документ возвращен",
    message: "Заявка требует доработки перед повторной отправкой.",
    time: "Вчера, 15:10",
    isRead: false,
    documentId: "doc-11",
  },
  {
    id: "notification-5",
    type: "approved",
    title: "Документ согласован",
    message: "Учебный календарь прошел согласование.",
    time: "08.08.2026, 09:40",
    isRead: true,
    documentId: "doc-6",
  },
  {
    id: "notification-6",
    type: "overdue",
    title: "Документ просрочен",
    message: "Срок согласования договора на поддержку истек.",
    time: "07.08.2026, 18:00",
    isRead: false,
    documentId: "doc-10",
  },
  {
    id: "notification-7",
    type: "assigned",
    title: "Назначен ответственный",
    message: "Вы назначены ответственным по мероприятию.",
    time: "06.08.2026, 12:15",
    isRead: true,
    documentId: "doc-17",
  },
  {
    id: "notification-8",
    type: "system",
    title: "Обновлены правила файлов",
    message: "Максимальный размер файла для документов: 25 MB.",
    time: "05.08.2026, 14:05",
    isRead: true,
  },
  {
    id: "notification-9",
    type: "approved",
    title: "Акт согласован",
    message: "Акт инвентаризации готов к исполнению.",
    time: "04.08.2026, 10:00",
    isRead: false,
    documentId: "doc-20",
  },
  {
    id: "notification-10",
    type: "comment",
    title: "Новый комментарий",
    message: "Канцелярия оставила комментарий к служебной записке.",
    time: "03.08.2026, 17:45",
    isRead: true,
    documentId: "doc-14",
  },
];

export const mockRoles = [
  { id: "admin", name: "Администратор системы", description: "Полный доступ ко всем модулям и настройкам", usersCount: 1 },
  { id: "department_head", name: "Руководитель", description: "Согласование и утверждение документов", usersCount: 1 },
  { id: "approver", name: "Согласующий / Контролер", description: "Проверка финансовых и юридических аспектов", usersCount: 1 },
  { id: "employee", name: "Сотрудник", description: "Создание и отправка внутренних документов", usersCount: 2 },
];

import { useDeferredValue, useReducer } from "react";
import { Eye, Pencil, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StateBlock } from "@/components/ui/StateBlock";
import { useCategories } from "@/hooks/useCategories";
import { useDepartments } from "@/hooks/useDepartments";
import { useDocuments } from "@/hooks/useDocuments";
import { useUsers } from "@/hooks/useUsers";
import type {
  DocumentListScope,
  DocumentOrdering,
  DocumentsParams,
} from "@/services/endpoints/documents.api";
import type { DocumentListItem, DocumentStatus } from "@/types";
import { formatDate, statusLabels } from "@/utils/format";

interface DocumentTableProps {
  scope: DocumentListScope;
  fixedStatus?: DocumentStatus;
}

export interface DocumentListState {
  search: string;
  status: DocumentStatus | "all";
  category: string;
  department: string;
  author: string;
  createdFrom: string;
  createdTo: string;
  ordering: DocumentOrdering;
  page: number;
  pageSize: number;
}

type DocumentFilterField =
  | "search"
  | "status"
  | "category"
  | "department"
  | "author"
  | "createdFrom"
  | "createdTo";

export type DocumentListAction =
  | { type: "filter"; field: DocumentFilterField; value: string }
  | { type: "ordering"; value: DocumentOrdering }
  | { type: "page"; value: number }
  | { type: "pageSize"; value: number }
  | { type: "reset"; fixedStatus?: DocumentStatus };

export function createDocumentListState(fixedStatus?: DocumentStatus): DocumentListState {
  return {
    search: "",
    status: fixedStatus ?? "all",
    category: "",
    department: "",
    author: "",
    createdFrom: "",
    createdTo: "",
    ordering: "-created_at",
    page: 1,
    pageSize: 20,
  };
}

export function documentListReducer(
  state: DocumentListState,
  action: DocumentListAction,
): DocumentListState {
  if (action.type === "filter") {
    return { ...state, [action.field]: action.value, page: 1 };
  }
  if (action.type === "ordering") {
    return { ...state, ordering: action.value, page: 1 };
  }
  if (action.type === "pageSize") {
    return { ...state, pageSize: action.value, page: 1 };
  }
  if (action.type === "page") {
    return { ...state, page: action.value };
  }
  return createDocumentListState(action.fixedStatus);
}

function DocumentActions({ document }: { document: DocumentListItem }) {
  return (
    <div className="table-actions">
      <Link className="icon-button" to={`/documents/${document.id}`} aria-label={`Открыть ${document.title}`}>
        <Eye size={17} />
      </Link>
      {(["draft", "returned"] as DocumentStatus[]).includes(document.status) && (
        <Link
          className="icon-button"
          to={`/documents/${document.id}/edit`}
          aria-label={`Редактировать ${document.title}`}
        >
          <Pencil size={17} />
        </Link>
      )}
    </div>
  );
}

export function DocumentTable({ scope, fixedStatus }: DocumentTableProps) {
  const { data: categories = [] } = useCategories();
  const { data: departments = [] } = useDepartments();
  const { data: users = [] } = useUsers();
  const [state, dispatch] = useReducer(documentListReducer, fixedStatus, createDocumentListState);
  const deferredSearch = useDeferredValue(state.search);
  const params: DocumentsParams = {
    scope,
    search: deferredSearch,
    status: state.status === "all" ? undefined : state.status,
    category: state.category || undefined,
    department: state.department || undefined,
    author: state.author || undefined,
    createdFrom: state.createdFrom || undefined,
    createdTo: state.createdTo || undefined,
    ordering: state.ordering,
    page: state.page,
    pageSize: state.pageSize,
  };
  const { data, isError, isFetching, isLoading, refetch } = useDocuments(params);

  if (isLoading) {
    return <StateBlock title="Загружаем документы" description="Получаем страницу документов с сервера." />;
  }

  if (isError || !data) {
    return (
      <StateBlock
        title="Не удалось загрузить документы"
        description="Сервер не вернул список документов."
        action={<Button onClick={() => void refetch()}>Повторить</Button>}
      />
    );
  }

  const pageCount = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="content-card document-table-card">
      <div className="document-filter-grid" aria-label="Фильтры документов">
        <Input
          label="Поиск"
          aria-label="Поиск документов"
          placeholder="Номер, название или описание"
          value={state.search}
          onChange={(event) => dispatch({ type: "filter", field: "search", value: event.target.value })}
        />
        <Select
          label="Категория"
          value={state.category}
          options={[
            { value: "", label: "Все категории" },
            ...categories.map((category) => ({ value: category.id, label: category.name })),
          ]}
          onChange={(event) => dispatch({ type: "filter", field: "category", value: event.target.value })}
        />
        <Select
          label="Статус"
          disabled={Boolean(fixedStatus)}
          value={state.status}
          options={[
            { value: "all", label: "Все статусы" },
            ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
          ]}
          onChange={(event) => dispatch({ type: "filter", field: "status", value: event.target.value })}
        />
        <Select
          label="Подразделение"
          value={state.department}
          options={[
            { value: "", label: "Все подразделения" },
            ...departments.map((department) => ({ value: department.id, label: department.name })),
          ]}
          onChange={(event) => dispatch({ type: "filter", field: "department", value: event.target.value })}
        />
        <Select
          label="Автор"
          value={state.author}
          options={[
            { value: "", label: "Все авторы" },
            ...users.map((user) => ({ value: user.id, label: user.name })),
          ]}
          onChange={(event) => dispatch({ type: "filter", field: "author", value: event.target.value })}
        />
        <Input
          label="Создан от"
          type="date"
          value={state.createdFrom}
          onChange={(event) => dispatch({ type: "filter", field: "createdFrom", value: event.target.value })}
        />
        <Input
          label="Создан до"
          type="date"
          value={state.createdTo}
          onChange={(event) => dispatch({ type: "filter", field: "createdTo", value: event.target.value })}
        />
        <Select
          label="Сортировка"
          value={state.ordering}
          options={[
            { value: "-created_at", label: "Сначала новые" },
            { value: "created_at", label: "Сначала старые" },
            { value: "deadline", label: "Дедлайн: раньше" },
            { value: "-deadline", label: "Дедлайн: позже" },
            { value: "title", label: "Название: А–Я" },
            { value: "-title", label: "Название: Я–А" },
          ]}
          onChange={(event) => dispatch({ type: "ordering", value: event.target.value as DocumentOrdering })}
        />
        <Select
          label="На странице"
          value={state.pageSize}
          options={[
            { value: 10, label: "10" },
            { value: 20, label: "20" },
            { value: 50, label: "50" },
          ]}
          onChange={(event) => dispatch({ type: "pageSize", value: Number(event.target.value) })}
        />
        <div className="document-filter-actions">
          <Button
            variant="ghost"
            icon={<RotateCcw size={17} />}
            onClick={() => dispatch({ type: "reset", fixedStatus })}
          >
            Сбросить
          </Button>
        </div>
      </div>

      <div className="documents-result-line" aria-live="polite">
        Всего {data.total}. На странице {data.data.length}.{isFetching ? " Обновляем…" : ""}
      </div>

      {data.data.length === 0 ? (
        <StateBlock title="Документов нет" description="Сервер не нашёл документы по выбранным фильтрам." />
      ) : (
        <>
          <div className="responsive-table document-desktop-table">
            <table>
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Автор</th>
                  <th>Подразделение</th>
                  <th>Текущий этап</th>
                  <th>Ответственный</th>
                  <th>Создан</th>
                  <th>Дедлайн</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((document) => (
                  <tr key={document.id}>
                    <td>{document.number}</td>
                    <td><strong>{document.title}</strong></td>
                    <td>{document.category.name}</td>
                    <td>{document.author.name}</td>
                    <td>{document.department.name}</td>
                    <td>{document.currentStage}</td>
                    <td>{document.responsible?.name ?? "Не назначен"}</td>
                    <td>{formatDate(document.createdAt)}</td>
                    <td>{formatDate(document.deadline ?? undefined)}</td>
                    <td><StatusBadge status={document.status} /></td>
                    <td><DocumentActions document={document} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="document-mobile-list">
            {data.data.map((document) => (
              <article className="document-mobile-card" key={document.id}>
                <div>
                  <span>{document.number}</span>
                  <StatusBadge status={document.status} />
                </div>
                <h3>{document.title}</h3>
                <p>{document.category.name} · {document.department.name}</p>
                <dl>
                  <div><dt>Этап</dt><dd>{document.currentStage}</dd></div>
                  <div><dt>Ответственный</dt><dd>{document.responsible?.name ?? "Не назначен"}</dd></div>
                  <div><dt>Дедлайн</dt><dd>{formatDate(document.deadline ?? undefined)}</dd></div>
                </dl>
                <div className="document-mobile-actions">
                  <Link to={`/documents/${document.id}`}>
                    <Button variant="secondary" icon={<Eye size={16} />}>Открыть</Button>
                  </Link>
                  {(["draft", "returned"] as DocumentStatus[]).includes(document.status) && (
                    <Link to={`/documents/${document.id}/edit`}>
                      <Button variant="ghost" icon={<Pencil size={16} />}>Изменить</Button>
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>

          <nav className="pagination" aria-label="Пагинация документов">
            <Button
              variant="ghost"
              disabled={!data.previous}
              onClick={() => dispatch({ type: "page", value: state.page - 1 })}
            >
              Назад
            </Button>
            <span>{state.page} / {pageCount}</span>
            <Button
              variant="ghost"
              disabled={!data.next}
              onClick={() => dispatch({ type: "page", value: state.page + 1 })}
            >
              Вперёд
            </Button>
          </nav>
        </>
      )}
    </div>
  );
}

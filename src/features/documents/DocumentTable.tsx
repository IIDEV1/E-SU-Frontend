import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownUp, Eye, Pencil, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { StateBlock } from "@/components/ui/StateBlock";
import { useCategories } from "@/hooks/useCategories";
import { useDepartments } from "@/hooks/useDepartments";
import { useUsers } from "@/hooks/useUsers";
import type { Document, DocumentStatus } from "@/types";
import { formatDate, statusLabels } from "@/utils/format";

interface DocumentTableProps {
  documents: Document[];
  isLoading?: boolean;
  isError?: boolean;
  fixedStatus?: DocumentStatus;
}

type SortDirection = "asc" | "desc";

export function DocumentTable({ documents, fixedStatus, isError, isLoading }: DocumentTableProps) {
  const { data: categories = [] } = useCategories();
  const { data: departments = [] } = useDepartments();
  const { data: users = [] } = useUsers();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<DocumentStatus | "all">(fixedStatus ?? "all");
  const [categoryId, setCategoryId] = useState("all");
  const [departmentId, setDepartmentId] = useState("all");
  const [authorId, setAuthorId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const resetFilters = () => {
    setQuery("");
    setStatus(fixedStatus ?? "all");
    setCategoryId("all");
    setDepartmentId("all");
    setAuthorId("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const filteredDocuments = useMemo(() => {
    return documents
      .filter((document) => (status === "all" ? true : document.status === status))
      .filter((document) => (categoryId === "all" ? true : document.category.id === categoryId))
      .filter((document) => (departmentId === "all" ? true : document.department.id === departmentId))
      .filter((document) => (authorId === "all" ? true : document.author.id === authorId))
      .filter((document) => (dateFrom ? document.createdAt >= dateFrom : true))
      .filter((document) => (dateTo ? document.createdAt <= dateTo : true))
      .filter((document) => {
        const normalizedQuery = query.toLowerCase().trim();
        return normalizedQuery
          ? [
              document.title,
              document.number,
              document.category.name,
              document.author.name,
              document.department.name,
              document.responsible.name,
            ].some((value) => value.toLowerCase().includes(normalizedQuery))
          : true;
      })
      .sort((first, second) =>
        sortDirection === "asc"
          ? first.deadline.localeCompare(second.deadline)
          : second.deadline.localeCompare(first.deadline),
      );
  }, [authorId, categoryId, dateFrom, dateTo, departmentId, documents, query, sortDirection, status]);

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageDocuments = filteredDocuments.slice((safePage - 1) * pageSize, safePage * pageSize);

  if (isLoading) {
    return <StateBlock title="Загружаем документы" description="Получаем список и применяем фильтры." />;
  }

  if (isError) {
    return <StateBlock title="Не удалось загрузить" description="Проверьте подключение или повторите позже." />;
  }

  return (
    <div className="content-card document-table-card">
      <div className="document-filter-grid">
        <label>
          Поиск
          <input
            aria-label="Поиск документов"
            placeholder="Номер, название, автор, подразделение"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          Категория
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Все категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Статус
          <select
            disabled={Boolean(fixedStatus)}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as DocumentStatus | "all");
              setPage(1);
            }}
          >
            <option value="all">Все статусы</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Подразделение
          <select
            value={departmentId}
            onChange={(event) => {
              setDepartmentId(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Все подразделения</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Автор
          <select
            value={authorId}
            onChange={(event) => {
              setAuthorId(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Все авторы</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          От
          <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        </label>
        <label>
          До
          <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        </label>
        <div className="document-filter-actions">
          <Button
            variant="secondary"
            icon={<ArrowDownUp size={17} />}
            onClick={() => setSortDirection((value) => (value === "asc" ? "desc" : "asc"))}
          >
            Дедлайн {sortDirection === "asc" ? "↑" : "↓"}
          </Button>
          <Button variant="ghost" icon={<RotateCcw size={17} />} onClick={resetFilters}>
            Сбросить
          </Button>
        </div>
      </div>

      <div className="documents-result-line">Показано {filteredDocuments.length} документов</div>

      {pageDocuments.length === 0 ? (
        <StateBlock title="Документов нет" description="По текущим фильтрам ничего не найдено." />
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
                {pageDocuments.map((document) => (
                  <tr key={document.id}>
                    <td>{document.number}</td>
                    <td>
                      <strong>{document.title}</strong>
                    </td>
                    <td>{document.category.name}</td>
                    <td>{document.author.name}</td>
                    <td>{document.department.name}</td>
                    <td>{document.currentStage}</td>
                    <td>{document.responsible.name}</td>
                    <td>{formatDate(document.createdAt)}</td>
                    <td>{formatDate(document.deadline)}</td>
                    <td>
                      <StatusBadge status={document.status} />
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link className="icon-button" to={`/documents/${document.id}`} aria-label="Открыть">
                          <Eye size={17} />
                        </Link>
                        {["draft", "returned"].includes(document.status) && (
                          <Link className="icon-button" to={`/documents/${document.id}/edit`} aria-label="Редактировать">
                            <Pencil size={17} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="document-mobile-list">
            {pageDocuments.map((document) => (
              <article className="document-mobile-card" key={document.id}>
                <div>
                  <span>{document.number}</span>
                  <StatusBadge status={document.status} />
                </div>
                <h3>{document.title}</h3>
                <p>{document.category.name} · {document.department.name}</p>
                <dl>
                  <div>
                    <dt>Этап</dt>
                    <dd>{document.currentStage}</dd>
                  </div>
                  <div>
                    <dt>Дедлайн</dt>
                    <dd>{formatDate(document.deadline)}</dd>
                  </div>
                </dl>
                <div className="document-mobile-actions">
                  <Link to={`/documents/${document.id}`}>
                    <Button variant="secondary" icon={<Eye size={16} />}>
                      Открыть
                    </Button>
                  </Link>
                  {["draft", "returned"].includes(document.status) && (
                    <Link to={`/documents/${document.id}/edit`}>
                      <Button variant="ghost" icon={<Pencil size={16} />}>
                        Изменить
                      </Button>
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="pagination">
            <Button variant="ghost" disabled={safePage === 1} onClick={() => setPage((value) => value - 1)}>
              Назад
            </Button>
            <span>
              {safePage} / {totalPages}
            </span>
            <Button variant="ghost" disabled={safePage === totalPages} onClick={() => setPage((value) => value + 1)}>
              Вперед
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

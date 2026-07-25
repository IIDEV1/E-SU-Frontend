import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownUp, Eye, Pencil } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { StateBlock } from "@/components/ui/StateBlock";
import type { Document, DocumentStatus } from "@/types";
import { formatDate, statusLabels } from "@/utils/format";

interface DocumentTableProps {
  documents: Document[];
  isLoading?: boolean;
  isError?: boolean;
  fixedStatus?: DocumentStatus;
}

export function DocumentTable({ documents, fixedStatus, isError, isLoading }: DocumentTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<DocumentStatus | "all">(fixedStatus ?? "all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredDocuments = useMemo(() => {
    return documents
      .filter((document) => (status === "all" ? true : document.status === status))
      .filter((document) => {
        const normalizedQuery = query.toLowerCase().trim();
        return normalizedQuery
          ? [document.title, document.number, document.category.name, document.author.name].some(
              (value) => value.toLowerCase().includes(normalizedQuery),
            )
          : true;
      })
      .sort((first, second) =>
        sortDirection === "asc"
          ? first.deadline.localeCompare(second.deadline)
          : second.deadline.localeCompare(first.deadline),
      );
  }, [documents, query, sortDirection, status]);

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / pageSize));
  const pageDocuments = filteredDocuments.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) {
    return (
      <StateBlock title="Загружаем документы" description="Получаем список и применяем фильтры." />
    );
  }

  if (isError) {
    return (
      <StateBlock
        title="Не удалось загрузить"
        description="Проверьте подключение или повторите позже."
      />
    );
  }

  return (
    <div className="content-card document-table-card">
      <div className="table-toolbar">
        <input
          aria-label="Поиск документов"
          placeholder="Поиск по номеру, названию, автору"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
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
        <button
          className="button button--secondary"
          type="button"
          onClick={() => setSortDirection((value) => (value === "asc" ? "desc" : "asc"))}
        >
          <ArrowDownUp size={17} />
          <span>Дедлайн</span>
        </button>
      </div>

      {pageDocuments.length === 0 ? (
        <StateBlock title="Документов нет" description="По текущим фильтрам ничего не найдено." />
      ) : (
        <>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Автор</th>
                  <th>Подразделение</th>
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
                    <td>{document.responsible.name}</td>
                    <td>{formatDate(document.createdAt)}</td>
                    <td>{formatDate(document.deadline)}</td>
                    <td>
                      <StatusBadge status={document.status} />
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          className="icon-button"
                          to={`/documents/${document.id}`}
                          aria-label="Открыть"
                        >
                          <Eye size={17} />
                        </Link>
                        <Link
                          className="icon-button"
                          to={`/documents/${document.id}/edit`}
                          aria-label="Редактировать"
                        >
                          <Pencil size={17} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button
              className="button button--ghost"
              type="button"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Назад
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              className="button button--ghost"
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Вперед
            </button>
          </div>
        </>
      )}
    </div>
  );
}

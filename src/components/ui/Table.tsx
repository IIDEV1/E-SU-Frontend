import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  align?: "left" | "center" | "right";
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function Table<T extends { id: string | number }>({ columns, data, isLoading, emptyMessage = "Данные не найдены", className = "" }: TableProps<T>) {
  if (isLoading) return <div className="ui-table-state">Загрузка...</div>;
  if (!data.length) return <div className="ui-table-state">{emptyMessage}</div>;
  return <div className={`ui-responsive-table ${className}`}><table className="ui-table"><thead><tr>{columns.map((column, index) => <th key={index} className={`ui-table__cell ui-table__cell--${column.align ?? "left"}`}>{column.header}</th>)}</tr></thead><tbody>{data.map((row) => <tr key={row.id}>{columns.map((column, index) => <td key={index} className={`ui-table__cell ui-table__cell--${column.align ?? "left"}`}>{typeof column.accessor === "function" ? column.accessor(row) : (row[column.accessor] as ReactNode)}</td>)}</tr>)}</tbody></table></div>;
}

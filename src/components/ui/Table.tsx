import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  width?: string; // Для жесткой фиксации ширины
  align?: 'left' | 'center' | 'right'; // Для выравнивания (например, колонки действий)
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  emptyMessage = 'Данные не найдены',
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-fog)' }}>
        Загрузка...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-fog)' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-cloud)' }}>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                style={{ 
                  width: col.width || 'auto',
                  padding: '12px 8px', 
                  textAlign: col.align || 'left',
                  color: 'var(--color-fog)',
                  fontWeight: 500,
                  fontSize: '13px'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} style={{ borderBottom: '1px solid var(--color-cloud)' }}>
              {columns.map((col, idx) => (
                <td 
                  key={idx} 
                  style={{ 
                    padding: '12px 8px', 
                    textAlign: col.align || 'left',
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    color: 'var(--color-obsidian)'
                  }}
                >
                  {typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : (row[col.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
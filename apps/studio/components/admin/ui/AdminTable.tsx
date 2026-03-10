'use client';

import type { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export default function AdminTable<T>({ columns, data, keyField, emptyMessage = 'No data found.', onRowClick }: AdminTableProps<T>) {
  if (data.length === 0) {
    return <div className="bg-white border border-gray-200 p-12 text-center"><p className="text-sm text-gray-500">{emptyMessage}</p></div>;
  }

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr key={String(item[keyField])} className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`} onClick={() => onRowClick?.(item)}>
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-sm ${col.className || ''}`}>{col.render(item)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

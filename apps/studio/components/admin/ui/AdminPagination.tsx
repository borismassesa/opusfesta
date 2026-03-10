'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 border-t-0">
      <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

'use client';

import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

export default function AdminPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border border-[var(--admin-border)] border-t-0 bg-[var(--admin-card)] px-4 py-3">
      <p className="text-xs text-[var(--admin-muted)]">Page {page} of {totalPages}</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 text-[var(--admin-muted)] transition-colors hover:text-[var(--admin-primary)] disabled:opacity-30"
        >
          <BsChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 text-[var(--admin-muted)] transition-colors hover:text-[var(--admin-primary)] disabled:opacity-30"
        >
          <BsChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

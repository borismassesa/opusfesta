'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { BsX } from 'react-icons/bs';
import AdminButton from './AdminButton';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function AdminModal({ open, onClose, title, children, actions }: AdminModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,26,26,0.42)] backdrop-blur-sm" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="mx-4 w-full max-w-lg border border-[var(--admin-border)] bg-[var(--admin-background)] shadow-[var(--admin-shadow-lg)]">
        <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-6 py-4">
          <h2 className="text-lg font-bold text-[var(--admin-foreground)]">{title}</h2>
          <button onClick={onClose} className="p-1 text-[var(--admin-muted)] transition-colors hover:text-[var(--admin-primary)]"><BsX className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {actions && <div className="flex justify-end gap-3 border-t border-[var(--admin-border)] bg-[var(--admin-secondary)] px-6 py-4">{actions}</div>}
      </div>
    </div>
  );
}

export function ConfirmDeleteModal({ open, onClose, onConfirm, title, description, loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; loading?: boolean;
}) {
  return (
    <AdminModal open={open} onClose={onClose} title={title} actions={<><AdminButton variant="secondary" onClick={onClose}>Cancel</AdminButton><AdminButton variant="danger" onClick={onConfirm} loading={loading}>Delete</AdminButton></>}>
      <p className="text-sm text-[var(--admin-accent-foreground)]">{description}</p>
    </AdminModal>
  );
}

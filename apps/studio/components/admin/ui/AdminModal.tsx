'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
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
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="bg-white w-full max-w-lg mx-4 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {actions && <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">{actions}</div>}
      </div>
    </div>
  );
}

export function ConfirmDeleteModal({ open, onClose, onConfirm, title, description, loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string; loading?: boolean;
}) {
  return (
    <AdminModal open={open} onClose={onClose} title={title} actions={<><AdminButton variant="secondary" onClick={onClose}>Cancel</AdminButton><AdminButton variant="danger" onClick={onConfirm} loading={loading}>Delete</AdminButton></>}>
      <p className="text-sm text-gray-600">{description}</p>
    </AdminModal>
  );
}

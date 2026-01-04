'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'loading';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'loading', duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'loading' = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    // Auto-remove after duration (except for loading toasts)
    if (type !== 'loading') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Connect to the toast utility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/lib/toast').then(({ setToastInstance }) => {
        setToastInstance({
          success: (message: string, duration?: number) => addToast(message, 'success', duration),
          error: (message: string, duration?: number) => addToast(message, 'error', duration),
          info: (message: string, duration?: number) => addToast(message, 'info', duration),
          loading: (message: string) => addToast(message, 'loading'),
        });
      });
    }
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    loading: Loader2,
  };

  const styles = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
    loading: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full fade-in-0 zoom-in-95 pointer-events-auto',
        'backdrop-blur-sm',
        styles[toast.type]
      )}
      role="alert"
    >
      <Icon 
        className={cn(
          "h-5 w-5 flex-shrink-0 mt-0.5",
          toast.type === 'loading' && "animate-spin"
        )} 
      />
      <p className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
      {toast.type !== 'loading' && (
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity rounded-sm p-0.5 hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Close toast"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

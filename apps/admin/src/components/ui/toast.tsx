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
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-100 shadow-emerald-100 dark:shadow-emerald-950',
    error: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-900 dark:text-red-100 shadow-red-100 dark:shadow-red-950',
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-100 shadow-blue-100 dark:shadow-blue-950',
    loading: 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800/50 text-gray-900 dark:text-gray-100 shadow-gray-100 dark:shadow-gray-950',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border-2 shadow-xl animate-in slide-in-from-right-full fade-in-0 zoom-in-95 pointer-events-auto',
        'backdrop-blur-md transition-all duration-300 hover:shadow-2xl',
        styles[toast.type]
      )}
      role="alert"
    >
      <div className={cn(
        "flex-shrink-0 rounded-full p-1.5",
        toast.type === 'success' && "bg-emerald-100 dark:bg-emerald-900/50",
        toast.type === 'error' && "bg-red-100 dark:bg-red-900/50",
        toast.type === 'info' && "bg-blue-100 dark:bg-blue-900/50",
        toast.type === 'loading' && "bg-gray-100 dark:bg-gray-900/50"
      )}>
        <Icon 
          className={cn(
            "h-4 w-4",
            toast.type === 'success' && "text-emerald-600 dark:text-emerald-400",
            toast.type === 'error' && "text-red-600 dark:text-red-400",
            toast.type === 'info' && "text-blue-600 dark:text-blue-400",
            toast.type === 'loading' && "text-gray-600 dark:text-gray-400",
            toast.type === 'loading' && "animate-spin"
          )} 
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-relaxed break-words">{toast.message}</p>
      </div>
      {toast.type !== 'loading' && (
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity rounded-md p-1 hover:bg-black/10 dark:hover:bg-white/10"
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

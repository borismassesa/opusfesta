import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, Ref } from 'react';

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  ref?: Ref<HTMLInputElement>;
}

export function AdminInput({ label, error, hint, id, className = '', ref, ...props }: AdminInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--admin-accent-foreground)]">{label}</label>
      <input
        ref={ref} id={inputId}
        className={`w-full border px-3 py-2.5 text-sm text-[var(--admin-card-foreground)] transition-colors focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)] ${error ? 'border-[rgba(239,67,67,0.35)] bg-[rgba(239,67,67,0.06)]' : 'border-[var(--admin-input)] bg-[var(--admin-card)]'} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[var(--admin-destructive)]">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--admin-muted)]">{hint}</p>}
    </div>
  );
}

interface AdminTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function AdminTextarea({ label, error, id, className = '', ref, ...props }: AdminTextareaProps) {
  const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      <label htmlFor={textareaId} className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--admin-accent-foreground)]">{label}</label>
      <textarea
        ref={ref} id={textareaId} rows={4}
        className={`w-full border px-3 py-2.5 text-sm text-[var(--admin-card-foreground)] transition-colors focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)] ${error ? 'border-[rgba(239,67,67,0.35)] bg-[rgba(239,67,67,0.06)]' : 'border-[var(--admin-input)] bg-[var(--admin-card)]'} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[var(--admin-destructive)]">{error}</p>}
    </div>
  );
}

interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  ref?: Ref<HTMLSelectElement>;
}

export function AdminSelect({ label, error, options, id, className = '', ref, ...props }: AdminSelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--admin-accent-foreground)]">{label}</label>
      <select
        ref={ref} id={selectId}
        className={`w-full border px-3 py-2.5 text-sm text-[var(--admin-card-foreground)] transition-colors focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)] ${error ? 'border-[rgba(239,67,67,0.35)] bg-[rgba(239,67,67,0.06)]' : 'border-[var(--admin-input)] bg-[var(--admin-card)]'} ${className}`}
        {...props}
      >
        {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="text-xs text-[var(--admin-destructive)]">{error}</p>}
    </div>
  );
}

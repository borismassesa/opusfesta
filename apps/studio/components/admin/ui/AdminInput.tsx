import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
          ref={ref} id={inputId}
          className={`w-full px-3 py-2 border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    );
  }
);
AdminInput.displayName = 'AdminInput';

interface AdminTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea
          ref={ref} id={textareaId} rows={4}
          className={`w-full px-3 py-2 border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
AdminTextarea.displayName = 'AdminTextarea';

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ label, error, options, id, className = '', ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">{label}</label>
        <select
          ref={ref} id={selectId}
          className={`w-full px-3 py-2 border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'} ${className}`}
          {...props}
        >
          {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
AdminSelect.displayName = 'AdminSelect';

'use client';

import type { FieldDef } from '@/lib/cms/types/define';
import RichTextField from './fields/RichTextField';
import ImageField from './fields/ImageField';
import ArrayField from './fields/ArrayField';

interface FieldRendererProps {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  /** For array fields: per-item errors keyed as `${index}.${fieldName}` */
  itemErrors?: Record<string, string>;
  disabled?: boolean;
}

const baseInputClasses =
  'w-full px-3 py-2 bg-white border border-[var(--admin-sidebar-border)] text-[13px] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)] transition-colors disabled:bg-[var(--admin-sidebar-accent)] disabled:cursor-not-allowed';

export default function FieldRenderer({ field, value, onChange, error, itemErrors, disabled }: FieldRendererProps) {
  // Complex fields render their own label + error — dispatch and return early.
  if (field.type === 'richtext') {
    return <RichTextField field={field} value={value} onChange={onChange} error={error} disabled={disabled} />;
  }
  if (field.type === 'image') {
    return <ImageField field={field} value={value} onChange={onChange} error={error} disabled={disabled} />;
  }
  if (field.type === 'array') {
    return (
      <ArrayField
        field={field}
        value={value}
        onChange={onChange}
        error={error}
        itemErrors={itemErrors}
        disabled={disabled}
      />
    );
  }

  // Simple fields use a shared label + error shell.
  const labelElement = (
    <label htmlFor={field.name} className="block mb-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-foreground)]">
        {field.label}
      </span>
      {field.required && <span className="text-red-600 ml-1">*</span>}
    </label>
  );

  const helpElement = field.help ? (
    <p className="mt-1 text-[11px] text-[var(--admin-muted)]">{field.help}</p>
  ) : null;

  const errorElement = error ? (
    <p className="mt-1 text-[11px] text-red-600">{error}</p>
  ) : null;

  let input: React.ReactNode;

  switch (field.type) {
    case 'string': {
      input = (
        <input
          id={field.name}
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          disabled={disabled}
          className={baseInputClasses}
        />
      );
      break;
    }

    case 'text': {
      input = (
        <textarea
          id={field.name}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          rows={field.rows ?? 4}
          disabled={disabled}
          className={`${baseInputClasses} resize-y font-[inherit]`}
        />
      );
      break;
    }

    case 'number': {
      input = (
        <input
          id={field.name}
          type="number"
          value={value === null || value === undefined ? '' : Number(value)}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              onChange(null);
            } else {
              const n = Number(raw);
              onChange(Number.isNaN(n) ? null : n);
            }
          }}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          placeholder={field.placeholder}
          disabled={disabled}
          className={baseInputClasses}
        />
      );
      break;
    }

    case 'boolean': {
      input = (
        <div className="flex items-center gap-2">
          <input
            id={field.name}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 border-[var(--admin-sidebar-border)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)]"
          />
          <span className="text-[13px] text-[var(--admin-foreground)]">{field.placeholder ?? 'Enabled'}</span>
        </div>
      );
      break;
    }

    case 'select': {
      input = (
        <select
          id={field.name}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={baseInputClasses}
        >
          <option value="" disabled={field.required}>
            {field.placeholder ?? 'Select…'}
          </option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
      break;
    }

    case 'date': {
      input = (
        <input
          id={field.name}
          type={field.includeTime ? 'datetime-local' : 'date'}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
          className={baseInputClasses}
        />
      );
      break;
    }

    default: {
      const _exhaustive: never = field;
      input = <p className="text-[12px] text-red-600">Unknown field type: {JSON.stringify(_exhaustive)}</p>;
    }
  }

  return (
    <div>
      {labelElement}
      {input}
      {errorElement}
      {helpElement}
    </div>
  );
}

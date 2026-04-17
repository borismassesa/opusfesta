'use client';

import { BsPlus, BsTrash, BsChevronUp, BsChevronDown } from 'react-icons/bs';
import FieldRenderer from '../FieldRenderer';
import type { ArrayField as ArrayFieldDef, FieldDef } from '@/lib/cms/types/define';

type ItemValue = Record<string, unknown>;

interface ArrayFieldProps {
  field: ArrayFieldDef;
  value: unknown;
  onChange: (value: ItemValue[]) => void;
  error?: string;
  /** Per-item errors keyed as `${index}.${fieldName}` */
  itemErrors?: Record<string, string>;
  disabled?: boolean;
}

function coerceArray(value: unknown): ItemValue[] {
  if (Array.isArray(value)) return value as ItemValue[];
  return [];
}

function buildDefaultItem(itemFields: FieldDef[]): ItemValue {
  const item: ItemValue = {};
  for (const field of itemFields) {
    switch (field.type) {
      case 'string':
      case 'text':
        item[field.name] = field.default ?? '';
        break;
      case 'number':
        item[field.name] = field.default ?? null;
        break;
      case 'boolean':
        item[field.name] = field.default ?? false;
        break;
      case 'select':
        item[field.name] = field.default ?? '';
        break;
      case 'date':
        item[field.name] = field.default ?? '';
        break;
      case 'richtext':
        item[field.name] = { type: 'doc', content: [{ type: 'paragraph' }] };
        break;
      case 'image':
        item[field.name] = null;
        break;
      case 'array':
        item[field.name] = [];
        break;
    }
  }
  return item;
}

export default function ArrayField({ field, value, onChange, error, itemErrors, disabled }: ArrayFieldProps) {
  const items = coerceArray(value);

  const addItem = () => {
    if (field.maxItems && items.length >= field.maxItems) return;
    onChange([...items, buildDefaultItem(field.itemFields)]);
  };

  const removeItem = (idx: number) => {
    if (field.minItems && items.length <= field.minItems) return;
    onChange(items.filter((_, i) => i !== idx));
  };

  const moveItem = (idx: number, delta: -1 | 1) => {
    const target = idx + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const updateItemField = (idx: number, fieldName: string, nextValue: unknown) => {
    const next = items.map((item, i) => (i === idx ? { ...item, [fieldName]: nextValue } : item));
    onChange(next);
  };

  const atMax = field.maxItems != null && items.length >= field.maxItems;
  const atMin = field.minItems != null && items.length <= field.minItems;

  return (
    <div>
      <label className="block mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-foreground)]">
          {field.label}
        </span>
        {field.required && <span className="text-red-600 ml-1">*</span>}
        <span className="ml-2 text-[10px] font-mono text-[var(--admin-muted)]">
          {items.length}
          {field.maxItems ? ` / ${field.maxItems}` : ''}
        </span>
      </label>

      <div className="space-y-3">
        {items.length === 0 && (
          <div className="bg-[var(--admin-sidebar-accent)] border border-dashed border-[var(--admin-sidebar-border)] px-4 py-6 text-center">
            <p className="text-[12px] text-[var(--admin-muted)]">No {field.itemLabel.toLowerCase()}s yet.</p>
          </div>
        )}

        {items.map((item, idx) => (
          <div
            key={idx}
            className="border border-[var(--admin-sidebar-border)] bg-white"
          >
            {/* Item header */}
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--admin-sidebar-accent)] border-b border-[var(--admin-sidebar-border)]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-foreground)]">
                {field.itemLabel} {idx + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(idx, -1)}
                  disabled={disabled || idx === 0}
                  title="Move up"
                  className="inline-flex items-center justify-center w-6 h-6 text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <BsChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(idx, 1)}
                  disabled={disabled || idx === items.length - 1}
                  title="Move down"
                  className="inline-flex items-center justify-center w-6 h-6 text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <BsChevronDown className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  disabled={disabled || atMin}
                  title="Remove"
                  className="inline-flex items-center justify-center w-6 h-6 text-red-600 hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <BsTrash className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Item body */}
            <div className="px-4 py-3 space-y-4">
              {field.itemFields.map((subField) => (
                <FieldRenderer
                  key={subField.name}
                  field={subField}
                  value={item[subField.name]}
                  onChange={(v) => updateItemField(idx, subField.name, v)}
                  error={itemErrors?.[`${idx}.${subField.name}`]}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          disabled={disabled || atMax}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 border border-dashed border-[var(--admin-sidebar-border)] text-[12px] font-semibold text-[var(--admin-muted)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BsPlus className="w-4 h-4" />
          Add {field.itemLabel.toLowerCase()}
        </button>
      </div>

      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
      {field.help && <p className="mt-1 text-[11px] text-[var(--admin-muted)]">{field.help}</p>}
    </div>
  );
}

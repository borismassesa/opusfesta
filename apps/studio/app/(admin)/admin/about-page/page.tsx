'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { AdminInput, AdminTextarea } from '@/components/admin/ui/AdminInput';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import { BsSave, BsChevronDown, BsChevronRight, BsArrowRepeat, BsPlus, BsTrash, BsPeople } from 'react-icons/bs';

interface PageSection {
  id: string;
  page_key: string;
  section_key: string;
  content: Record<string, unknown>;
  sort_order: number;
}

interface SectionField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'string_list';
  hint?: string;
}

const SECTION_CONFIG: { key: string; label: string; fields: SectionField[] }[] = [
  {
    key: 'hero',
    label: 'Hero Section',
    fields: [
      { key: 'tagline', label: 'Tagline', type: 'text', hint: 'e.g. About' },
      { key: 'heading_line1', label: 'Heading Line 1', type: 'text', hint: 'e.g. THE TEAM' },
      { key: 'heading_line2', label: 'Heading Line 2 (stroke text)', type: 'text', hint: 'e.g. BEHIND THE WORK.' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    key: 'story',
    label: 'Studio Story / Values',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', hint: 'e.g. Our Philosophy' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'values', label: 'Values / Principles', type: 'string_list', hint: 'Add studio values one per row' },
    ],
  },
  {
    key: 'partners',
    label: 'Clients & Partners',
    fields: [
      { key: 'heading', label: 'Section Heading', type: 'text', hint: 'e.g. Notable Clients & Partners' },
      { key: 'names', label: 'Partner Names', type: 'string_list', hint: 'One name per row' },
    ],
  },
];

// ─── StringListEditor ────────────────────────────────────────────────

function StringListEditor({
  label,
  items,
  onChange,
  hint,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  hint?: string;
}) {
  const update = (idx: number, val: string) => {
    const next = [...items];
    next[idx] = val;
    onChange(next);
  };
  const add = () => onChange([...items, '']);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <p className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--admin-accent-foreground)]">{label}</p>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Item ${i + 1}`}
            className="flex-1 border border-[var(--admin-input)] bg-[var(--admin-card)] px-3 py-2 text-sm text-[var(--admin-card-foreground)] focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)]"
          />
          <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 transition-colors" title="Remove">
            <BsTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-xs font-medium text-[var(--admin-primary)] hover:underline">
        <BsPlus className="w-4 h-4" /> Add item
      </button>
      {hint && <p className="text-xs text-[var(--admin-muted)]">{hint}</p>}
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────

export default function AboutPageEditor() {
  const [sections, setSections] = useState<Record<string, Record<string, unknown>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['hero']));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    fetch('/api/admin/page-sections?page=about')
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, Record<string, unknown>> = {};
        (d.sections || []).forEach((s: PageSection) => {
          map[s.section_key] = s.content || {};
        });
        setSections(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleSection = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const updateField = useCallback((sectionKey: string, fieldKey: string, value: unknown) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [fieldKey]: value },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${sectionKey}.${fieldKey}`];
      return next;
    });
  }, []);

  const saveSection = useCallback(async (sectionKey: string, sortOrder: number) => {
    setSaving(sectionKey);
    try {
      const rawContent = sections[sectionKey] || {};
      const cleanContent: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rawContent)) {
        if (!k.startsWith('__raw_')) cleanContent[k] = v;
      }

      const res = await fetch('/api/admin/page-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_key: 'about',
          section_key: sectionKey,
          content: cleanContent,
          sort_order: sortOrder,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrors((prev) => ({ ...prev, [sectionKey]: data.error || 'Save failed' }));
        return;
      }
      await fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/about' }),
      });
      setSaved(sectionKey);
      setTimeout(() => setSaved((prev) => (prev === sectionKey ? null : prev)), 3000);
    } finally {
      setSaving(null);
    }
  }, [sections]);

  const getFieldValue = (sectionKey: string, fieldKey: string): string => {
    const content = sections[sectionKey];
    if (!content) return '';
    const val = content[fieldKey];
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
  };

  const publishChanges = useCallback(async () => {
    setPublishing(true);
    try {
      await fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/about' }),
      });
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    } finally {
      setPublishing(false);
    }
  }, []);

  if (loading) return <div className="bg-white border border-gray-200 h-64 animate-pulse" />;

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="About Page"
        description="Edit the hero text, studio story, and partner list for the public About page. Team members are managed separately."
        livePage={{ label: 'View About Page', href: '/about' }}
        tips={[
          'Each section can be edited and saved independently.',
          'Team members are managed in the Team section — click the link below to add or edit team profiles.',
          'The "Publish to Site" button force-refreshes cached pages if changes don\'t appear immediately.',
          'Partner names appear as styled badges on the About page.',
        ]}
      />

      {/* Team management shortcut */}
      <div className="flex items-center gap-3 border border-blue-200 bg-blue-50 px-5 py-3">
        <BsPeople className="h-4 w-4 text-blue-600 shrink-0" />
        <p className="text-xs text-blue-700">
          Team members shown on the About page are managed in the{' '}
          <Link href="/studio-admin/team" className="font-semibold underline hover:no-underline">
            Team section
          </Link>
          . Add, edit, reorder, or unpublish team profiles there.
        </p>
      </div>

      <div className="flex items-center justify-end mb-2">
        <div className="flex items-center gap-3">
          {published && <span className="text-xs text-green-600 font-medium">Published!</span>}
          <AdminButton
            onClick={publishChanges}
            loading={publishing}
            variant="secondary"
            size="sm"
            icon={<BsArrowRepeat className="w-3.5 h-3.5" />}
          >
            Publish to Site
          </AdminButton>
        </div>
      </div>

      {SECTION_CONFIG.map((config, idx) => {
        const isOpen = expanded.has(config.key);
        const isSaving = saving === config.key;
        const isSaved = saved === config.key;
        const sectionError = errors[config.key];

        return (
          <div key={config.key} className="bg-white border border-gray-200">
            <button
              type="button"
              onClick={() => toggleSection(config.key)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--admin-muted)]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="text-sm font-semibold text-[var(--admin-foreground)]">{config.label}</span>
                {isSaved && <span className="text-xs text-green-600 font-medium">Saved</span>}
              </div>
              {isOpen ? <BsChevronDown className="w-4 h-4 text-gray-400" /> : <BsChevronRight className="w-4 h-4 text-gray-400" />}
            </button>

            {isOpen && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
                {config.fields.map((field) => {
                  const errorKey = `${config.key}.${field.key}`;
                  const fieldError = errors[errorKey];

                  if (field.type === 'string_list') {
                    const items = Array.isArray(sections[config.key]?.[field.key])
                      ? (sections[config.key][field.key] as string[])
                      : [];
                    return (
                      <StringListEditor
                        key={field.key}
                        label={field.label}
                        items={items}
                        onChange={(updated) => updateField(config.key, field.key, updated)}
                        hint={field.hint}
                      />
                    );
                  }

                  if (field.type === 'textarea') {
                    return (
                      <AdminTextarea
                        key={field.key}
                        label={field.label}
                        value={getFieldValue(config.key, field.key)}
                        onChange={(e) => updateField(config.key, field.key, e.target.value)}
                        error={fieldError}
                      />
                    );
                  }

                  return (
                    <AdminInput
                      key={field.key}
                      label={field.label}
                      value={getFieldValue(config.key, field.key)}
                      onChange={(e) => updateField(config.key, field.key, e.target.value)}
                      error={fieldError}
                      placeholder={field.hint}
                    />
                  );
                })}

                {sectionError && (
                  <p className="text-xs text-[var(--admin-destructive)]">{sectionError}</p>
                )}

                <div className="flex items-center justify-end pt-2">
                  <AdminButton
                    onClick={() => saveSection(config.key, idx + 1)}
                    loading={isSaving}
                    icon={<BsSave className="w-3.5 h-3.5" />}
                    size="sm"
                  >
                    Save Section
                  </AdminButton>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

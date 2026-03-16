'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminInput, AdminTextarea } from '@/components/admin/ui/AdminInput';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminMediaUpload from '@/components/admin/ui/AdminMediaUpload';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import { BsSave, BsChevronDown, BsChevronRight, BsArrowRepeat, BsPlus, BsTrash } from 'react-icons/bs';

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
  type: 'text' | 'textarea' | 'image' | 'video' | 'image_list' | 'key_value_list' | 'string_list' | 'steps_list' | 'select' | 'range';
  hint?: string;
  valuePlaceholder?: string;
  labelPlaceholder?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
}

const SPEED_OPTIONS = [
  { label: '0.25x (Very Slow)', value: '0.25' },
  { label: '0.3x', value: '0.3' },
  { label: '0.4x', value: '0.4' },
  { label: '0.5x (Half Speed)', value: '0.5' },
  { label: '0.6x', value: '0.6' },
  { label: '0.75x', value: '0.75' },
  { label: '1x (Normal)', value: '1' },
];

const SECTION_CONFIG: { key: string; label: string; fields: SectionField[] }[] = [
  {
    key: 'hero',
    label: 'Hero Section',
    fields: [
      { key: 'tagline', label: 'Tagline', type: 'text' },
      { key: 'heading_line1', label: 'Heading Line 1', type: 'text' },
      { key: 'heading_line2', label: 'Heading Line 2', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image_url', label: 'Background Image', type: 'image', hint: 'Fallback if no video is set. Used as hero background when video is empty.' },
      { key: 'video_url', label: 'Background Video', type: 'video', hint: 'Takes priority over image when set' },
      { key: 'video_speed', label: 'Video Playback Speed', type: 'select', options: SPEED_OPTIONS, hint: 'Slower = more cinematic feel' },
      { key: 'video_start', label: 'Video Start Time (seconds)', type: 'range', min: 0, max: 300, step: 1, hint: 'Skip to this point when the video starts' },
      { key: 'video_end', label: 'Video End Time (seconds)', type: 'range', min: 0, max: 300, step: 1, hint: 'Loop back after this point (0 = play full video)' },
      { key: 'cta1_text', label: 'CTA 1 Text', type: 'text' },
      { key: 'cta1_url', label: 'CTA 1 URL', type: 'text' },
      { key: 'cta2_text', label: 'CTA 2 Text', type: 'text' },
      { key: 'cta2_url', label: 'CTA 2 URL', type: 'text' },
      { key: 'client_count', label: 'Client Count Text', type: 'text' },
      { key: 'client_avatars', label: 'Client Avatars', type: 'image_list', hint: 'Upload avatar images for the client counter' },
    ],
  },
  {
    key: 'stats',
    label: 'Stats Section',
    fields: [
      { key: 'items', label: 'Stats', type: 'key_value_list', valuePlaceholder: 'e.g. 200+', labelPlaceholder: 'e.g. Projects Delivered' },
    ],
  },
  {
    key: 'clients',
    label: 'Clients / Featured In',
    fields: [
      { key: 'label', label: 'Section Label', type: 'text' },
      { key: 'names', label: 'Client Names', type: 'string_list', hint: 'Add one name per row' },
    ],
  },
  {
    key: 'about',
    label: 'About Section',
    fields: [
      { key: 'tagline', label: 'Tagline', type: 'text' },
      { key: 'heading', label: 'Heading', type: 'textarea' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'button_text', label: 'Button Text', type: 'text' },
      { key: 'button_url', label: 'Button URL', type: 'text' },
    ],
  },
  {
    key: 'process',
    label: 'Process / How It Works',
    fields: [
      { key: 'tagline', label: 'Tagline', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'steps', label: 'Steps', type: 'steps_list' },
    ],
  },
  {
    key: 'cta',
    label: 'CTA Section',
    fields: [
      { key: 'tagline', label: 'Tagline', type: 'text' },
      { key: 'heading_line1', label: 'Heading Line 1', type: 'text' },
      { key: 'heading_line2', label: 'Heading Line 2', type: 'text' },
      { key: 'heading_line3', label: 'Heading Line 3', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
];

// ─── Repeater sub-components ────────────────────────────────────────

function KeyValueListEditor({
  label,
  items,
  onChange,
  valuePlaceholder,
  labelPlaceholder,
}: {
  label: string;
  items: { value: string; label: string }[];
  onChange: (items: { value: string; label: string }[]) => void;
  valuePlaceholder?: string;
  labelPlaceholder?: string;
}) {
  const update = (idx: number, field: 'value' | 'label', val: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: val };
    onChange(next);
  };
  const add = () => onChange([...items, { value: '', label: '' }]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <p className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--admin-accent-foreground)]">{label}</p>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <input
              value={item.value}
              onChange={(e) => update(i, 'value', e.target.value)}
              placeholder={valuePlaceholder || 'Value'}
              className="w-full border border-[var(--admin-input)] bg-[var(--admin-card)] px-3 py-2 text-sm text-[var(--admin-card-foreground)] focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)]"
            />
            <input
              value={item.label}
              onChange={(e) => update(i, 'label', e.target.value)}
              placeholder={labelPlaceholder || 'Label'}
              className="w-full border border-[var(--admin-input)] bg-[var(--admin-card)] px-3 py-2 text-sm text-[var(--admin-card-foreground)] focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)]"
            />
          </div>
          <button type="button" onClick={() => remove(i)} className="mt-2 text-red-400 hover:text-red-600 transition-colors" title="Remove">
            <BsTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-xs font-medium text-[var(--admin-primary)] hover:underline">
        <BsPlus className="w-4 h-4" /> Add stat
      </button>
    </div>
  );
}

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

function StepsListEditor({
  label,
  steps,
  onChange,
}: {
  label: string;
  steps: { title: string; description: string; detail: string }[];
  onChange: (steps: { title: string; description: string; detail: string }[]) => void;
}) {
  const update = (idx: number, field: 'title' | 'description' | 'detail', val: string) => {
    const next = [...steps];
    next[idx] = { ...next[idx], [field]: val };
    onChange(next);
  };
  const add = () => onChange([...steps, { title: '', description: '', detail: '' }]);
  const remove = (idx: number) => onChange(steps.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <p className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--admin-accent-foreground)]">{label}</p>
      {steps.map((step, i) => (
        <div key={i} className="border border-gray-200 p-4 space-y-2 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--admin-muted)]">Step {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 transition-colors" title="Remove step">
              <BsTrash className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            value={step.title}
            onChange={(e) => update(i, 'title', e.target.value)}
            placeholder="Step title (e.g. ENQUIRY)"
            className="w-full border border-[var(--admin-input)] bg-white px-3 py-2 text-sm font-semibold text-[var(--admin-card-foreground)] focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)]"
          />
          <textarea
            value={step.description}
            onChange={(e) => update(i, 'description', e.target.value)}
            placeholder="Step description"
            rows={2}
            className="w-full border border-[var(--admin-input)] bg-white px-3 py-2 text-sm text-[var(--admin-card-foreground)] focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)]"
          />
          <input
            value={step.detail}
            onChange={(e) => update(i, 'detail', e.target.value)}
            placeholder="Detail label (e.g. Free consultation call)"
            className="w-full border border-[var(--admin-input)] bg-white px-3 py-2 text-xs text-[var(--admin-card-foreground)] focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)]"
          />
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-xs font-medium text-[var(--admin-primary)] hover:underline">
        <BsPlus className="w-4 h-4" /> Add step
      </button>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────

export default function HomepageSectionsPage() {
  const [sections, setSections] = useState<Record<string, Record<string, unknown>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['hero']));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    fetch('/api/admin/page-sections?page=home')
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
      // Strip any temporary __raw_ keys before saving
      const rawContent = sections[sectionKey] || {};
      const cleanContent: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rawContent)) {
        if (!k.startsWith('__raw_')) cleanContent[k] = v;
      }

      const res = await fetch('/api/admin/page-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_key: 'home',
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
      // Revalidate all pages so changes appear instantly on the frontend
      await fetch('/api/admin/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/' }),
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
        body: JSON.stringify({ path: '/' }),
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
        title="Homepage"
        description="Edit the text, images, and content for each section of the public homepage. Changes are saved per-section and go live instantly."
        livePage={{ label: 'View Homepage', href: '/' }}
        tips={[
          'Each section (Hero, Stats, Clients, About, Process, CTA) can be edited and saved independently.',
          'Click a section to expand it, make your changes, then click "Save" for that section.',
          'Image fields support drag-and-drop upload — no need to paste URLs manually.',
          'The "Publish to Site" button force-refreshes all cached pages if changes don\'t appear immediately.',
        ]}
      />
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

                  if (field.type === 'select') {
                    const currentVal = getFieldValue(config.key, field.key) || (field.options?.[0]?.value ?? '');
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <label className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--admin-accent-foreground)]">
                          {field.label}
                        </label>
                        <select
                          value={currentVal}
                          onChange={(e) => updateField(config.key, field.key, e.target.value)}
                          className="w-full border border-[var(--admin-input)] bg-[var(--admin-card)] px-3 py-2 text-sm text-[var(--admin-card-foreground)] focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-ring)]"
                        >
                          {(field.options || []).map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {field.hint && <p className="text-xs text-[var(--admin-muted)]">{field.hint}</p>}
                      </div>
                    );
                  }

                  if (field.type === 'range') {
                    const numVal = Number(getFieldValue(config.key, field.key)) || 0;
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <label className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--admin-accent-foreground)]">
                          {field.label}
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={field.min ?? 0}
                            max={field.max ?? 300}
                            step={field.step ?? 1}
                            value={numVal}
                            onChange={(e) => updateField(config.key, field.key, Number(e.target.value))}
                            className="flex-1 accent-[var(--admin-primary)]"
                          />
                          <span className="text-sm font-mono text-[var(--admin-card-foreground)] min-w-[4rem] text-right">
                            {numVal}s
                          </span>
                        </div>
                        {field.hint && <p className="text-xs text-[var(--admin-muted)]">{field.hint}</p>}
                      </div>
                    );
                  }

                  if (field.type === 'image' || field.type === 'video') {
                    return (
                      <AdminMediaUpload
                        key={field.key}
                        label={field.label}
                        value={getFieldValue(config.key, field.key)}
                        onChange={(url) => updateField(config.key, field.key, url)}
                        mediaType={field.type}
                        hint={field.hint}
                        error={fieldError}
                      />
                    );
                  }

                  if (field.type === 'image_list') {
                    const currentList = Array.isArray(sections[config.key]?.[field.key])
                      ? (sections[config.key][field.key] as string[])
                      : [];
                    return (
                      <div key={field.key} className="space-y-2">
                        <label className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--admin-accent-foreground)]">
                          {field.label}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {currentList.map((url, i) => (
                            <AdminMediaUpload
                              key={`${field.key}-${i}`}
                              label={`${field.label} ${i + 1}`}
                              value={url}
                              onChange={(newUrl) => {
                                const updated = [...currentList];
                                if (newUrl) {
                                  updated[i] = newUrl;
                                } else {
                                  updated.splice(i, 1);
                                }
                                updateField(config.key, field.key, updated);
                              }}
                              mediaType="image"
                            />
                          ))}
                          <AdminMediaUpload
                            key={`${field.key}-new`}
                            label="Add new"
                            value=""
                            onChange={(newUrl) => {
                              if (newUrl) {
                                updateField(config.key, field.key, [...currentList, newUrl]);
                              }
                            }}
                            mediaType="image"
                          />
                        </div>
                        {field.hint && <p className="text-xs text-[var(--admin-muted)]">{field.hint}</p>}
                      </div>
                    );
                  }

                  if (field.type === 'key_value_list') {
                    const items = Array.isArray(sections[config.key]?.[field.key])
                      ? (sections[config.key][field.key] as { value: string; label: string }[])
                      : [];
                    return (
                      <KeyValueListEditor
                        key={field.key}
                        label={field.label}
                        items={items}
                        onChange={(updated) => updateField(config.key, field.key, updated)}
                        valuePlaceholder={field.valuePlaceholder}
                        labelPlaceholder={field.labelPlaceholder}
                      />
                    );
                  }

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

                  if (field.type === 'steps_list') {
                    const steps = Array.isArray(sections[config.key]?.[field.key])
                      ? (sections[config.key][field.key] as { title: string; description: string; detail: string }[])
                      : [];
                    return (
                      <StepsListEditor
                        key={field.key}
                        label={field.label}
                        steps={steps}
                        onChange={(updated) => updateField(config.key, field.key, updated)}
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

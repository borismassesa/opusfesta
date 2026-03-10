'use client';

import { useState } from 'react';
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/ui/AdminInput';
import AdminButton from '@/components/admin/ui/AdminButton';
import { Plus, X } from 'lucide-react';
import type { StudioProject } from '@/lib/studio-types';

const categories = [
  { value: 'Wedding Film', label: 'Wedding Film' }, { value: 'Event Coverage', label: 'Event Coverage' },
  { value: 'Corporate', label: 'Corporate' }, { value: 'Commercial', label: 'Commercial' },
];

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export default function ProjectForm({ initialData, onSubmit }: { initialData?: StudioProject; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    title: initialData?.title || '', slug: initialData?.slug || '', number: initialData?.number || '',
    category: initialData?.category || 'Wedding Film', description: initialData?.description || '',
    full_description: initialData?.full_description || '', cover_image: initialData?.cover_image || '',
    is_published: initialData?.is_published || false, sort_order: initialData?.sort_order || 0,
    seo_title: initialData?.seo_title || '', seo_description: initialData?.seo_description || '',
  });
  const [stats, setStats] = useState<{ label: string; value: string }[]>(initialData?.stats || []);
  const [highlights, setHighlights] = useState<string[]>(initialData?.highlights || []);
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: unknown) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ ...form, stats, highlights });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <AdminInput label="Title" value={form.title} onChange={(e) => { set('title', e.target.value); if (!initialData) set('slug', slugify(e.target.value)); }} required />
        <AdminInput label="Slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} required hint="URL-friendly identifier" />
        <div className="grid grid-cols-2 gap-4">
          <AdminInput label="Number" value={form.number} onChange={(e) => set('number', e.target.value)} required placeholder="01" />
          <AdminSelect label="Category" value={form.category} onChange={(e) => set('category', e.target.value)} options={categories} />
        </div>
        <AdminTextarea label="Short Description" value={form.description} onChange={(e) => set('description', e.target.value)} required />
        <AdminTextarea label="Full Description" value={form.full_description} onChange={(e) => set('full_description', e.target.value)} required rows={6} />
        <AdminInput label="Cover Image URL" value={form.cover_image} onChange={(e) => set('cover_image', e.target.value)} required />
      </div>

      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Stats</h3>
          <button type="button" onClick={() => setStats([...stats, { label: '', value: '' }])} className="text-brand-accent text-xs font-medium flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
        </div>
        {stats.map((s, i) => (
          <div key={i} className="flex gap-2 items-start">
            <AdminInput label="Label" value={s.label} onChange={(e) => { const n = [...stats]; n[i].label = e.target.value; setStats(n); }} />
            <AdminInput label="Value" value={s.value} onChange={(e) => { const n = [...stats]; n[i].value = e.target.value; setStats(n); }} />
            <button type="button" onClick={() => setStats(stats.filter((_, j) => j !== i))} className="mt-7 p-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Highlights</h3>
          <button type="button" onClick={() => setHighlights([...highlights, ''])} className="text-brand-accent text-xs font-medium flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
        </div>
        {highlights.map((h, i) => (
          <div key={i} className="flex gap-2">
            <input value={h} onChange={(e) => { const n = [...highlights]; n[i] = e.target.value; setHighlights(n); }}
              className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20" />
            <button type="button" onClick={() => setHighlights(highlights.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Settings & SEO</h3>
        <div className="grid grid-cols-2 gap-4">
          <AdminInput label="Sort Order" type="number" value={form.sort_order} onChange={(e) => set('sort_order', parseInt(e.target.value) || 0)} />
          <div className="flex items-center gap-2 pt-7">
            <input type="checkbox" id="is_published" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} className="w-4 h-4 accent-brand-accent" />
            <label htmlFor="is_published" className="text-sm text-gray-700">Published</label>
          </div>
        </div>
        <AdminInput label="SEO Title" value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} />
        <AdminTextarea label="SEO Description" value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} />
      </div>

      <AdminButton type="submit" loading={loading}>{initialData ? 'Save Changes' : 'Create Project'}</AdminButton>
    </form>
  );
}

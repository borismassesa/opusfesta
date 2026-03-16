'use client';

import { useState } from 'react';
import { AdminInput, AdminTextarea } from '@/components/admin/ui/AdminInput';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminMediaUpload from '@/components/admin/ui/AdminMediaUpload';
import { BsPlus, BsX } from 'react-icons/bs';
import type { StudioService } from '@/lib/studio-types';

export default function ServiceForm({ initialData, onSubmit }: { initialData?: StudioService; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    title: initialData?.title || '', description: initialData?.description || '',
    price: initialData?.price || '', cover_image: initialData?.cover_image || '',
    is_active: initialData?.is_active ?? true, sort_order: initialData?.sort_order || 0,
  });
  const [includes, setIncludes] = useState<string[]>(initialData?.includes || []);
  const [loading, setLoading] = useState(false);

  const set = (f: string, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await onSubmit({ ...form, includes }); setLoading(false); }} className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <AdminInput label="Title" value={form.title} onChange={(e) => set('title', e.target.value)} required />
        <AdminTextarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} required />
        <div className="grid grid-cols-2 gap-4">
          <AdminInput label="Price" value={form.price} onChange={(e) => set('price', e.target.value)} required placeholder="From $2,500" />
          <AdminInput label="Sort Order" type="number" value={form.sort_order} onChange={(e) => set('sort_order', parseInt(e.target.value) || 0)} />
        </div>
        <AdminMediaUpload label="Cover Image" value={form.cover_image} onChange={(url) => set('cover_image', url)} mediaType="image" />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} className="w-4 h-4 accent-brand-accent" />
          <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Includes</h3>
          <button type="button" onClick={() => setIncludes([...includes, ''])} className="text-brand-accent text-xs font-medium flex items-center gap-1"><BsPlus className="w-3 h-3" />Add</button>
        </div>
        {includes.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input value={item} onChange={(e) => { const n = [...includes]; n[i] = e.target.value; setIncludes(n); }}
              className="flex-1 px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/20" />
            <button type="button" onClick={() => setIncludes(includes.filter((_, j) => j !== i))} className="p-2 text-red-400 hover:text-red-600"><BsX className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <AdminButton type="submit" loading={loading}>{initialData ? 'Save Changes' : 'Create Service'}</AdminButton>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { AdminInput, AdminTextarea } from '@/components/admin/ui/AdminInput';
import AdminButton from '@/components/admin/ui/AdminButton';
import type { StudioFaq } from '@/lib/studio-types';

export default function FaqForm({ initialData, onSubmit }: { initialData?: StudioFaq; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    question: initialData?.question || '', answer: initialData?.answer || '',
    is_published: initialData?.is_published ?? true, sort_order: initialData?.sort_order || 0,
  });
  const [loading, setLoading] = useState(false);
  const set = (f: string, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await onSubmit(form); setLoading(false); }} className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <AdminInput label="Question" value={form.question} onChange={(e) => set('question', e.target.value)} required />
        <AdminTextarea label="Answer" value={form.answer} onChange={(e) => set('answer', e.target.value)} required rows={5} />
        <div className="grid grid-cols-2 gap-4">
          <AdminInput label="Sort Order" type="number" value={form.sort_order} onChange={(e) => set('sort_order', parseInt(e.target.value) || 0)} />
          <div className="flex items-center gap-2 pt-7">
            <input type="checkbox" id="is_published" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} className="w-4 h-4 accent-brand-accent" />
            <label htmlFor="is_published" className="text-sm text-gray-700">Published</label>
          </div>
        </div>
      </div>
      <AdminButton type="submit" loading={loading}>{initialData ? 'Save Changes' : 'Create FAQ'}</AdminButton>
    </form>
  );
}

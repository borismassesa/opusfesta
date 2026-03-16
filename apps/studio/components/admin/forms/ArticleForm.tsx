'use client';

import { useState, lazy, Suspense } from 'react';
import { AdminInput, AdminTextarea, AdminSelect } from '@/components/admin/ui/AdminInput';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminMediaUpload from '@/components/admin/ui/AdminMediaUpload';
import type { StudioArticle } from '@/lib/studio-types';

const RichTextEditor = lazy(() => import('@/components/admin/editor/RichTextEditor'));

const categories = [
  { value: 'Process', label: 'Process' }, { value: 'Motion', label: 'Motion' },
  { value: 'Culture', label: 'Culture' }, { value: 'Behind the Scenes', label: 'Behind the Scenes' },
  { value: 'Tips', label: 'Tips' },
];

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export default function ArticleForm({ initialData, onSubmit }: { initialData?: StudioArticle; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    title: initialData?.title || '', slug: initialData?.slug || '', excerpt: initialData?.excerpt || '',
    body_html: initialData?.body_html || '', cover_image: initialData?.cover_image || '',
    author: initialData?.author || 'OpusStudio', category: initialData?.category || 'Process',
    is_published: initialData?.is_published || false, seo_title: initialData?.seo_title || '',
    seo_description: initialData?.seo_description || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: unknown) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <AdminInput label="Title" value={form.title} onChange={(e) => { set('title', e.target.value); if (!initialData) set('slug', slugify(e.target.value)); }} required />
        <AdminInput label="Slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
        <AdminTextarea label="Excerpt" value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} required rows={2} />
        <div className="grid grid-cols-2 gap-4">
          <AdminInput label="Author" value={form.author} onChange={(e) => set('author', e.target.value)} />
          <AdminSelect label="Category" value={form.category} onChange={(e) => set('category', e.target.value)} options={categories} />
        </div>
        <AdminMediaUpload label="Cover Image" value={form.cover_image} onChange={(url) => set('cover_image', url)} mediaType="image" />
      </div>

      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Content</h3>
        <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse" />}>
          <RichTextEditor value={form.body_html} onChange={(html) => set('body_html', html)} />
        </Suspense>
      </div>

      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Settings & SEO</h3>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_published" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} className="w-4 h-4 accent-brand-accent" />
          <label htmlFor="is_published" className="text-sm text-gray-700">Published</label>
        </div>
        <AdminInput label="SEO Title" value={form.seo_title} onChange={(e) => set('seo_title', e.target.value)} />
        <AdminTextarea label="SEO Description" value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} />
      </div>

      <AdminButton type="submit" loading={loading}>{initialData ? 'Save Changes' : 'Create Article'}</AdminButton>
    </form>
  );
}

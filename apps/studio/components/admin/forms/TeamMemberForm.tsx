'use client';

import { useState } from 'react';
import { AdminInput, AdminTextarea } from '@/components/admin/ui/AdminInput';
import AdminButton from '@/components/admin/ui/AdminButton';
import { BsPlus, BsX } from 'react-icons/bs';
import type { StudioTeamMember } from '@/lib/studio-types';

export default function TeamMemberForm({ initialData, onSubmit }: { initialData?: StudioTeamMember; onSubmit: (data: Record<string, unknown>) => Promise<void> }) {
  const [form, setForm] = useState({
    name: initialData?.name || '', role: initialData?.role || '', bio: initialData?.bio || '',
    avatar_url: initialData?.avatar_url || '', is_published: initialData?.is_published ?? true, sort_order: initialData?.sort_order || 0,
  });
  const [socialLinks, setSocialLinks] = useState<[string, string][]>(Object.entries(initialData?.social_links || {}));
  const [loading, setLoading] = useState(false);
  const set = (f: string, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await onSubmit({ ...form, social_links: Object.fromEntries(socialLinks.filter(([k]) => k)) }); setLoading(false); }} className="space-y-6 max-w-2xl">
      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <AdminInput label="Name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          <AdminInput label="Role" value={form.role} onChange={(e) => set('role', e.target.value)} required placeholder="Lead Cinematographer" />
        </div>
        <AdminTextarea label="Bio" value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={3} />
        <AdminInput label="Avatar URL" value={form.avatar_url} onChange={(e) => set('avatar_url', e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <AdminInput label="Sort Order" type="number" value={form.sort_order} onChange={(e) => set('sort_order', parseInt(e.target.value) || 0)} />
          <div className="flex items-center gap-2 pt-7">
            <input type="checkbox" id="is_published" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} className="w-4 h-4 accent-brand-accent" />
            <label htmlFor="is_published" className="text-sm text-gray-700">Published</label>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Social Links</h3>
          <button type="button" onClick={() => setSocialLinks([...socialLinks, ['', '']])} className="text-brand-accent text-xs font-medium flex items-center gap-1"><BsPlus className="w-3 h-3" />Add</button>
        </div>
        {socialLinks.map(([platform, url], i) => (
          <div key={i} className="flex gap-2 items-start">
            <AdminInput label="Platform" value={platform} onChange={(e) => { const n = [...socialLinks]; n[i] = [e.target.value, n[i][1]]; setSocialLinks(n as [string, string][]); }} placeholder="instagram" />
            <AdminInput label="URL" value={url} onChange={(e) => { const n = [...socialLinks]; n[i] = [n[i][0], e.target.value]; setSocialLinks(n as [string, string][]); }} placeholder="https://..." />
            <button type="button" onClick={() => setSocialLinks(socialLinks.filter((_, j) => j !== i))} className="mt-7 p-1 text-red-400 hover:text-red-600"><BsX className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <AdminButton type="submit" loading={loading}>{initialData ? 'Save Changes' : 'Add Team Member'}</AdminButton>
    </form>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { AdminInput, AdminTextarea } from '@/components/admin/ui/AdminInput';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminToast from '@/components/admin/ui/AdminToast';
import { Save } from 'lucide-react';

interface SeoEntry {
  page_key: string;
  title: string | null;
  description: string | null;
  og_image: string | null;
}

const PAGES = [
  { key: 'home', label: 'Home' },
  { key: 'portfolio', label: 'Portfolio' },
  { key: 'journal', label: 'Journal' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'terms', label: 'Terms of Service' },
];

export default function SeoPage() {
  const [seoMap, setSeoMap] = useState<Record<string, SeoEntry>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/seo')
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, SeoEntry> = {};
        PAGES.forEach((p) => {
          map[p.key] = { page_key: p.key, title: null, description: null, og_image: null };
        });
        (d.seo || []).forEach((entry: SeoEntry) => {
          map[entry.page_key] = entry;
        });
        setSeoMap(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateField = (pageKey: string, field: keyof SeoEntry, value: string) => {
    setSeoMap((prev) => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], [field]: value },
    }));
  };

  const handleSave = async (pageKey: string) => {
    setSavingKey(pageKey);
    const entry = seoMap[pageKey];
    await fetch('/api/admin/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    setSavingKey(null);
    setSavedKey(pageKey);
    setTimeout(() => setSavedKey(null), 2000);
  };

  if (loading) return <div className="bg-white border border-gray-200 h-64 animate-pulse" />;

  return (
    <div className="space-y-4">
      <AdminToast />
      <h1 className="text-xl font-bold text-gray-900">SEO Settings</h1>

      <div className="space-y-6 max-w-3xl">
        {PAGES.map((page) => {
          const entry = seoMap[page.key];
          if (!entry) return null;
          return (
            <div key={page.key} className="bg-white border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">{page.label}</h2>
                {savedKey === page.key && (
                  <span className="text-xs text-green-600 font-medium">Saved</span>
                )}
              </div>
              <AdminInput
                label="Title"
                value={entry.title || ''}
                onChange={(e) => updateField(page.key, 'title', e.target.value)}
                placeholder={`${page.label} | OpusFesta Studio`}
              />
              <AdminTextarea
                label="Description"
                value={entry.description || ''}
                onChange={(e) => updateField(page.key, 'description', e.target.value)}
                rows={2}
                placeholder="Meta description for search engines..."
              />
              <AdminInput
                label="OG Image URL"
                value={entry.og_image || ''}
                onChange={(e) => updateField(page.key, 'og_image', e.target.value)}
                placeholder="https://..."
              />
              <AdminButton
                size="sm"
                onClick={() => handleSave(page.key)}
                loading={savingKey === page.key}
                icon={<Save className="w-3.5 h-3.5" />}
              >
                Save
              </AdminButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}

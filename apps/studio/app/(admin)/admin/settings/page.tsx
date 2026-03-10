'use client';

import { useEffect, useState } from 'react';
import { AdminInput } from '@/components/admin/ui/AdminInput';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminToast from '@/components/admin/ui/AdminToast';
import { Save } from 'lucide-react';

const SETTINGS_FIELDS = [
  { key: 'studio_name', label: 'Studio Name', placeholder: 'OpusFesta Studio' },
  { key: 'studio_email', label: 'Email', placeholder: 'hello@opusfesta.com' },
  { key: 'studio_phone', label: 'Phone', placeholder: '+1 (555) 123-4567' },
  { key: 'studio_address', label: 'Address', placeholder: '123 Studio Street...' },
  { key: 'social_instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/opusfesta' },
  { key: 'social_twitter', label: 'Twitter / X URL', placeholder: 'https://x.com/opusfesta' },
  { key: 'social_linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/company/opusfesta' },
  { key: 'social_youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/@opusfesta' },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        const map: Record<string, string> = {};
        (d.settings || []).forEach((s: { key: string; value: string }) => {
          map[s.key] = s.value;
        });
        setValues(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        SETTINGS_FIELDS.map((field) =>
          fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: field.key, value: values[field.key] || '' }),
          })
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="bg-white border border-gray-200 h-64 animate-pulse" />;

  return (
    <div className="space-y-4">
      <AdminToast />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        {saved && <span className="text-sm text-green-600 font-medium">All settings saved</span>}
      </div>

      <div className="bg-white border border-gray-200 p-6 space-y-6 max-w-2xl">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Studio Information</h2>
          {SETTINGS_FIELDS.slice(0, 4).map((field) => (
            <AdminInput
              key={field.key}
              label={field.label}
              value={values[field.key] || ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
            />
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Social Links</h2>
          {SETTINGS_FIELDS.slice(4).map((field) => (
            <AdminInput
              key={field.key}
              label={field.label}
              value={values[field.key] || ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
            />
          ))}
        </div>

        <AdminButton onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>
          Save All Settings
        </AdminButton>
      </div>
    </div>
  );
}

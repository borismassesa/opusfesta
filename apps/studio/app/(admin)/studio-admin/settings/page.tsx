'use client';

import { useEffect, useState } from 'react';
import { AdminInput } from '@/components/admin/ui/AdminInput';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminToast from '@/components/admin/ui/AdminToast';
import { BsSave } from 'react-icons/bs';

const SETTINGS_FIELDS = [
  { key: 'studio_name', label: 'Studio Name', placeholder: 'OpusStudio' },
  { key: 'studio_email', label: 'Email', placeholder: 'hello@opusfesta.com' },
  { key: 'studio_phone', label: 'Phone', placeholder: '+1 (555) 123-4567' },
  { key: 'studio_address', label: 'Address', placeholder: '123 Studio Street...' },
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
      <AdminPageHeader
        title="Settings"
        description="Configure your studio's core information. These details are used in the website footer, contact page, and email notifications."
        tips={[
          'Studio name and contact details appear in the website footer and contact page.',
          'Changes are saved instantly and reflected on the live site within a minute.',
          'Make sure your email and phone number are correct — clients use these to reach you.',
        ]}
      />
      <div className="flex items-center justify-end">
        {saved && <span className="text-sm text-green-600 font-medium">All settings saved</span>}
      </div>

      <div className="bg-white border border-gray-200 p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Studio Information</h2>
          {SETTINGS_FIELDS.map((field) => (
            <AdminInput
              key={field.key}
              label={field.label}
              value={values[field.key] || ''}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
            />
          ))}
        </div>


        <AdminButton onClick={handleSave} loading={saving} icon={<BsSave className="w-4 h-4" />}>
          BsSave All Settings
        </AdminButton>
      </div>
    </div>
  );
}

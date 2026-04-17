'use client';

import { useEffect, useState } from 'react';
import { AdminInput, AdminSelect } from '@/components/admin/ui/AdminInput';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import AdminToast from '@/components/admin/ui/AdminToast';
import { BsSave, BsPlus, BsTrash, BsPencil, BsCheck2, BsX, BsLink } from 'react-icons/bs';
import { BsInstagram, BsTwitter, BsLinkedin, BsYoutube, BsTiktok, BsFacebook, BsPinterest, BsTwitterX } from 'react-icons/bs';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

const PLATFORM_OPTIONS = [
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'X/Twitter', label: 'X/Twitter' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'Pinterest', label: 'Pinterest' },
  { value: 'Custom', label: 'Custom...' },
];

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return BsInstagram;
    case 'facebook': return BsFacebook;
    case 'x/twitter': return BsTwitterX;
    case 'twitter': return BsTwitter;
    case 'linkedin': return BsLinkedin;
    case 'youtube': return BsYoutube;
    case 'tiktok': return BsTiktok;
    case 'pinterest': return BsPinterest;
    default: return BsLink;
  }
};

export default function SocialMediaPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Edit / Add state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ platform: string; customPlatform: string; url: string }>({
    platform: 'Instagram',
    customPlatform: '',
    url: '',
  });

  useEffect(() => {
    fetch('/api/admin/social-media')
      .then((r) => r.json())
      .then((d) => {
        if (d.links) setLinks(d.links);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveAll = async (currentLinks: SocialLink[]) => {
    setSaving(true);
    try {
      await fetch('/api/admin/social-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: currentLinks }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const startAdd = () => {
    setEditingId('new');
    setEditForm({ platform: 'Instagram', customPlatform: '', url: '' });
  };

  const startEdit = (link: SocialLink) => {
    setEditingId(link.id);
    const isStandard = PLATFORM_OPTIONS.some((o) => o.value === link.platform && o.value !== 'Custom');
    setEditForm({
      platform: isStandard ? link.platform : 'Custom',
      customPlatform: isStandard ? '' : link.platform,
      url: link.url,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (!editForm.url) return;
    const finalPlatform = editForm.platform === 'Custom' ? editForm.customPlatform : editForm.platform;
    if (!finalPlatform) return;

    let newLinks: SocialLink[];
    if (editingId === 'new') {
      newLinks = [...links, { id: crypto.randomUUID(), platform: finalPlatform, url: editForm.url }];
    } else {
      newLinks = links.map((l) => (l.id === editingId ? { ...l, platform: finalPlatform, url: editForm.url } : l));
    }

    setLinks(newLinks);
    setEditingId(null);
    handleSaveAll(newLinks);
  };

  const deleteLink = (id: string) => {
    if (!confirm('Are you sure you want to delete this social media link?')) return;
    const newLinks = links.filter((l) => l.id !== id);
    setLinks(newLinks);
    handleSaveAll(newLinks);
  };

  if (loading) return <div className="bg-white border border-gray-200 h-64 animate-pulse" />;

  return (
    <div className="space-y-4">
      <AdminToast />
      <AdminPageHeader
        title="Social Media"
        description="Manage your social media presence. These links will appear in your website footer and contact sections."
        tips={[
          'Add links to your active social platforms to build audience engagement.',
          'Selecting a standard platform automatically applies the correct icon.',
          'Choose "Custom" for platforms not listed in the defaults.',
          'Changes are saved instantly and reflected on the live site within a minute.',
        ]}
      />
      
      <div className="flex justify-between items-center bg-white border border-gray-200 p-4 border-b-0 rounded-t-lg">
        <h2 className="text-sm font-semibold text-gray-700">Active Links</h2>
        <div className="flex items-center gap-4">
          {saved && <span className="text-sm text-green-600 font-medium whitespace-nowrap">Changes saved</span>}
          {editingId !== 'new' && (
            <AdminButton onClick={startAdd} variant="primary" size="sm" icon={<BsPlus className="w-4 h-4" />}>
              Add Link
            </AdminButton>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 divide-y divide-gray-100 rounded-b-lg">
        {links.length === 0 && editingId !== 'new' && (
          <div className="p-8 text-center text-gray-500 text-sm">
            No social media links added yet. Click &quot;Add Link&quot; to get started.
          </div>
        )}

        {links.map((link) => {
          const isEditing = editingId === link.id;
          const Icon = getPlatformIcon(link.platform);

          if (isEditing) {
            return (
              <div key={link.id} className="p-6 space-y-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <AdminSelect
                        label="Platform"
                        value={editForm.platform}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, platform: e.target.value }))}
                        options={PLATFORM_OPTIONS}
                      />
                      {editForm.platform === 'Custom' && (
                        <AdminInput
                          label="Custom Platform Name"
                          placeholder="e.g. Behance"
                          value={editForm.customPlatform}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, customPlatform: e.target.value }))}
                        />
                      )}
                    </div>
                    <AdminInput
                      label="URL"
                      placeholder="https://"
                      value={editForm.url}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, url: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <AdminButton onClick={cancelEdit} variant="secondary" size="sm" icon={<BsX className="w-4 h-4" />}>
                    Cancel
                  </AdminButton>
                  <AdminButton onClick={saveEdit} variant="primary" size="sm" loading={saving} icon={<BsCheck2 className="w-4 h-4" />}>
                    Save Link
                  </AdminButton>
                </div>
              </div>
            );
          }

          return (
            <div key={link.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{link.platform}</p>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    {link.url}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AdminButton onClick={() => startEdit(link)} variant="secondary" size="sm" icon={<BsPencil className="w-4 h-4" />}>
                  Edit
                </AdminButton>
                <AdminButton onClick={() => deleteLink(link.id)} variant="danger" size="sm" icon={<BsTrash className="w-4 h-4" />}>
                  Delete
                </AdminButton>
              </div>
            </div>
          );
        })}

        {editingId === 'new' && (
          <div className="p-6 space-y-4 bg-gray-50 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Add New Social Link</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminSelect
                    label="Platform"
                    value={editForm.platform}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, platform: e.target.value }))}
                    options={PLATFORM_OPTIONS}
                  />
                  {editForm.platform === 'Custom' && (
                    <AdminInput
                      label="Custom Platform Name"
                      placeholder="e.g. Behance"
                      value={editForm.customPlatform}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, customPlatform: e.target.value }))}
                    />
                  )}
                </div>
                <AdminInput
                  label="URL"
                  placeholder="https://"
                  value={editForm.url}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, url: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <AdminButton onClick={cancelEdit} variant="secondary" size="sm" icon={<BsX className="w-4 h-4" />}>
                Cancel
              </AdminButton>
              <AdminButton onClick={saveEdit} variant="primary" size="sm" loading={saving} icon={<BsCheck2 className="w-4 h-4" />}>
                Save Link
              </AdminButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

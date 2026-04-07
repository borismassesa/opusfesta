'use client';

import { useEffect, useState, useRef } from 'react';
import {
  BsPerson,
  BsPhone,
  BsWhatsapp,
  BsCheckLg,
  BsBuilding,
  BsGeoAlt,
  BsCamera,
  BsTrash,
  BsLock,
  BsEnvelope,
} from 'react-icons/bs';
import { useClientAuth } from '@/components/portal/ClientAuthProvider';
import PortalLoader from '@/components/portal/PortalLoader';

export default function PortalSettingsPage() {
  const { client, loading: clientLoading, refresh } = useClientAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (client) {
      setName(client.name || '');
      setPhone(client.phone || '');
      setWhatsapp(client.whatsapp || '');
      setCompany(client.company || '');
      setLocation(client.location || '');
      setAvatarUrl(client.avatar_url || null);
    }
  }, [client]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, whatsapp, company, location }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save');
        return;
      }

      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Only JPG, PNG, and WebP images are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('File size must be under 2MB');
      return;
    }

    setUploading(true);
    setAvatarError('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch('/api/portal/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setAvatarError(data.error || 'Upload failed');
        return;
      }

      const data = await res.json();
      setAvatarUrl(data.avatar_url);
      await refresh();
    } catch {
      setAvatarError('Upload failed');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleAvatarRemove() {
    setUploading(true);
    setAvatarError('');

    try {
      const res = await fetch('/api/portal/avatar', { method: 'DELETE' });
      if (res.ok) {
        setAvatarUrl(null);
        await refresh();
      }
    } catch {
      setAvatarError('Failed to remove');
    } finally {
      setUploading(false);
    }
  }

  const displayEmail = client?.email || '';
  const displayAvatar = avatarUrl || null;
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : displayEmail?.[0]?.toUpperCase() || '?';

  if (clientLoading) {
    return <PortalLoader message="Loading settings" />;
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <p className="text-[11px] font-mono font-bold text-brand-accent uppercase tracking-[0.3em] mb-1">
          Account
        </p>
        <h1 className="text-2xl font-bold text-brand-dark font-mono uppercase tracking-wider">
          Settings
        </h1>
      </div>

      {error && (
        <div className="border-3 border-red-500 bg-red-50 p-4 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {saved && (
        <div className="border-3 border-emerald-500 bg-emerald-50 p-4 text-emerald-700 text-sm font-bold flex items-center gap-2">
          <BsCheckLg className="w-4 h-4" />
          Settings saved successfully
        </div>
      )}

      {/* Profile Picture */}
      <div className="border-3 border-brand-border bg-white shadow-brutal">
        <div className="bg-brand-dark px-6 py-3">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Profile Picture</span>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-6">
            {/* Avatar preview */}
            <div className="relative group">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Profile"
                  className="w-20 h-20 border-3 border-brand-border object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-brand-accent text-white flex items-center justify-center text-2xl font-black border-3 border-brand-border">
                  {initials}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin" />
                </div>
              )}
            </div>

            {/* Upload controls */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 border-3 border-brand-border bg-brand-dark text-white px-4 py-2 font-mono font-bold text-xs uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors disabled:opacity-50"
                >
                  <BsCamera className="w-3.5 h-3.5" />
                  {avatarUrl ? 'Change' : 'Upload'}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleAvatarRemove}
                    disabled={uploading}
                    className="flex items-center gap-2 border-3 border-red-300 text-red-600 px-4 py-2 font-mono font-bold text-xs uppercase tracking-wider hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <BsTrash className="w-3.5 h-3.5" />
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[10px] text-brand-muted font-mono">
                JPG, PNG, or WebP. Max 2MB.
              </p>
              {avatarError && (
                <p className="text-xs text-red-600 font-bold">{avatarError}</p>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Profile Details Form */}
      <form onSubmit={handleSave}>
        <div className="border-3 border-brand-border bg-white shadow-brutal">
          <div className="bg-brand-dark px-6 py-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Personal Details</span>
          </div>

          <div className="p-6 space-y-5">
            {/* Email (read-only) */}
            <div>
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-brand-muted uppercase tracking-wider mb-1.5">
                <BsEnvelope className="w-3.5 h-3.5" /> Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={displayEmail}
                  disabled
                  className="w-full border-3 border-brand-border/40 bg-brand-bg px-4 py-2.5 font-mono text-brand-muted cursor-not-allowed"
                />
                <BsLock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted/40" />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-brand-muted uppercase tracking-wider mb-1.5">
                <BsPerson className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full border-3 border-brand-border px-4 py-2.5 font-mono text-brand-dark focus:border-brand-accent focus:outline-none transition-colors"
              />
            </div>

            {/* Phone + WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-mono font-bold text-brand-muted uppercase tracking-wider mb-1.5">
                  <BsPhone className="w-3.5 h-3.5" /> Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+255..."
                  className="w-full border-3 border-brand-border px-4 py-2.5 font-mono text-brand-dark focus:border-brand-accent focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-mono font-bold text-brand-muted uppercase tracking-wider mb-1.5">
                  <BsWhatsapp className="w-3.5 h-3.5" /> WhatsApp
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="+255..."
                  className="w-full border-3 border-brand-border px-4 py-2.5 font-mono text-brand-dark focus:border-brand-accent focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-brand-muted uppercase tracking-wider mb-1.5">
                <BsBuilding className="w-3.5 h-3.5" /> Company / Organization
              </label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Optional"
                className="w-full border-3 border-brand-border px-4 py-2.5 font-mono text-brand-dark focus:border-brand-accent focus:outline-none transition-colors"
              />
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-brand-muted uppercase tracking-wider mb-1.5">
                <BsGeoAlt className="w-3.5 h-3.5" /> Location
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Dar es Salaam, Tanzania"
                className="w-full border-3 border-brand-border px-4 py-2.5 font-mono text-brand-dark focus:border-brand-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="px-6 pb-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full border-3 border-brand-border bg-brand-dark text-white px-6 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      {/* Account info */}
      <div className="border-3 border-brand-border/40 bg-white p-6">
        <h3 className="text-xs font-mono font-bold text-brand-muted uppercase tracking-wider mb-3">
          Account Information
        </h3>
        <div className="space-y-2 text-sm font-mono">
          <div className="flex justify-between">
            <span className="text-brand-muted">Member since</span>
            <span className="text-brand-dark font-bold">
              {client?.created_at
                ? new Date(client.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-muted">Last login</span>
            <span className="text-brand-dark font-bold">
              {client?.last_login_at
                ? new Date(client.last_login_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

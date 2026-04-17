'use client';

import { useEffect, useRef, useState } from 'react';
import { BsCloudUpload, BsTrash, BsArrowsMove } from 'react-icons/bs';
import { computeImageMetadata } from '@/lib/cms/blurhash';
import { getTransformedImageUrl, hotspotToObjectPosition } from '@/lib/cms/assets';
import type { ImageField as ImageFieldDef } from '@/lib/cms/types/define';
import type { StudioAsset } from '@/lib/cms/assets';

// Field value shape — just the asset id. Additional metadata (alt, hotspot,
// dimensions, blurhash) lives on the studio_assets row so a single asset can
// be referenced from multiple documents with consistent metadata.
export type ImageFieldValue = { asset_id: string } | null;

interface ImageFieldProps {
  field: ImageFieldDef;
  value: unknown;
  onChange: (value: ImageFieldValue) => void;
  error?: string;
  disabled?: boolean;
}

function coerce(value: unknown): ImageFieldValue {
  if (value && typeof value === 'object' && 'asset_id' in value) {
    return { asset_id: String((value as { asset_id: unknown }).asset_id) };
  }
  return null;
}

export default function ImageField({ field, value, onChange, error, disabled }: ImageFieldProps) {
  const current = coerce(value);
  const [asset, setAsset] = useState<StudioAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load the asset details whenever the field's asset_id changes.
  useEffect(() => {
    if (!current?.asset_id) {
      setAsset(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/admin/assets/${current.asset_id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.asset) setAsset(data.asset as StudioAsset);
      })
      .catch(() => { /* noop */ });
    return () => { cancelled = true; };
  }, [current?.asset_id]);

  const handleFileSelect = async (file: File) => {
    setUploading(true);
    setSaveError(null);
    try {
      // Compute blurhash + dimensions client-side before upload
      const metadata = await computeImageMetadata(file);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('blurhash', metadata.blurhash);
      formData.append('width', String(metadata.width));
      formData.append('height', String(metadata.height));

      const res = await fetch('/api/admin/assets', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(body.error ?? 'Upload failed');
      }

      const { asset: newAsset } = (await res.json()) as { asset: StudioAsset };
      setAsset(newAsset);
      onChange({ asset_id: newAsset.id });
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setAsset(null);
    onChange(null);
  };

  const handleHotspotClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!asset || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // Optimistic local update
    const optimistic: StudioAsset = { ...asset, hotspot_x: x, hotspot_y: y };
    setAsset(optimistic);

    const res = await fetch(`/api/admin/assets/${asset.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotspot_x: x, hotspot_y: y }),
    });
    if (!res.ok) {
      setSaveError('Unable to save focal point');
      setAsset(asset); // revert
    }
  };

  const handleAltChange = async (next: string) => {
    if (!asset) return;
    setAsset({ ...asset, alt_text: next });
  };

  const handleAltBlur = async () => {
    if (!asset) return;
    const res = await fetch(`/api/admin/assets/${asset.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alt_text: asset.alt_text ?? '' }),
    });
    if (!res.ok) setSaveError('Unable to save alt text');
  };

  return (
    <div>
      <label className="block mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-foreground)]">
          {field.label}
        </span>
        {field.required && <span className="text-red-600 ml-1">*</span>}
      </label>

      {asset ? (
        <div className="space-y-3">
          {/* Preview with hotspot picker */}
          <div className="relative">
            <div
              ref={previewRef}
              onClick={disabled ? undefined : handleHotspotClick}
              className={`relative overflow-hidden border border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-accent)] ${
                disabled ? '' : 'cursor-crosshair'
              }`}
              style={{ aspectRatio: field.aspectRatio ?? (asset.width && asset.height ? asset.width / asset.height : 16 / 9) }}
            >
              <img
                src={getTransformedImageUrl(asset.path, { width: 1200, quality: 80 })}
                alt={asset.alt_text ?? ''}
                className="w-full h-full object-cover"
                style={{ objectPosition: hotspotToObjectPosition(asset.hotspot_x, asset.hotspot_y) }}
              />
              {/* Hotspot marker */}
              <div
                className="absolute w-5 h-5 -ml-2.5 -mt-2.5 border-2 border-white rounded-full shadow-brutal-sm pointer-events-none"
                style={{
                  left: `${((asset.hotspot_x ?? 0.5) * 100).toFixed(1)}%`,
                  top: `${((asset.hotspot_y ?? 0.5) * 100).toFixed(1)}%`,
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 0 0 2px rgba(0,0,0,0.5)',
                }}
              />
            </div>
            <p className="mt-1 text-[10px] text-[var(--admin-muted)] flex items-center gap-1">
              <BsArrowsMove className="w-3 h-3" />
              Click on the image to set the focal point
            </p>
          </div>

          {/* Alt text */}
          <div>
            <label className="block mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-foreground)]">
              Alt text
            </label>
            <input
              type="text"
              value={asset.alt_text ?? ''}
              onChange={(e) => handleAltChange(e.target.value)}
              onBlur={handleAltBlur}
              disabled={disabled}
              placeholder="Describe the image for screen readers"
              className="w-full px-3 py-2 bg-white border border-[var(--admin-sidebar-border)] text-[13px] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)]"
            />
          </div>

          {/* Metadata + remove */}
          <div className="flex items-center justify-between text-[11px] text-[var(--admin-muted)]">
            <span>
              {asset.width}×{asset.height}px · {Math.round(asset.size_bytes / 1024)} KB
            </span>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
            >
              <BsTrash className="w-3 h-3" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--admin-sidebar-border)] bg-white hover:border-[var(--admin-primary)] hover:bg-[var(--admin-sidebar-accent)] transition-colors cursor-pointer py-10 ${
            disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={field.accept ?? 'image/*'}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            disabled={disabled || uploading}
            className="sr-only"
          />
          <BsCloudUpload className="w-6 h-6 text-[var(--admin-muted)]" />
          <span className="text-[12px] font-semibold text-[var(--admin-foreground)]">
            {uploading ? 'Uploading…' : 'Click to upload an image'}
          </span>
          <span className="text-[11px] text-[var(--admin-muted)]">PNG, JPG, or WebP — up to 10 MB</span>
        </label>
      )}

      {(error || saveError) && (
        <p className="mt-1 text-[11px] text-red-600">{error ?? saveError}</p>
      )}
      {field.help && <p className="mt-1 text-[11px] text-[var(--admin-muted)]">{field.help}</p>}
    </div>
  );
}

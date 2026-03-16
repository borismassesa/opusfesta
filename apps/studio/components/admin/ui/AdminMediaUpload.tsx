'use client';

import { useCallback, useRef, useState } from 'react';
import { BsUpload, BsX, BsImage, BsCameraVideo } from 'react-icons/bs';

type MediaType = 'image' | 'video' | 'any';

interface AdminMediaUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  mediaType?: MediaType;
  hint?: string;
  error?: string;
  maxSizeMB?: number;
}

const ACCEPT_MAP: Record<MediaType, string> = {
  image: 'image/jpeg,image/png,image/webp,image/avif',
  video: 'video/mp4,video/webm,video/quicktime',
  any: 'image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime',
};

const DEFAULT_MAX_SIZE_MB: Record<MediaType, number> = {
  image: 10,
  video: 500,
  any: 500,
};

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes('video');
}

function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaUpload({
  label,
  value,
  onChange,
  mediaType = 'image',
  hint,
  error,
  maxSizeMB,
}: AdminMediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const effectiveMaxMB = maxSizeMB ?? DEFAULT_MAX_SIZE_MB[mediaType];

  const uploadFile = useCallback(async (file: File) => {
    setUploadError(null);

    // Client-side file size check
    const maxBytes = effectiveMaxMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`File too large (${formatFileSize(file.size)}). Maximum size is ${effectiveMaxMB} MB.`);
      return;
    }

    // Validate file type client-side
    const accepted = ACCEPT_MAP[mediaType].split(',');
    if (!accepted.includes(file.type)) {
      const isVid = isVideoFile(file);
      setUploadError(
        isVid
          ? 'Unsupported video format. Use MP4, WebM, or MOV.'
          : 'Unsupported image format. Use JPEG, PNG, WebP, or AVIF.'
      );
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Get signed upload URL
      const res = await fetch('/api/admin/media/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!res.ok) {
        const data = await res.json();
        setUploadError(data.error || 'Failed to prepare upload. Please try again.');
        setUploading(false);
        return;
      }
      const { signedUrl, publicUrl } = await res.json();

      // Step 2: Upload directly to Supabase with progress tracking
      // The signedUrl from createSignedUploadUrl already contains the full
      // upload endpoint with token — just PUT the file binary to it
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        });

        xhr.addEventListener('load', () => {
          xhrRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed (status ${xhr.status})`));
          }
        });

        xhr.addEventListener('error', () => {
          xhrRef.current = null;
          reject(new Error('Network error during upload. Check your connection and try again.'));
        });

        xhr.addEventListener('timeout', () => {
          xhrRef.current = null;
          reject(new Error('Upload timed out. The file may be too large for your connection speed.'));
        });

        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.timeout = 15 * 60 * 1000; // 15 minutes for large video uploads
        xhr.send(file);
      });

      onChange(publicUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setUploadError(message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [onChange, effectiveMaxMB, mediaType]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    uploadFile(fileList[0]);
  }, [uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const displayError = error || uploadError;
  const hasPreview = value && value.length > 0;
  const showAsVideo = mediaType === 'video' || (mediaType === 'any' && isVideoUrl(value));

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--admin-accent-foreground)]">
        {label}
      </label>

      {hasPreview ? (
        <div className="relative group">
          <div className="border border-[var(--admin-input)] bg-[var(--admin-card)] overflow-hidden">
            {showAsVideo ? (
              <video
                src={value}
                className="w-full h-40 object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={value}
                alt={label}
                className="w-full h-40 object-cover"
              />
            )}
          </div>
          <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-white/90 shadow-sm hover:bg-white transition-colors rounded-sm"
              title="Replace"
            >
              <BsUpload className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-white/90 shadow-sm hover:bg-white transition-colors rounded-sm"
              title="Remove"
            >
              <BsX className="w-4 h-4 text-red-500" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_MAP[mediaType]}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
            dragOver
              ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)]/5'
              : 'border-[var(--admin-input)] bg-[var(--admin-card)]'
          }`}
          onClick={() => !uploading && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        >
          {uploading ? (
            <div className="space-y-2 px-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading{progress > 0 ? ` ${progress}%` : '...'}
              </div>
              <div className="w-full bg-gray-200 h-1.5 overflow-hidden">
                <div
                  className="h-full bg-brand-accent transition-all duration-300 ease-out"
                  style={{ width: `${Math.max(progress, 2)}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              {mediaType === 'video' ? (
                <BsCameraVideo className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
              ) : (
                <BsImage className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
              )}
              <p className="text-xs text-gray-500">
                Drag & drop or click to upload
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                {mediaType === 'video' ? 'MP4, WebM, MOV' : mediaType === 'image' ? 'JPEG, PNG, WebP, AVIF' : 'Images or videos'}
                {' · '}Max {effectiveMaxMB} MB
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_MAP[mediaType]}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {displayError && <p className="text-xs text-[var(--admin-destructive)]">{displayError}</p>}
      {hint && !displayError && <p className="text-xs text-[var(--admin-muted)]">{hint}</p>}
    </div>
  );
}

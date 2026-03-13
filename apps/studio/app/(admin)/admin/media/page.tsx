'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { BsUpload, BsTrash, BsCopy, BsCheck, BsX } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import { ConfirmDeleteModal } from '@/components/admin/ui/AdminModal';
import AdminToast from '@/components/admin/ui/AdminToast';

interface MediaFile {
  name: string;
  size: number;
  created_at: string;
  publicUrl: string;
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      setFiles(data.files || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const uploadFile = async (file: File) => {
    const res = await fetch('/api/admin/media/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    if (!res.ok) return;
    const { signedUrl } = await res.json();
    await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      await Promise.all(Array.from(fileList).map(uploadFile));
      await fetchFiles();
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: `studio/${deleteTarget.name}` }),
    });
    setDeleteTarget(null);
    setDeleting(false);
    await fetchFiles();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <AdminToast />

      {/* BsUpload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`bg-white border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-300'
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Uploading...
          </div>
        ) : (
          <>
            <BsUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
            <AdminButton variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              Choose Files
            </AdminButton>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <p className="text-xs text-gray-400 mt-2">JPEG, PNG, WebP, AVIF accepted</p>
          </>
        )}
      </div>

      {/* File Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 h-48 animate-pulse" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-500">No media files uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.name} className="bg-white border border-gray-200 group relative overflow-hidden">
              <div className="aspect-square bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.publicUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-700 truncate font-medium">{file.name}</p>
                <p className="text-[10px] text-gray-400">{formatSize(file.size)}</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleCopy(file.publicUrl)}
                  className="p-1.5 bg-white/90 shadow-sm hover:bg-white transition-colors"
                  title="BsCopy URL"
                >
                  {copied === file.publicUrl ? <BsCheck className="w-3.5 h-3.5 text-green-600" /> : <BsCopy className="w-3.5 h-3.5 text-gray-600" />}
                </button>
                <button
                  onClick={() => setDeleteTarget(file)}
                  className="p-1.5 bg-white/90 shadow-sm hover:bg-white transition-colors"
                  title="Delete"
                >
                  <BsTrash className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete File"
        description={`This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}

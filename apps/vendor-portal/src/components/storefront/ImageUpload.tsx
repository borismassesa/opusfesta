'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage } from '@/lib/supabase/vendor';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

interface ImageUploadProps {
  currentImage: string | null | undefined;
  onUpload: (url: string | null) => void;
  bucket: string;
  folder: string;
  aspectHint?: 'square' | 'wide';
  className?: string;
}

export function ImageUpload({
  currentImage,
  onUpload,
  bucket,
  folder,
  aspectHint = 'square',
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB.');
        return;
      }

      setIsUploading(true);
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${folder}/${Date.now()}.${ext}`;

      const { url, error } = await uploadImage(bucket, path, file);

      if (error || !url) {
        toast.error(error || 'Failed to upload image');
      } else {
        onUpload(url);
      }

      setIsUploading(false);
    },
    [bucket, folder, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleFile]
  );

  const aspectClass =
    aspectHint === 'wide' ? 'aspect-[16/9]' : 'aspect-square';

  if (currentImage) {
    return (
      <div className={cn('relative overflow-hidden rounded-lg border', aspectClass, className)}>
        <img
          src={currentImage}
          alt="Uploaded"
          className="h-full w-full object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute right-2 top-2 h-7 w-7"
          onClick={() => onUpload(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        aspectClass,
        className
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      {isUploading ? (
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      ) : (
        <>
          <Upload className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Click or drag to upload
          </p>
        </>
      )}
    </div>
  );
}

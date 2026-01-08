"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  bucket?: string;
  folder?: string;
  maxSizeMB?: number;
  className?: string;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket = "careers",
  folder = "job-images",
  maxSizeMB = 5,
  className,
  label = "Featured Image",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load preview from Supabase Storage when value changes
  useEffect(() => {
    const loadPreview = async () => {
      if (!value) {
        setPreview(null);
        return;
      }

      // If value is already a full URL (from FileReader), use it directly
      if (value.startsWith("data:") || value.startsWith("http")) {
        setPreview(value);
        return;
      }

      // Otherwise, it's a storage path - get signed URL
      setLoadingPreview(true);
      try {
        const { data, error: urlError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(value, 3600); // 1 hour expiry

        if (urlError || !data) {
          console.error("Error loading preview:", urlError);
          setPreview(null);
        } else {
          setPreview(data.signedUrl);
        }
      } catch (err) {
        console.error("Error generating signed URL:", err);
        setPreview(null);
      } finally {
        setLoadingPreview(false);
      }
    };

    loadPreview();
  }, [value, bucket]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - check for specific image MIME types
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Image must be JPG, PNG, WebP, or GIF");
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${folder}/${timestamp}-${randomStr}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload image");
      }

      if (!data) {
        throw new Error("Upload failed: No data returned");
      }

      // Store the path
      onChange(data.path);
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError(err.message || "Failed to upload image");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      {preview || loadingPreview ? (
        <div className="relative group">
          <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
            {loadingPreview ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <img
                src={preview || undefined}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => {
                  console.error("Failed to load preview image");
                  setPreview(null);
                }}
              />
            )}
            {!loadingPreview && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemove}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            uploading
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 mb-2 animate-spin text-primary" />
              <p className="text-sm font-medium text-primary">Uploading...</p>
            </>
          ) : (
            <>
              <div className="p-3 bg-primary/10 rounded-lg mb-3">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
              <p className="mb-1 text-sm font-semibold text-primary">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

    </div>
  );
}

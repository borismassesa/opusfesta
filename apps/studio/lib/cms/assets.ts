// Asset URL helpers — used by both admin UI and public render components.
// Centralizes the Supabase Storage URL building so that switching buckets
// or adding a CDN proxy later only touches this file.

export const ASSETS_BUCKET = 'studio-assets';

export interface StudioAsset {
  id: string;
  bucket: string;
  path: string;
  mime: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  blurhash: string | null;
  hotspot_x: number | null;
  hotspot_y: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
}

function getSupabaseBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  return url.replace(/\/$/, '');
}

/**
 * Raw (untransformed) public URL for an object in the studio-assets bucket.
 * Use for source-of-truth retrieval; prefer `getTransformedImageUrl` for display.
 */
export function getPublicUrl(path: string, bucket: string = ASSETS_BUCKET): string {
  const base = getSupabaseBaseUrl();
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;       // 20–100; default 80
  resize?: 'cover' | 'contain' | 'fill';
  format?: 'origin' | 'webp' | 'avif';
}

/**
 * Supabase Storage render endpoint — on-the-fly image transforms.
 * Docs: https://supabase.com/docs/guides/storage/serving/image-transformations
 */
export function getTransformedImageUrl(
  path: string,
  options: ImageTransformOptions = {},
  bucket: string = ASSETS_BUCKET
): string {
  const base = getSupabaseBaseUrl();
  const params = new URLSearchParams();
  if (options.width)  params.set('width',  String(options.width));
  if (options.height) params.set('height', String(options.height));
  if (options.quality) params.set('quality', String(options.quality));
  if (options.resize) params.set('resize', options.resize);
  if (options.format && options.format !== 'origin') params.set('format', options.format);

  const query = params.toString();
  return `${base}/storage/v1/render/image/public/${bucket}/${path}${query ? `?${query}` : ''}`;
}

/**
 * Translate normalized hotspot coordinates (0..1) into a CSS object-position value.
 * Used by the public <OptimizedImage> component for focal-point cropping.
 */
export function hotspotToObjectPosition(hotspotX: number | null, hotspotY: number | null): string {
  const x = Math.max(0, Math.min(1, hotspotX ?? 0.5));
  const y = Math.max(0, Math.min(1, hotspotY ?? 0.5));
  return `${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%`;
}

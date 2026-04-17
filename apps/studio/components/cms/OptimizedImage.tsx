import { getTransformedImageUrl, hotspotToObjectPosition } from '@/lib/cms/assets';
import type { StudioAsset } from '@/lib/cms/assets';

// Render a studio_assets row as an <img> tag using Supabase Storage's
// on-the-fly image transform endpoint. Applies the asset's focal point via
// CSS object-position so the most important part of the image stays visible
// when the container crops it.
//
// This is a server component — it embeds an <img> directly (no hydration
// cost) and does not use next/image since Supabase Storage transforms
// already handle resize/quality/format via query params.

interface OptimizedImageProps {
  asset: Pick<StudioAsset, 'path' | 'width' | 'height' | 'blurhash' | 'hotspot_x' | 'hotspot_y' | 'alt_text'>;
  /** Display width in CSS pixels; drives the `width` query param. Default 1200. */
  width?: number;
  /** Display height in CSS pixels; drives the `height` query param. */
  height?: number;
  /** Supabase transform resize mode. Default 'cover'. */
  resize?: 'cover' | 'contain' | 'fill';
  /** JPEG/WebP quality 20..100. Default 80. */
  quality?: number;
  /** Override the alt text from the asset (e.g. per-page context). */
  alt?: string;
  className?: string;
  /** Loading priority — true sets loading="eager". Default is lazy. */
  priority?: boolean;
  sizes?: string;
}

export default function OptimizedImage({
  asset,
  width = 1200,
  height,
  resize = 'cover',
  quality = 80,
  alt,
  className,
  priority,
  sizes,
}: OptimizedImageProps) {
  const src = getTransformedImageUrl(asset.path, { width, height, resize, quality });
  const objectPosition = hotspotToObjectPosition(asset.hotspot_x, asset.hotspot_y);

  return (
    <img
      src={src}
      alt={alt ?? asset.alt_text ?? ''}
      width={asset.width ?? undefined}
      height={asset.height ?? undefined}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      sizes={sizes}
      className={className}
      style={{ objectPosition }}
    />
  );
}

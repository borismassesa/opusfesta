// Client-side blurhash encoder.
// Runs in the browser — uses the canvas API to read pixel data from a File
// and encode it to a blurhash string via the `blurhash` npm package.
//
// Why client-side? Avoids needing sharp or similar native image decoders
// on the server. The admin already trusts the caller (Clerk-protected), so
// spoofing the blurhash is not a meaningful threat.

import { encode } from 'blurhash';

export interface ImageMetadata {
  blurhash: string;
  width: number;
  height: number;
}

/**
 * Read a File (or Blob) and return its dimensions + a blurhash encoding.
 * Downscales to 32x32 before encoding (blurhash quality does not improve
 * with larger inputs, and this keeps the cost constant regardless of file size).
 */
export async function computeImageMetadata(file: File | Blob): Promise<ImageMetadata> {
  const bitmap = await createImageBitmap(file);

  const width = bitmap.width;
  const height = bitmap.height;

  // Downscale for blurhash encoding — preserves aspect ratio, capped at 32px.
  const MAX = 32;
  const scale = Math.min(1, MAX / Math.max(width, height));
  const bhWidth = Math.max(1, Math.round(width * scale));
  const bhHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = bhWidth;
  canvas.height = bhHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close?.();
    throw new Error('Unable to get 2d context for blurhash encoding');
  }

  ctx.drawImage(bitmap, 0, 0, bhWidth, bhHeight);
  const imageData = ctx.getImageData(0, 0, bhWidth, bhHeight);

  // blurhash.encode expects RGBA Uint8ClampedArray
  const blurhash = encode(imageData.data, bhWidth, bhHeight, 4, 3);

  bitmap.close?.();

  return { blurhash, width, height };
}

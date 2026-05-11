// Client-side image compression for vendor uploads.
//
// Phones routinely produce 6–12 MB JPEGs; uploading 13 of those hammers the
// server-action body-size limit and a typical mobile connection. We resize
// to a max edge of 2048 px and re-encode JPEG at q≈0.85, which keeps photos
// looking crisp on retina displays but cuts file size by 5–10×.
//
// Skips compression for files that are already small AND within target
// dimensions, so we don't needlessly re-encode (and lose a touch of quality).

export type CompressOptions = {
  /** Longest edge in pixels. Aspect ratio is preserved. */
  maxDimension?: number
  /** JPEG quality 0..1 — 0.85 is the visually-lossless sweet spot. */
  quality?: number
  /** Skip compression if the input file is below this size (bytes). */
  passthroughBelow?: number
}

const DEFAULTS: Required<CompressOptions> = {
  maxDimension: 2048,
  quality: 0.85,
  passthroughBelow: 1.5 * 1024 * 1024, // 1.5 MB
}

export async function compressImage(
  file: File,
  opts: CompressOptions = {},
): Promise<File> {
  const { maxDimension, quality, passthroughBelow } = { ...DEFAULTS, ...opts }

  // Only compress browser-decodable raster images.
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file

  const img = await loadImage(file)
  const longest = Math.max(img.width, img.height)
  const scale = longest > maxDimension ? maxDimension / longest : 1
  const alreadySmallEnough = scale === 1 && file.size <= passthroughBelow
  if (alreadySmallEnough) {
    revoke(img)
    return file
  }

  const w = Math.round(img.width * scale)
  const h = Math.round(img.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) {
    revoke(img)
    return file
  }
  ctx.drawImage(img, 0, 0, w, h)
  revoke(img)

  // Always re-encode as JPEG. The portal accepts jpeg/png/webp, and JPEG is
  // the most predictable for photographic content; PNG would re-compress
  // photos lossy with no size win, WebP support in older Safari/Outlook is
  // patchier than we need for what's effectively a vendor-facing CDN URL.
  const blob = await canvasToBlob(canvas, 'image/jpeg', quality)
  if (!blob) return file

  // Release the canvas backing store immediately. With 13 photos × 3
  // workers × ~16 MB per 2048² canvas, the JS engine can hold ~50 MB
  // until GC runs — enough to push low-memory Android Chrome into
  // canvas.toBlob returning null on later iterations.
  canvas.width = 0
  canvas.height = 0

  // If compression somehow made the file larger (rare but possible for tiny
  // images), keep the original. Saves a server round-trip on a no-op.
  if (blob.size >= file.size) return file

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo'
  return new File([blob], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}

function loadImage(file: File): Promise<HTMLImageElement & { _objectUrl: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image() as HTMLImageElement & { _objectUrl: string }
    img._objectUrl = objectUrl
    img.onload = () => resolve(img)
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not decode image'))
    }
    img.src = objectUrl
  })
}

function revoke(img: HTMLImageElement & { _objectUrl?: string }): void {
  if (img._objectUrl) URL.revokeObjectURL(img._objectUrl)
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

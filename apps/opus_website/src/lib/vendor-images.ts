import type { vendors } from '@/lib/vendors'

export const FALLBACK_GALLERY_IMAGES = [
  '/assets/images/authentic_couple.jpg',
  '/assets/images/beautiful_bride.jpg',
  '/assets/images/bride_umbrella.jpg',
  '/assets/images/bridering.jpg',
  '/assets/images/bridewithumbrella.jpg',
  '/assets/images/churchcouples.jpg',
  '/assets/images/couples_together.jpg',
  '/assets/images/coupleswithpiano.jpg',
  '/assets/images/cutesy_couple.jpg',
  '/assets/images/flowers_pinky.jpg',
  '/assets/images/hand_rings.jpg',
  '/assets/images/mauzo_crew.jpg',
]

export function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

/**
 * Deterministic placeholder hero for vendors that haven't uploaded their own
 * cover image yet (fresh marketplace approvals). Picks one image from the
 * fallback pool by hashing the vendor id, so the same vendor always gets the
 * same placeholder — no flicker between renders, but variety across vendors.
 */
export function getFallbackHeroImage(vendorId: string): string {
  const start = hashString(vendorId) % FALLBACK_GALLERY_IMAGES.length
  return FALLBACK_GALLERY_IMAGES[start]
}

export function getVendorCardImages(vendor: (typeof vendors)[number]) {
  if (vendor.gallery?.length) return vendor.gallery

  const pool = FALLBACK_GALLERY_IMAGES.filter((image) => image !== vendor.heroMedia.src)
  const start = hashString(vendor.id) % pool.length
  const next = pool[start]
  const afterNext = pool[(start + 1) % pool.length]

  return [vendor.heroMedia.src, next, afterNext]
}

import type { vendors } from '@/lib/vendors'

const fallbackGalleryImages = [
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

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function getVendorCardImages(vendor: (typeof vendors)[number]) {
  if (vendor.gallery?.length) return vendor.gallery

  const pool = fallbackGalleryImages.filter((image) => image !== vendor.heroMedia.src)
  const start = hashString(vendor.id) % pool.length
  const next = pool[start]
  const afterNext = pool[(start + 1) % pool.length]

  return [vendor.heroMedia.src, next, afterNext]
}

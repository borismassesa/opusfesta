import type { PledgeCoverTone } from './pledge-page'

export interface PledgeCardTemplate {
  id: string
  name: string
  name_sw: string
  coverTone: PledgeCoverTone
  accent: string
}

/**
 * Curated pledge-page cover "looks" built from the existing tone + accent
 * system (no new artwork) — placeholders, swappable for bespoke designs later.
 */
export const PLEDGE_CARD_TEMPLATES: PledgeCardTemplate[] = [
  { id: 'ivory-elegance', name: 'Ivory Elegance', name_sw: 'Umaridadi wa Ivory', coverTone: 'cream', accent: '#E8C26A' },
  { id: 'sage-garden', name: 'Sage Garden', name_sw: 'Bustani ya Sage', coverTone: 'sage', accent: '#7EC8C0' },
  { id: 'blush-romance', name: 'Blush Romance', name_sw: 'Mapenzi ya Blush', coverTone: 'blush', accent: '#E8A0B8' },
  { id: 'lavender-dream', name: 'Lavender Dream', name_sw: 'Ndoto ya Lavender', coverTone: 'lavender', accent: '#C9A0DC' },
  { id: 'midnight-charcoal', name: 'Midnight Charcoal', name_sw: 'Charcoal ya Usiku', coverTone: 'charcoal', accent: '#9FE870' },
]

/** Package tiers (ids from packages.ts) that unlock these templates for free. */
export const PLEDGE_TEMPLATE_FREE_TIER_IDS = ['elegant', 'signature']

/** Flat one-time fee (TZS) offered to Classic/Essential couples to unlock the picker. */
export const PLEDGE_TEMPLATE_UNLOCK_FEE = 15000

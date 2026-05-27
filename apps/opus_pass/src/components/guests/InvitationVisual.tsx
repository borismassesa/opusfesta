import type { InvitationPalette } from './invitation-templates/_types'
import {
  ClassicSerif, MinimalLine, ModernBlock, FloralBorder, NavyGold,
  BlushFrame, SagePanel, CulturalRed, ArchScript, PhotoOverlay,
} from './invitation-templates'

export type Treatment =
  | 'classic-serif' | 'minimal-line' | 'modern-block'  | 'floral-border'
  | 'navy-gold'     | 'blush-frame'  | 'sage-panel'    | 'cultural-red'
  | 'arch-script'   | 'photo-overlay'

export type Couple = { names: string; date: string; venue: string }

export const COUPLE_DEFAULT: Couple = {
  names: 'Amani  &  Neema',
  date: '22 · 08 · 2026',
  venue: 'Bagamoyo, Tanzania',
}

export type { InvitationPalette }

// Minimal fallback used only by static preview contexts (landing, catalog, cart)
// that render a treatment without a specific product palette. Product pages always
// supply a real palette from product.palettes[].
const PREVIEW_PALETTES: Record<Treatment, InvitationPalette> = {
  'classic-serif':  { background: '#F5EFE3', surface: '#F5EFE3', accent: '#C4B9A8', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
  'minimal-line':   { background: '#FFFFFF', surface: '#FFFFFF', accent: '#1A1A1A', textPrimary: '#1A1A1A', textSecondary: '#6B6B6B', muted: '#8D8D8D' },
  'modern-block':   { background: '#FFFFFF', surface: '#1A1A1A', accent: '#1A1A1A', textPrimary: '#FFFFFF', textSecondary: 'rgba(255,255,255,0.6)', muted: 'rgba(255,255,255,0.6)' },
  'floral-border':  { background: '#FBF7F2', surface: '#FBF7F2', accent: '#A6B89A', textPrimary: '#1A1A1A', textSecondary: '#5C6B4D', muted: '#5C6B4D' },
  'navy-gold':      { background: '#1E2D54', surface: '#1E2D54', accent: '#E8D9A7', textPrimary: '#F5EFE3', textSecondary: '#E8D9A7', muted: 'rgba(232,217,167,0.7)' },
  'blush-frame':    { background: '#F5DCE2', surface: '#FFFFFF', accent: '#A84F66', textPrimary: '#7A1F2B', textSecondary: '#A84F66', muted: '#A84F66' },
  'sage-panel':     { background: '#A6B89A', surface: '#FBF7F2', accent: '#5C6B4D', textPrimary: '#1A1A1A', textSecondary: '#5C6B4D', muted: 'rgba(92,107,77,0.7)' },
  'cultural-red':   { background: '#7A1F2B', surface: '#7A1F2B', accent: '#C8A35C', textPrimary: '#F5EFE3', textSecondary: '#C8A35C', muted: 'rgba(200,163,92,0.8)' },
  'arch-script':    { background: '#F5EFE3', surface: '#F5EFE3', accent: '#7A1F2B', textPrimary: '#7A1F2B', textSecondary: 'rgba(122,31,43,0.8)', muted: 'rgba(122,31,43,0.6)' },
  'photo-overlay':  { background: 'transparent', surface: 'rgba(0,0,0,0.35)', accent: 'rgba(255,255,255,0.6)', textPrimary: '#FFFFFF', textSecondary: 'rgba(255,255,255,0.8)', muted: 'rgba(255,255,255,0.7)' },
}

export function InvitationVisual({
  treatment,
  couple = COUPLE_DEFAULT,
  palette,
  photoSrc,
}: {
  treatment: Treatment
  couple?: Couple
  palette?: InvitationPalette
  photoSrc?: string
}) {
  const { names, date, venue } = couple
  const p = palette ?? PREVIEW_PALETTES[treatment]

  switch (treatment) {
    case 'classic-serif':  return <ClassicSerif  names={names} date={date} venue={venue} palette={p} />
    case 'minimal-line':   return <MinimalLine   names={names} date={date} venue={venue} palette={p} />
    case 'modern-block':   return <ModernBlock   names={names} date={date} venue={venue} palette={p} />
    case 'floral-border':  return <FloralBorder  names={names} date={date} venue={venue} palette={p} />
    case 'navy-gold':      return <NavyGold      names={names} date={date} venue={venue} palette={p} />
    case 'blush-frame':    return <BlushFrame    names={names} date={date} venue={venue} palette={p} />
    case 'sage-panel':     return <SagePanel     names={names} date={date} venue={venue} palette={p} />
    case 'cultural-red':   return <CulturalRed   names={names} date={date} venue={venue} palette={p} />
    case 'arch-script':    return <ArchScript    names={names} date={date} venue={venue} palette={p} />
    case 'photo-overlay':  return <PhotoOverlay  names={names} date={date} venue={venue} palette={p} photoSrc={photoSrc} />
  }
}

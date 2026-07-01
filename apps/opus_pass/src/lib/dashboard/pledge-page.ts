// Customizable public pledge page config ("CMS"). Pure data + helpers, safe to
// import from both the server query layer and client components (the editor and
// the public form). Stored as a single JSONB blob on couple_profiles.pledge_page;
// every field is optional and falls back to PLEDGE_PAGE_DEFAULTS.

export type PledgeCoverTone = 'cream' | 'sage' | 'blush' | 'lavender' | 'charcoal'

export interface PledgePageConfig {
  eyebrow?: string
  headingLine2?: string
  intro?: string
  buttonLabel?: string
  privacyNote?: string
  /** Arbitrary accent hex used for the CTA and small flourishes. */
  accent?: string
  coverTone?: PledgeCoverTone
  /** Optional cover background image URL (overrides the tone gradient). */
  coverImageUrl?: string | null
  /** True when coverImageUrl is a fully pre-designed template (names/date/venue
   *  already baked into the artwork) — suppresses the text overlay so nothing
   *  doubles up. False/unset means coverImageUrl is a plain photo backdrop. */
  coverIsFullTemplate?: boolean
}

/** `{couple}` in privacyNote is replaced with the couple's name at render time. */
export const PLEDGE_PAGE_DEFAULTS = {
  eyebrow: 'To celebrate the wedding of',
  headingLine2: 'Would Love Your Support',
  intro:
    'Let them know what you’d like to contribute and when — they’ll follow up with everything else. Your details stay private.',
  buttonLabel: 'Send my pledge',
  privacyNote: 'Your pledge goes straight to {couple}. We’ll never use your details for anything else.',
  accent: '#C9A0DC',
  coverTone: 'cream' as PledgeCoverTone,
  coverImageUrl: null as string | null,
  coverIsFullTemplate: false,
}

/** Contact Collector page defaults (same shape, collector-flavoured copy). */
export const COLLECTOR_PAGE_DEFAULTS = {
  eyebrow: 'To celebrate the wedding of',
  headingLine2: 'Would Love Your Details',
  intro:
    'Drop your contact details so they can send you the invitation and live RSVP link. Your information stays private.',
  buttonLabel: 'Send my details',
  privacyNote: 'Your details go straight to {couple}. We’ll never use them for anything else.',
  accent: '#C9A0DC',
  coverTone: 'sage' as PledgeCoverTone,
  coverImageUrl: '/assets/covers/floral-rose-invite.png' as string | null,
  coverIsFullTemplate: true,
}

export type ResolvedPledgePage = typeof PLEDGE_PAGE_DEFAULTS

function mergeConfig(
  config: PledgePageConfig | null | undefined,
  defaults: ResolvedPledgePage,
): ResolvedPledgePage {
  const c = config ?? {}
  return {
    eyebrow: c.eyebrow?.trim() || defaults.eyebrow,
    headingLine2: c.headingLine2?.trim() || defaults.headingLine2,
    intro: c.intro?.trim() || defaults.intro,
    buttonLabel: c.buttonLabel?.trim() || defaults.buttonLabel,
    privacyNote: c.privacyNote?.trim() || defaults.privacyNote,
    accent: c.accent?.trim() || defaults.accent,
    coverTone: c.coverTone || defaults.coverTone,
    coverImageUrl: c.coverImageUrl?.trim() || defaults.coverImageUrl,
    coverIsFullTemplate: c.coverImageUrl?.trim() ? Boolean(c.coverIsFullTemplate) : defaults.coverIsFullTemplate,
  }
}

/** Merge a stored (possibly partial / null) pledge config over the defaults. */
export function resolvePledgePage(config: PledgePageConfig | null | undefined): ResolvedPledgePage {
  return mergeConfig(config, PLEDGE_PAGE_DEFAULTS)
}

/** Merge a stored (possibly partial / null) collector config over the defaults. */
export function resolveCollectorPage(config: PledgePageConfig | null | undefined): ResolvedPledgePage {
  return mergeConfig(config, COLLECTOR_PAGE_DEFAULTS)
}

export interface CoverToneStyle {
  label: string
  base: string
  gradient: string
  ink: string
  soft: string
  rule: string
  leaf: string
}

export const COVER_TONES: Record<PledgeCoverTone, CoverToneStyle> = {
  cream: {
    label: 'Cream',
    base: '#EAE1D2',
    gradient: 'linear-gradient(135deg,#F4EEE2,#EAE1D2,#DBCDB5)',
    ink: '#42392c',
    soft: '#8a7c63',
    rule: '#9a8a6e',
    leaf: '#9aa97c',
  },
  sage: {
    label: 'Sage',
    base: '#DDE4D3',
    gradient: 'linear-gradient(135deg,#EEF2E6,#DDE4D3,#C4D0B2)',
    ink: '#37402f',
    soft: '#6f7a5c',
    rule: '#7f8a64',
    leaf: '#8fa06e',
  },
  blush: {
    label: 'Blush',
    base: '#F3DFDC',
    gradient: 'linear-gradient(135deg,#FBEDEA,#F3DFDC,#E7C6C0)',
    ink: '#4a3531',
    soft: '#9a6f68',
    rule: '#b58a82',
    leaf: '#c39a86',
  },
  lavender: {
    label: 'Lavender',
    base: '#E7DAF0',
    gradient: 'linear-gradient(135deg,#F3E9FA,#E7DAF0,#D2BEE6)',
    ink: '#3a2f44',
    soft: '#7e6b90',
    rule: '#9a86ad',
    leaf: '#b39ac4',
  },
  charcoal: {
    label: 'Charcoal',
    base: '#2C2A33',
    gradient: 'linear-gradient(135deg,#3A3742,#2C2A33,#201E26)',
    ink: '#F4F1EC',
    soft: '#C9C3D2',
    rule: '#8b8597',
    leaf: '#9aa97c',
  },
}

/** Preset accent colors offered in the editor (couple can also pick any hex). */
export const ACCENT_SWATCHES = ['#C9A0DC', '#9FE870', '#E8A0B8', '#7EC8C0', '#E8C26A', '#1A1A1A']

/** postMessage channel between the customize editor and the previewed page. */
export const PLEDGE_PREVIEW_MESSAGE = 'opuspass-pledge-preview'
export const PLEDGE_PREVIEW_READY = 'opuspass-pledge-preview-ready'

/** One "how to pay" entry: provider + account/number + (optional) account name. */
export interface PledgePaymentMethod {
  label: string
  value: string
  name?: string
}

/** Common providers offered in the editor (the couple can also type any label). */
export const PAYMENT_PROVIDERS = [
  'M-Pesa',
  'Mixx by Yas',
  'Selcom Pesa',
  'Airtel Money',
  'HaloPesa',
  'CRDB Bank',
  'NMB Bank',
  'NBC Bank',
  'Bank transfer',
  'Cash',
] as const

/** Flatten structured methods into the legacy multi-line text (reminders/fallback). */
export function paymentMethodsToText(methods: PledgePaymentMethod[] | null | undefined): string {
  return (methods ?? [])
    .filter((m) => (m.label?.trim() || m.value?.trim()))
    .map((m) => {
      const head = [m.label?.trim(), m.value?.trim()].filter(Boolean).join(': ')
      return m.name?.trim() ? `${head} (${m.name.trim()})` : head
    })
    .join('\n')
}

/** Readable text color (#1A1A1A or white) for a given accent background. */
export function accentInk(hex: string): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return '#1A1A1A'
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#1A1A1A' : '#FFFFFF'
}

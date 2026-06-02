// Structured invitation card — the East African "luxury floral" template family.
// One shared top/middle/lower layout; `theme` swaps palette + floral + type per design.
// Content schema below is the superset of the repeated info blocks across event types.
// Wedding is the first implemented event type; others reuse the same layout + schema.

export type EventType = 'wedding' | 'send-off' | 'kitchen-party' | 'kikao'

// Bilingual (Swahili · English) section labels — English for event/branding chrome,
// Swahili leading for the emotional/formal tone.
const EVENT_TITLE: Record<EventType, string> = {
  wedding: 'Harusi · Wedding',
  'send-off': 'Send-Off',
  'kitchen-party': 'Kitchen Party',
  kikao: 'Kikao · Introduction',
}

export type InvitationContent = {
  eventType: EventType
  /** Overrides the default bilingual event title when set. */
  eventTitle?: string
  /** "Familia ya … pamoja na Familia ya …" — the family introduction line. */
  familyIntro?: string
  /** The large script line: couple names, or the bride for a send-off. */
  celebrant: string
  /** Pre-formatted display date, e.g. "22 · 08 · 2026". */
  date: string
  time?: string
  venue: string
  dressCode?: string
  /** Dress-code colour palette shown as small dots. */
  palette?: string[]
  rsvp?: { label?: string; contacts: string[] }
  /** A QR is always drawn; `label` is the SINGLE / DOUBLE entry tag. */
  qr?: { label?: string }
  branding?: string
}

export type InvitationTheme = {
  id: string
  label: string
  surface: string
  ink: string
  /** Gold/rose/etc — eyebrows, dividers, frame, date, florals. */
  accent: string
  /** Tailwind font class for the celebrant line. */
  scriptClass: string
}

export const WEDDING_THEMES: InvitationTheme[] = [
  { id: 'cream-gold', label: 'Cream & gold', surface: '#F7F1E6', ink: '#2B2118', accent: '#C8A35C', scriptClass: 'font-serif italic' },
  { id: 'blush',      label: 'Blush rose',   surface: '#FBEEF0', ink: '#5E2230', accent: '#C98B97', scriptClass: 'font-serif italic' },
  { id: 'sage',       label: 'Sage green',   surface: '#EEF1E8', ink: '#2F3A2A', accent: '#7C8A66', scriptClass: 'font-serif italic' },
  { id: 'ivory-navy', label: 'Ivory & navy', surface: '#F4F1EA', ink: '#1E2D54', accent: '#1E2D54', scriptClass: 'font-serif italic' },
]

export const WEDDING_CONTENT_DEFAULT: InvitationContent = {
  eventType: 'wedding',
  familyIntro: 'Familia ya Bw. & Bi. Mushi pamoja na Familia ya Bw. & Bi. Kessy',
  celebrant: 'Amani & Neema',
  date: '22 · 08 · 2026',
  time: '4:00 PM',
  venue: 'Bagamoyo, Tanzania',
  dressCode: 'Cocktail',
  palette: ['#C8A35C', '#7A1F2B', '#F5EFE3'],
  rsvp: { label: 'RSVP', contacts: ['+255 712 000 000', '+255 754 000 000'] },
  qr: { label: 'SINGLE' },
  branding: 'OpusFesta',
}

// A decorative spray of petals anchored to a corner. `flip`/`vflip` reposition it.
function FloralCorner({ color, flip, vflip }: { color: string; flip?: boolean; vflip?: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="absolute h-[26%] w-[26%]"
      style={{
        color,
        transform: `scale(${flip ? -1 : 1}, ${vflip ? -1 : 1})`,
        ...(flip ? { right: 0 } : { left: 0 }),
        ...(vflip ? { bottom: 0 } : { top: 0 }),
        position: 'absolute',
      }}
    >
      <g fill="currentColor">
        <path d="M6 6c10 1 17 6 21 14-9 1-16-3-21-9-1-2-1-4 0-5Z" opacity="0.85" />
        <path d="M6 6c1 10 6 17 14 21 1-9-3-16-9-21-2-1-4-1-5 0Z" opacity="0.7" />
        <circle cx="30" cy="30" r="5" opacity="0.9" />
        <circle cx="40" cy="20" r="3" opacity="0.6" />
        <circle cx="20" cy="40" r="3" opacity="0.6" />
      </g>
    </svg>
  )
}

// A minimal CSS QR placeholder — a fixed pseudo-random module grid + finder squares.
function QrGlyph({ color }: { color: string }) {
  const modules = '1101011100101101011010110011100101101101001110101101'
  return (
    <span className="grid grid-cols-7 gap-px" style={{ width: 34, height: 34 }} aria-hidden="true">
      {Array.from({ length: 49 }).map((_, i) => (
        <span key={i} style={{ backgroundColor: modules[i % modules.length] === '1' ? color : 'transparent' }} />
      ))}
    </span>
  )
}

export function StructuredInvitation({
  content,
  theme,
}: {
  content: InvitationContent
  theme: InvitationTheme
}) {
  const { surface, ink, accent } = theme
  const title = content.eventTitle ?? EVENT_TITLE[content.eventType]
  const muted = { color: ink, opacity: 0.6 } as const

  return (
    <div className="absolute inset-0 flex flex-col p-[7%]" style={{ backgroundColor: surface, color: ink }}>
      <FloralCorner color={accent} />
      <FloralCorner color={accent} flip vflip />

      {/* Top — event title + family introduction */}
      <div className="text-center">
        <p className="text-[7px] font-bold uppercase tracking-[0.34em]" style={{ color: accent }}>
          {title}
        </p>
        {content.familyIntro && (
          <p className="mx-auto mt-2 max-w-[88%] text-[6.5px] italic leading-relaxed" style={muted}>
            {content.familyIntro}
          </p>
        )}
      </div>

      {/* Middle — celebrant name (the hero) */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className={`${theme.scriptClass} text-[19px] leading-[1.1]`}>{content.celebrant}</p>
        <span className="mt-2 block h-px w-10" style={{ backgroundColor: accent }} />
      </div>

      {/* Lower — date/time/venue, dress code, RSVP, QR, branding */}
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 text-[7.5px] uppercase tracking-[0.18em]" style={{ color: accent }}>
          <span>{content.date}</span>
          {content.time && (
            <>
              <span style={muted}>·</span>
              <span>{content.time}</span>
            </>
          )}
        </div>
        <p className="text-[7px] uppercase tracking-[0.2em]" style={muted}>{content.venue}</p>

        {(content.dressCode || content.palette?.length) && (
          <div className="flex items-center justify-center gap-1.5">
            {content.dressCode && (
              <span className="text-[6px] uppercase tracking-[0.18em]" style={muted}>
                Mavazi · {content.dressCode}
              </span>
            )}
            {content.palette?.map((c, i) => (
              <span key={i} className="h-2 w-2 rounded-full ring-1 ring-black/10" style={{ backgroundColor: c }} aria-hidden="true" />
            ))}
          </div>
        )}

        {(content.rsvp?.contacts.length || content.qr) && (
          <div className="flex items-end justify-between pt-1">
            {content.rsvp?.contacts.length ? (
              <div className="text-left">
                <p className="text-[6px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
                  {content.rsvp.label ?? 'RSVP'}
                </p>
                {content.rsvp.contacts.map((c) => (
                  <p key={c} className="text-[6.5px] tabular-nums leading-tight" style={muted}>{c}</p>
                ))}
              </div>
            ) : (
              <span />
            )}

            {content.qr ? (
              <div className="flex flex-col items-center gap-0.5">
                <QrGlyph color={ink} />
                {content.qr.label && (
                  <span className="text-[5.5px] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
                    {content.qr.label}
                  </span>
                )}
              </div>
            ) : (
              <span />
            )}
          </div>
        )}

        {content.branding && (
          <p className="pt-0.5 text-[5.5px] uppercase tracking-[0.3em]" style={muted}>{content.branding}</p>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Presets — map a catalog design onto structured content + a theme.
//  Invitation-type categories get the full block set; day-of stationery
//  (menus, programmes, thank-you, welcome signs) returns null and keeps its
//  legacy treatment render, since the invite block set doesn't apply to them.
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_EVENT_TYPE: Record<string, EventType> = {
  'Wedding Invitations': 'wedding',
  'All-in-One Wedding Invitations': 'wedding',
  'Save the Dates': 'wedding',
  'Reception Cards': 'wedding',
  'Engagement Invitations': 'kikao',
  'Bridal Shower Invitations': 'kitchen-party',
}

const TREATMENT_THEME_ID: Record<string, string> = {
  'floral-border': 'sage',
  'cultural-red': 'cream-gold',
  'navy-gold': 'ivory-navy',
  'blush-frame': 'blush',
  'sage-panel': 'sage',
  'classic-serif': 'cream-gold',
  'minimal-line': 'cream-gold',
  'arch-script': 'blush',
  'modern-block': 'ivory-navy',
  'photo-overlay': 'cream-gold',
}

export type ResolvedInvitation = { content: InvitationContent; theme: InvitationTheme }

export function resolveProductInvitation(p: {
  category: string
  treatment: string
  content?: InvitationContent
}): ResolvedInvitation | null {
  const theme =
    WEDDING_THEMES.find((t) => t.id === TREATMENT_THEME_ID[p.treatment]) ?? WEDDING_THEMES[0]
  if (p.content) return { content: p.content, theme }
  const eventType = CATEGORY_EVENT_TYPE[p.category]
  if (!eventType) return null
  return { content: { ...WEDDING_CONTENT_DEFAULT, eventType }, theme }
}

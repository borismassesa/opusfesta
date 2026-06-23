'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Heart, MapPin, Gift, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  FONT_STACKS,
  type Block,
  type HeroSpec,
  type Section,
  type Selection,
  type SiteDoc,
  type Theme,
  type Align,
} from '@/lib/builder/types'
import { MotifMark, SectionDivider, cardSurfaceClass } from './Motifs'

// ─────────────────────────────────────────────────────────────────────────────
//  SiteRenderer — renders a SiteDoc. Used by the editor canvas (editable) and
//  the live preview / published page (read-only).
// ─────────────────────────────────────────────────────────────────────────────

type RenderCtx = {
  theme: Theme
  editable: boolean
  compact: boolean
  selection?: Selection
  onSelectBlock?: (sectionId: string, blockId: string) => void
  onSelectSection?: (sectionId: string) => void
}

const alignText = (a: Align) =>
  a === 'left' ? 'text-left' : a === 'right' ? 'text-right' : a === 'justify' ? 'text-justify' : 'text-center'

const alignSelf = (a: Align) =>
  a === 'left' ? 'items-start' : a === 'right' ? 'items-end' : 'items-center'

export function SiteRenderer({
  doc,
  editable,
  compact,
  selection,
  onSelectBlock,
  onSelectSection,
}: {
  doc: SiteDoc
  editable: boolean
  compact: boolean
  selection?: Selection
  onSelectBlock?: (sectionId: string, blockId: string) => void
  onSelectSection?: (sectionId: string) => void
}) {
  const ctx: RenderCtx = { theme: doc.theme, editable, compact, selection, onSelectBlock, onSelectSection }
  return (
    <div style={{ backgroundColor: doc.theme.palette.surface, color: doc.theme.palette.ink }}>
      <SiteNav doc={doc} compact={compact} />
      {doc.sections.map((s) => (
        <SectionView key={s.id} section={s} ctx={ctx} />
      ))}
      <SiteFooter doc={doc} />
    </div>
  )
}

function SiteNav({ doc, compact }: { doc: SiteDoc; compact: boolean }) {
  return (
    <nav
      className={cn('flex items-center justify-between px-6 py-4', compact && 'px-4 py-3')}
      style={{ backgroundColor: doc.theme.palette.surface }}
    >
      <span
        className="text-[15px] font-semibold uppercase tracking-[0.12em]"
        style={{ fontFamily: FONT_STACKS[doc.theme.headingFont] }}
      >
        {doc.title}
      </span>
      {!compact ? (
        <div className="flex items-center gap-6 text-[13px]" style={{ color: doc.theme.palette.ink }}>
          {doc.nav.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      ) : (
        <span className="flex flex-col gap-1">
          <span className="h-0.5 w-5" style={{ backgroundColor: doc.theme.palette.ink }} />
          <span className="h-0.5 w-5" style={{ backgroundColor: doc.theme.palette.ink }} />
          <span className="h-0.5 w-5" style={{ backgroundColor: doc.theme.palette.ink }} />
        </span>
      )}
    </nav>
  )
}

function SiteFooter({ doc }: { doc: SiteDoc }) {
  return (
    <footer
      className="flex flex-col items-center gap-2 px-6 py-10 text-center"
      style={{ backgroundColor: doc.theme.palette.bg, color: doc.theme.palette.ink }}
    >
      {doc.theme.decor?.motif && doc.theme.decor.motif !== 'minimal' ? (
        <MotifMark motif={doc.theme.decor.motif} color={doc.theme.palette.accent} className="mb-1" />
      ) : (
        <Heart size={16} style={{ color: doc.theme.palette.accent }} />
      )}
      <p className="text-[15px]" style={{ color: doc.theme.palette.ink, fontFamily: FONT_STACKS[doc.theme.headingFont] }}>
        {doc.title}
      </p>
      <p className="text-[11px] uppercase tracking-[0.2em] opacity-60">Made with OpusPass</p>
    </footer>
  )
}

function SectionView({ section, ctx }: { section: Section; ctx: RenderCtx }) {
  const sectionSelected =
    ctx.selection?.kind === 'section' && ctx.selection.sectionId === section.id
  const isHero = section.type === 'hero'

  // A composed hero (from the Layout tab) renders via HeroView, not the generic
  // block flow.
  if (section.hero) {
    return (
      <section
        data-section={section.id}
        className={cn('relative w-full', sectionSelected && ctx.editable && 'outline outline-2 -outline-offset-2 outline-[#C9A0DC]')}
        style={{ backgroundColor: section.background.value }}
      >
        <HeroView spec={section.hero} theme={ctx.theme} compact={ctx.compact} />
      </section>
    )
  }

  // Hero "Split Editorial" → image is on the right, content on a light left
  // column, so the content is NOT on a photo. "Modern Minimalist" (photo) →
  // full-bleed image behind the content. "Classic Centered" → no photo.
  const split = isHero && section.layout === 'split'
  const fullPhoto = section.background.kind === 'image' && (!isHero || section.layout === 'photo')
  const onPhoto = fullPhoto

  const blocks = (
    <div className={cn('mx-auto flex w-full max-w-2xl flex-col', alignSelf(blocksAlign(section)))}>
      {!onPhoto && <SectionDivider decor={ctx.theme.decor} color={ctx.theme.palette.accent} />}
      {section.blocks.map((b) => (
        <BlockView key={b.id} block={b} section={section} ctx={ctx} onPhoto={onPhoto} />
      ))}
    </div>
  )

  const padY = ctx.compact ? section.padding * 0.6 : section.padding

  return (
    <section
      data-section={section.id}
      onClick={
        ctx.editable
          ? (e) => {
              if (e.target === e.currentTarget) ctx.onSelectSection?.(section.id)
            }
          : undefined
      }
      className={cn(
        'relative w-full',
        sectionSelected && ctx.editable && 'outline outline-2 -outline-offset-2 outline-[#C9A0DC]',
      )}
      style={{
        backgroundColor: fullPhoto ? undefined : section.background.kind === 'color' ? section.background.value : ctx.theme.palette.bg,
      }}
    >
      {fullPhoto && (
        <>
          <Image src={section.background.value} alt="" fill sizes="920px" className="object-cover" priority={isHero} />
          <div aria-hidden className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${section.background.overlay / 100})` }} />
        </>
      )}

      {split ? (
        <div className={cn('relative z-[1] grid', ctx.compact ? 'grid-cols-1' : 'grid-cols-2')}>
          <div className="flex flex-col justify-center px-8" style={{ paddingTop: padY, paddingBottom: padY }}>
            {blocks}
          </div>
          <div className="relative min-h-[260px]">
            <Image
              src={section.background.kind === 'image' ? section.background.value : '/assets/images/couples_together.jpg'}
              alt=""
              fill
              sizes="460px"
              className="object-cover"
            />
          </div>
        </div>
      ) : (
        <div className="relative z-[1]" style={{ paddingTop: padY, paddingBottom: padY, paddingLeft: 24, paddingRight: 24 }}>
          {blocks}
        </div>
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  HeroView — the eight "Layout" treatments
// ─────────────────────────────────────────────────────────────────────────────

function HeroView({ spec, theme, compact }: { spec: HeroSpec; theme: Theme; compact: boolean }) {
  const heading = FONT_STACKS[theme.headingFont]
  const [iA, iB] = spec.monogram.split(' & ')

  const Monogram = (
    <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
      <span
        className="flex items-end leading-none text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
        style={{ fontFamily: heading }}
      >
        <span style={{ fontSize: compact ? 52 : 96 }}>{iA}</span>
        <span className="mx-1 italic" style={{ fontSize: compact ? 24 : 44 }}>&amp;</span>
        <span style={{ fontSize: compact ? 52 : 96 }}>{iB}</span>
      </span>
    </div>
  )

  const Names = (
    <div
      className="flex flex-col items-center px-6 py-12 text-center"
      style={{ backgroundColor: theme.palette.surface }}
    >
      <HeroNames spec={spec} theme={theme} />
    </div>
  )

  // Text only — no photo
  if (spec.kind === 'text') {
    return (
      <div className="flex flex-col items-center px-6 py-20 text-center" style={{ backgroundColor: theme.palette.surface }}>
        <HeroNames spec={spec} theme={theme} large />
      </div>
    )
  }

  // Keeps the white monogram legible on light photos.
  const Vignette = (
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-black/15 to-black/30" />
  )

  // Single page — photo left, names right
  if (spec.kind === 'single') {
    return (
      <div className={cn('grid', compact ? 'grid-cols-1' : 'grid-cols-2')}>
        <div className={cn('relative overflow-hidden', compact ? 'aspect-[16/10]' : 'min-h-[460px]')}>
          <Image src={spec.photos[0]} alt="" fill sizes="520px" className="wb-kenburns object-cover" priority />
          {Vignette}
          {Monogram}
        </div>
        <div className="flex flex-col items-center justify-center px-8 py-16 text-center" style={{ backgroundColor: theme.palette.surface }}>
          <HeroNames spec={spec} theme={theme} />
        </div>
      </div>
    )
  }

  // Photo arrangements with the monogram overlaid, names below
  return (
    <div>
      <div className="relative w-full overflow-hidden">
        <PhotoArrangement kind={spec.kind} photos={spec.photos} compact={compact} />
        {Vignette}
        {Monogram}
      </div>
      {Names}
    </div>
  )
}

function PhotoArrangement({ kind, photos, compact }: { kind: HeroSpec['kind']; photos: string[]; compact: boolean }) {
  if (kind === 'banner') {
    return (
      <div className="relative aspect-[16/7] w-full">
        <Image src={photos[0]} alt="" fill sizes="1000px" className="wb-kenburns object-cover" priority />
      </div>
    )
  }
  if (kind === 'full') {
    return (
      <div className="relative aspect-[16/9] w-full">
        <Image src={photos[0]} alt="" fill sizes="1000px" className="wb-kenburns object-cover" priority />
      </div>
    )
  }
  if (kind === 'side') {
    return (
      <div className={cn('grid grid-cols-2', compact ? 'h-[300px]' : 'h-[460px]')}>
        {photos.slice(0, 2).map((src, i) => (
          <div key={i} className="relative overflow-hidden">
            <Image src={src} alt="" fill sizes="500px" className={cn('object-cover', i === 0 ? 'wb-kenburns' : 'wb-kenburns-2')} />
          </div>
        ))}
      </div>
    )
  }
  if (kind === 'squares') {
    return (
      <div className={cn('relative', compact ? 'h-[300px]' : 'h-[460px]')}>
        <div className="absolute left-[4%] top-[6%] h-[68%] w-[52%] overflow-hidden">
          <Image src={photos[0]} alt="" fill sizes="500px" className="wb-kenburns object-cover" />
        </div>
        <div className="absolute bottom-[6%] right-[4%] h-[68%] w-[52%] overflow-hidden shadow-xl ring-4 ring-white">
          <Image src={photos[1] ?? photos[0]} alt="" fill sizes="500px" className="wb-kenburns-2 object-cover" />
        </div>
      </div>
    )
  }
  if (kind === 'marquee') {
    // Triple the photos for a seamless -33.333% scroll loop.
    const loop = [...photos, ...photos, ...photos]
    const cellW = compact ? 150 : 280
    return (
      <div className={cn('w-full overflow-hidden', compact ? 'h-[300px]' : 'h-[460px]')}>
        <div className="flex h-full w-max wb-hero-marquee">
          {loop.map((src, i) => (
            <div key={i} className="relative h-full" style={{ width: cellW }}>
              <Image src={src} alt="" fill sizes="280px" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  // slideshow
  return <HeroSlideshow photos={photos} />
}

function HeroSlideshow({ photos }: { photos: string[] }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (photos.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % photos.length), 3500)
    return () => clearInterval(t)
  }, [photos.length])
  return (
    <div className="relative aspect-[16/9] w-full">
      {photos.map((src, idx) => (
        <Image
          key={idx}
          src={src}
          alt=""
          fill
          sizes="1000px"
          priority={idx === 0}
          className={cn('object-cover transition-opacity duration-700', idx === i ? 'opacity-100' : 'opacity-0')}
        />
      ))}
    </div>
  )
}

function HeroNames({ spec, theme, large = false }: { spec: HeroSpec; theme: Theme; large?: boolean }) {
  const heading = FONT_STACKS[theme.headingFont]
  const size = large ? 46 : 38
  return (
    <>
      {theme.decor?.motif && theme.decor.motif !== 'minimal' && (
        <MotifMark motif={theme.decor.motif} color={theme.palette.accent} className="mb-3" />
      )}
      <h1 className="leading-tight" style={{ fontFamily: heading, color: spec.nameColor, fontSize: size }}>
        {spec.partnerA}
      </h1>
      <span className="my-1 text-[18px]" style={{ color: theme.palette.accent }}>
        &amp;
      </span>
      <h1 className="leading-tight" style={{ fontFamily: heading, color: spec.nameColor, fontSize: size }}>
        {spec.partnerB}
      </h1>
      {spec.welcome.trim() && (
        <p className="mt-4 max-w-md text-[15px]" style={{ color: theme.palette.ink, fontFamily: FONT_STACKS[theme.bodyFont] }}>
          {spec.welcome}
        </p>
      )}
      <p className="mt-4 text-[11px] font-semibold uppercase" style={{ color: theme.palette.ink, letterSpacing: '0.24em' }}>
        {spec.dateLabel}
      </p>
      <div className="mt-6 w-full max-w-md">
        <Countdown date={spec.countdownDate} label="" theme={theme} />
      </div>
    </>
  )
}

function blocksAlign(section: Section): Align {
  const heading = section.blocks.find((b) => b.type === 'heading')
  return heading?.align ?? 'center'
}

// ─────────────────────────────────────────────────────────────────────────────
//  Block dispatch
// ─────────────────────────────────────────────────────────────────────────────

function BlockView({
  block,
  section,
  ctx,
  onPhoto,
}: {
  block: Block
  section: Section
  ctx: RenderCtx
  onPhoto: boolean
}) {
  const selected =
    ctx.selection?.kind === 'block' &&
    ctx.selection.sectionId === section.id &&
    ctx.selection.blockId === block.id

  const wrapperClass = cn(
    'relative w-full',
    alignText(block.align),
    ctx.editable && 'cursor-pointer transition-[outline] duration-100',
    ctx.editable && !selected && 'hover:outline hover:outline-1 hover:outline-[#C9A0DC]/50',
    ctx.editable && selected && 'outline outline-2 outline-offset-4 outline-[#C9A0DC]',
  )

  return (
    <div
      data-block={block.id}
      onClick={
        ctx.editable
          ? (e) => {
              e.stopPropagation()
              ctx.onSelectBlock?.(section.id, block.id)
            }
          : undefined
      }
      className={wrapperClass}
      style={{ marginTop: block.mt, marginBottom: block.mb }}
    >
      {selected && ctx.editable && <SelectionHandles label={block.type} />}
      <BlockBody block={block} ctx={ctx} onPhoto={onPhoto} />
    </div>
  )
}

/** White-ish text is invisible on a light background — fall back to ink. */
function isLight(hex: string) {
  const h = hex.replace('#', '')
  if (h.length < 6) return /fff/i.test(h)
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b > 210
}

function BlockBody({ block, ctx, onPhoto }: { block: Block; ctx: RenderCtx; onPhoto: boolean }) {
  const { theme, compact } = ctx
  const readable = (color: string) => (!onPhoto && isLight(color) ? theme.palette.ink : color)
  switch (block.type) {
    case 'eyebrow': {
      const eb = theme.decor?.eyebrow ?? 'tracked'
      if (eb === 'script') {
        // Flowing script eyebrow (e.g. the floral template).
        return (
          <p
            className="text-[26px]"
            style={{
              color: readable(theme.palette.accent),
              fontFamily: FONT_STACKS.Yellowtail,
              textShadow: onPhoto ? '0 1px 4px rgba(0,0,0,0.4)' : undefined,
            }}
          >
            {block.text}
          </p>
        )
      }
      if (eb === 'rule') {
        // Small-caps label flanked by short rules.
        return (
          <span className="inline-flex items-center gap-3">
            <span className="h-px w-6" style={{ backgroundColor: readable(block.color), opacity: 0.5 }} />
            <span
              className="text-[11px] font-semibold uppercase"
              style={{ color: readable(block.color), letterSpacing: `${Math.max(block.letterSpacing, 16) * 0.01}em` }}
            >
              {block.text}
            </span>
            <span className="h-px w-6" style={{ backgroundColor: readable(block.color), opacity: 0.5 }} />
          </span>
        )
      }
      return (
        <p
          className="text-[11px] font-semibold uppercase"
          style={{
            color: readable(block.color),
            letterSpacing: `${block.letterSpacing * 0.01}em`,
            textShadow: onPhoto ? '0 1px 4px rgba(0,0,0,0.4)' : undefined,
          }}
        >
          {block.text}
        </p>
      )
    }
    case 'heading': {
      const upper = theme.decor?.headingUpper ?? false
      return (
        <h1
          className="leading-[1.05]"
          style={{
            fontFamily: FONT_STACKS[block.font],
            fontSize: compact ? Math.round(block.fontSize * 0.62) : block.fontSize,
            letterSpacing: upper ? '0.06em' : `${block.letterSpacing * 0.02}em`,
            textTransform: upper ? 'uppercase' : undefined,
            color: block.color,
            textShadow: onPhoto ? '0 1px 12px rgba(255,255,255,0.25)' : undefined,
          }}
        >
          {block.text || 'Your headline'}
        </h1>
      )
    }
    case 'text':
      return (
        <p
          className="mx-auto max-w-xl leading-relaxed"
          style={{
            fontSize: compact ? Math.round(block.fontSize * 0.9) : block.fontSize,
            color: readable(block.color),
            fontFamily: FONT_STACKS[theme.bodyFont],
            textShadow: onPhoto ? '0 1px 4px rgba(0,0,0,0.45)' : undefined,
          }}
        >
          {block.text}
        </p>
      )
    case 'button':
      return (
        <span
          className="inline-flex items-center rounded-full px-6 py-3 text-[13.5px] font-semibold shadow-lg"
          style={
            block.variant === 'solid'
              ? { backgroundColor: theme.palette.ink, color: '#FFFFFF' }
              : {
                  backgroundColor: 'transparent',
                  color: onPhoto ? '#FFFFFF' : theme.palette.ink,
                  border: `1.5px solid ${onPhoto ? '#FFFFFF' : theme.palette.ink}`,
                }
          }
        >
          {block.label}
        </span>
      )
    case 'image':
      return (
        <div
          className="relative mx-auto w-full overflow-hidden"
          style={{ height: compact ? block.height * 0.7 : block.height, borderRadius: block.radius }}
        >
          <Image src={block.src} alt={block.alt} fill sizes="640px" className="object-cover" />
        </div>
      )
    case 'divider':
      return <span className="mx-auto block h-px w-24" style={{ backgroundColor: block.color }} />
    case 'countdown':
      return <Countdown date={block.date} label={block.label} theme={theme} />
    case 'rsvp':
      return <RsvpForm title={block.title} note={block.note} theme={theme} interactive={!ctx.editable} />
    case 'map':
      return <VenueMap venue={block.venue} address={block.address} theme={theme} />
    case 'registry':
      return <Registry items={block.items} theme={theme} />
    case 'gallery':
      return <Gallery images={block.images} />
    default:
      return null
  }
}

function SelectionHandles({ label }: { label: string }) {
  return (
    <>
      <span className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 rounded-md bg-[#7A3FB8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
        {label}
      </span>
      {['-left-1 -top-1', '-right-1 -top-1', '-left-1 -bottom-1', '-right-1 -bottom-1'].map((pos) => (
        <span
          key={pos}
          className={cn('pointer-events-none absolute h-2.5 w-2.5 rounded-[2px] border-2 border-[#C9A0DC] bg-white', pos)}
        />
      ))}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Widgets
// ─────────────────────────────────────────────────────────────────────────────

function Countdown({ date, label, theme }: { date: string; label: string; theme: Theme }) {
  // Client-only ticking — render zeros on the server so hydration matches.
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const target = new Date(`${date}T00:00:00`).getTime()
  const diff = now === null ? 0 : Math.max(0, target - now)
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  const units = [
    { v: days, l: 'Days' },
    { v: hours, l: 'Hours' },
    { v: mins, l: 'Minutes' },
    { v: secs, l: 'Seconds' },
  ]
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex items-stretch justify-center gap-3">
        {units.map((u) => (
          <div
            key={u.l}
            className="flex min-w-[62px] flex-1 flex-col items-center rounded-2xl px-2 py-3"
            style={{ backgroundColor: theme.palette.surface, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
          >
            <span
              className="text-[26px] font-bold tabular-nums"
              style={{ color: theme.palette.ink, fontFamily: FONT_STACKS[theme.headingFont] }}
            >
              {String(u.v).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] opacity-60">{u.l}</span>
          </div>
        ))}
      </div>
      {label && <p className="mt-3 text-center text-[13px] opacity-70">{label}</p>}
    </div>
  )
}

function RsvpForm({
  title,
  note,
  theme,
  interactive,
}: {
  title: string
  note: string
  theme: Theme
  interactive: boolean
}) {
  const [name, setName] = useState('')
  const [attending, setAttending] = useState<'yes' | 'no' | null>(null)
  const [guests, setGuests] = useState(1)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div
        className={cn('mx-auto w-full max-w-md px-6 py-10 text-center', cardSurfaceClass(theme.decor?.card))}
        style={{ backgroundColor: theme.palette.surface }}
      >
        <span
          className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.palette.accent }}
        >
          <Check size={22} style={{ color: theme.palette.onAccent }} />
        </span>
        <p className="text-[18px] font-semibold" style={{ fontFamily: FONT_STACKS[theme.headingFont] }}>
          Asante, {name || 'friend'}!
        </p>
        <p className="mt-1 text-[13px] opacity-70">
          {attending === 'yes' ? "We can't wait to celebrate with you." : 'We will miss you dearly.'}
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn('mx-auto w-full max-w-md px-6 py-7 text-left', cardSurfaceClass(theme.decor?.card))}
      style={{ backgroundColor: theme.palette.surface }}
    >
      <p className="text-center text-[18px] font-semibold" style={{ fontFamily: FONT_STACKS[theme.headingFont] }}>
        {title}
      </p>
      {note && <p className="mt-1 text-center text-[12.5px] opacity-70">{note}</p>}
      <div className="mt-5 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          disabled={!interactive}
          className="w-full rounded-lg border border-black/12 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#C9A0DC]"
        />
        <div className="grid grid-cols-2 gap-2">
          {(['yes', 'no'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={!interactive}
              onClick={() => setAttending(opt)}
              className={cn(
                'rounded-lg border py-2.5 text-[13px] font-semibold transition-colors',
                attending === opt ? 'text-[#1A1A1A]' : 'border-black/12 text-gray-600 hover:border-black/30',
              )}
              style={attending === opt ? { backgroundColor: theme.palette.accent, borderColor: theme.palette.accent } : undefined}
            >
              {opt === 'yes' ? 'Joyfully accepts' : 'Regretfully declines'}
            </button>
          ))}
        </div>
        {attending === 'yes' && (
          <label className="flex items-center justify-between rounded-lg border border-black/12 px-3 py-2 text-[13px]">
            <span className="opacity-70">Number of guests</span>
            <input
              type="number"
              min={1}
              max={10}
              value={guests}
              disabled={!interactive}
              onChange={(e) => setGuests(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
              className="w-14 bg-transparent text-right outline-none"
            />
          </label>
        )}
        <button
          type="button"
          disabled={!interactive || !name || !attending}
          onClick={() => setDone(true)}
          className="w-full rounded-full py-3 text-[14px] font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ backgroundColor: theme.palette.ink }}
        >
          Send RSVP
        </button>
        {!interactive && (
          <p className="text-center text-[11px] opacity-50">Live in preview &amp; on your published site</p>
        )}
      </div>
    </div>
  )
}

function VenueMap({ venue, address, theme }: { venue: string; address: string; theme: Theme }) {
  const query = encodeURIComponent(`${venue}, ${address}`)
  return (
    <div
      className={cn('mx-auto w-full max-w-md overflow-hidden text-left', cardSurfaceClass(theme.decor?.card))}
      style={{ backgroundColor: theme.palette.surface }}
    >
      <div className="relative h-36 w-full overflow-hidden" style={{ backgroundColor: '#E8EDE4' }}>
        {/* Stylised map backdrop */}
        <svg viewBox="0 0 400 144" className="h-full w-full" aria-hidden>
          <rect width="400" height="144" fill="#E8EDE4" />
          <path d="M0 40 H400 M0 96 H400 M120 0 V144 M280 0 V144" stroke="#D2DBC9" strokeWidth="6" />
          <path d="M0 70 Q120 50 200 80 T400 70" stroke="#BcCBE0" strokeWidth="10" fill="none" opacity="0.6" />
        </svg>
        <span
          className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full shadow-lg"
          style={{ backgroundColor: theme.palette.accent }}
        >
          <MapPin size={18} style={{ color: theme.palette.onAccent }} />
        </span>
      </div>
      <div className="px-5 py-4">
        <p className="text-[15px] font-semibold" style={{ fontFamily: FONT_STACKS[theme.headingFont] }}>
          {venue}
        </p>
        <p className="mt-0.5 text-[13px] opacity-70">{address}</p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${query}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold"
          style={{ color: '#7A3FB8' }}
          onClick={(e) => e.stopPropagation()}
        >
          <MapPin size={14} /> Open in Maps
        </a>
      </div>
    </div>
  )
}

function Registry({ items, theme }: { items: { id: string; label: string; href: string; hint: string }[]; theme: Theme }) {
  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((it) => (
        <a
          key={it.id}
          href={it.href}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'flex flex-col items-center gap-2 px-4 py-6 text-center transition-transform hover:-translate-y-0.5',
            cardSurfaceClass(theme.decor?.card),
          )}
          style={{ backgroundColor: theme.palette.surface }}
        >
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.palette.accent }}
          >
            <Gift size={18} style={{ color: theme.palette.onAccent }} />
          </span>
          <span className="text-[14px] font-semibold" style={{ fontFamily: FONT_STACKS[theme.headingFont] }}>
            {it.label}
          </span>
          <span className="text-[12px] opacity-65">{it.hint}</span>
        </a>
      ))}
    </div>
  )
}

function Gallery({ images }: { images: string[] }) {
  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-2 sm:grid-cols-3">
      {images.map((src, i) => (
        <div key={`${src}-${i}`} className="relative aspect-square overflow-hidden rounded-xl">
          <Image src={src} alt="" fill sizes="240px" className="object-cover" />
        </div>
      ))}
    </div>
  )
}

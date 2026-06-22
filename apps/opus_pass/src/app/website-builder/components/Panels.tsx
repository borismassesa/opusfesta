'use client'

import { useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  GripVertical,
  Lock,
  Globe,
  Megaphone,
  Pencil,
  Search,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FONT_STACKS } from '@/lib/builder/types'
import {
  ANIMATION_STYLES,
  DESIGN_COLORS,
  DESIGN_PRESETS,
  DESIGN_STYLES,
  FONT_EFFECTS,
  TRANSITIONS,
  formatLongDate,
  LAYOUT_OPTIONS,
  type DesignColor,
  type DesignPreset,
  type DesignStyle,
} from '@/lib/builder/presets'
import type { BuilderApi } from '../useBuilder'
import { Field, TextInput } from './ui'

// ─────────────────────────────────────────────────────────────────────────────
//  Shared bits
// ─────────────────────────────────────────────────────────────────────────────

function PanelTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[20px] font-semibold tracking-tight text-[#1A1A1A]">{children}</h2>
      {action}
    </div>
  )
}

function FilterMenu({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string | null
  onChange: (v: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
          value ? 'border-[#C9A0DC] bg-[#F3EAFA] text-[#7A3FB8]' : 'border-black/15 text-gray-700 hover:border-black/30',
        )}
      >
        {value ?? label}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1.5 w-40 overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className="flex w-full items-center justify-between px-3.5 py-2 text-left text-[13.5px] hover:bg-[#F3EAFA]"
          >
            All {label}
            {!value && <Check size={14} className="text-[#7A3FB8]" />}
          </button>
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between px-3.5 py-2 text-left text-[13.5px] hover:bg-[#F3EAFA]"
            >
              {o}
              {value === o && <Check size={14} className="text-[#7A3FB8]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  DESIGN — "Pick a design"
// ─────────────────────────────────────────────────────────────────────────────

export function DesignPanel({ api }: { api: BuilderApi }) {
  const [style, setStyle] = useState<DesignStyle | null>(null)
  const [color, setColor] = useState<DesignColor | null>(null)
  const current = api.doc.meta.presetId

  const visible = DESIGN_PRESETS.filter(
    (p) => (!style || p.style === style) && (!color || p.color === color),
  )

  return (
    <div className="space-y-5">
      <PanelTitle action={<span className="text-[13px] font-medium text-gray-500">Sort: Featured</span>}>
        Pick a design
      </PanelTitle>

      <div className="flex items-center gap-2">
        <FilterMenu label="Style" options={DESIGN_STYLES} value={style} onChange={(v) => setStyle(v as DesignStyle | null)} />
        <FilterMenu label="Color" options={DESIGN_COLORS} value={color} onChange={(v) => setColor(v as DesignColor | null)} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-6 xl:grid-cols-3">
        {visible.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => api.updateMeta({ presetId: p.id })}
            className="group text-left"
          >
            <div
              className={cn(
                'relative overflow-hidden rounded-lg ring-1 transition-all',
                p.id === current ? 'ring-2 ring-[#7A3FB8]' : 'ring-black/10 group-hover:ring-black/25',
              )}
            >
              <DesignThumb preset={p} />
              {p.id === current && (
                <span className="absolute left-2 top-2 rounded-md bg-[#7A3FB8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                  Current
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[13.5px] font-semibold text-[#1A1A1A]">{p.name}</span>
              <span className="flex items-center gap-1">
                {p.swatches.map((c, i) => (
                  <span
                    key={i}
                    aria-hidden
                    className="block h-3 w-3 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/** Tiny CSS mock of the hero in the preset's colours + fonts. */
function DesignThumb({ preset }: { preset: DesignPreset }) {
  const p = preset.palette
  const heading = { fontFamily: FONT_STACKS[preset.headingFont], color: p.accent, lineHeight: 1.05 }
  return (
    <div className="aspect-[4/5] w-full" style={{ backgroundColor: p.surface }}>
      {/* pt-7 leaves the top-left corner clear for the "Current" badge */}
      <div className="flex h-full flex-col items-center px-3 pb-3.5 pt-7 text-center">
        <div className="flex flex-1 flex-col items-center justify-center gap-1">
          <span style={{ ...heading, fontSize: 16 }}>Neema</span>
          <span style={{ color: p.accent, fontSize: 8 }}>&amp;</span>
          <span style={{ ...heading, fontSize: 16 }}>Amani</span>
          <span className="my-1 block h-px w-5" style={{ backgroundColor: p.accent, opacity: 0.4 }} />
          <span className="text-[5.5px] uppercase tracking-[0.22em]" style={{ color: p.ink, opacity: 0.6 }}>
            22 Aug 2026
          </span>
        </div>
        <span
          className="rounded-full px-3 py-1 text-[5px] font-bold uppercase tracking-[0.16em]"
          style={{ backgroundColor: p.accent, color: p.onAccent }}
        >
          RSVP
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

export function LayoutPanel({ api }: { api: BuilderApi }) {
  const meta = api.doc.meta
  return (
    <div className="space-y-6">
      <PanelTitle>Layout</PanelTitle>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LAYOUT_OPTIONS.map((l) => {
          const active = meta.layoutId === l.id
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => api.updateMeta({ layoutId: l.id })}
              className="text-center"
            >
              <div
                className={cn(
                  'flex aspect-[5/4] items-center justify-center rounded-xl border-2 bg-[#F7F6F2] p-3 transition-colors',
                  active ? 'border-[#7A3FB8]' : 'border-transparent ring-1 ring-black/10 hover:ring-black/25',
                )}
              >
                <LayoutGlyph id={l.id} />
              </div>
              <span className={cn('mt-1.5 block text-[12.5px]', active ? 'font-bold text-[#1A1A1A]' : 'font-medium text-gray-600')}>
                {l.label}
              </span>
            </button>
          )
        })}
      </div>

      <div>
        <Field label="Welcome message">
          <TextInput
            value={meta.welcome}
            onChange={(v) => api.updateMeta({ welcome: v.slice(0, 150) })}
            placeholder="We're getting married!"
          />
        </Field>
        <p className="mt-1 text-right text-[11px] text-gray-400">{meta.welcome.length}/150</p>
      </div>

      <div className="rounded-2xl bg-[#F3EAFA] p-5">
        <p className="text-[15px] font-bold text-[#7A3FB8]">Test drive your save the dates</p>
        <p className="mt-1 text-[13px] text-gray-700">
          See your paper in real life, printed with your names and wedding date.
        </p>
        <button
          type="button"
          className="mt-3 rounded-full bg-[#1A1A1A] px-4 py-2 text-[13px] font-semibold text-white hover:bg-black"
        >
          Get your free sample
        </button>
      </div>
    </div>
  )
}

function LayoutGlyph({ id }: { id: string }) {
  const bar = 'rounded-[3px] bg-black/15'
  switch (id) {
    case 'banner':
      return <div className="flex w-full flex-col gap-1"><div className={cn(bar, 'h-6 w-full')} /></div>
    case 'full-width':
      return <div className={cn(bar, 'h-12 w-full')} />
    case 'side-by-side':
      return <div className="flex w-full gap-1"><div className={cn(bar, 'h-12 flex-[2]')} /><div className={cn(bar, 'h-12 flex-1')} /></div>
    case 'squares':
      return <div className="grid w-full grid-cols-2 gap-1"><div className={cn(bar, 'aspect-square')} /><div className={cn(bar, 'aspect-square')} /></div>
    case 'slideshow':
      return <div className="relative w-full"><div className={cn(bar, 'h-12 w-full')} /><div className="absolute inset-y-0 right-1 my-auto h-6 w-1 rounded bg-black/25" /></div>
    case 'marquee':
      return <div className="flex w-full gap-1"><div className={cn(bar, 'h-12 w-6')} /><div className={cn(bar, 'h-12 w-6')} /><div className={cn(bar, 'h-12 w-6')} /></div>
    case 'text-only':
      return <span className="rounded border border-black/30 px-2 py-1 text-[10px] font-semibold text-black/50">ABC</span>
    case 'single-page':
      return <div className="flex w-full gap-1"><div className={cn(bar, 'h-12 flex-1')} /><div className="h-12 w-2 rounded bg-black/25" /></div>
    default:
      return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGES
// ─────────────────────────────────────────────────────────────────────────────

export function PagesPanel({ api }: { api: BuilderApi }) {
  const meta = api.doc.meta
  const setPageVisible = (key: string, visible: boolean) =>
    api.updateMeta({ pages: meta.pages.map((p) => (p.key === key ? { ...p, visible } : p)) })

  return (
    <div className="space-y-6">
      <PanelTitle action={<Pencil size={16} className="text-gray-400" />}>Home</PanelTitle>

      <Accordion title="Your names" defaultOpen>
        <div className="space-y-3">
          <Field label="Partner one">
            <TextInput value={meta.partnerA} onChange={(v) => api.updateMeta({ partnerA: v })} />
          </Field>
          <Field label="Partner two">
            <TextInput value={meta.partnerB} onChange={(v) => api.updateMeta({ partnerB: v })} />
          </Field>
        </div>
      </Accordion>

      <Accordion title="Wedding details" defaultOpen>
        <div className="space-y-3">
          <Field label="Date">
            <input
              type="date"
              value={meta.date}
              onChange={(e) => api.updateMeta({ date: e.target.value })}
              className="w-full rounded-lg border border-black/12 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-[#C9A0DC] focus:ring-2 focus:ring-[#C9A0DC]/30"
            />
            <p className="mt-1 text-[12px] text-gray-500">{formatLongDate(meta.date)}</p>
          </Field>
          <Field label="Location">
            <TextInput value={meta.location} onChange={(v) => api.updateMeta({ location: v })} placeholder="City, Country" />
          </Field>
        </div>
      </Accordion>

      <Accordion title="Pages">
        <div className="overflow-hidden rounded-xl border border-black/10">
          {meta.pages.map((p, i) => (
            <div
              key={p.key}
              className={cn('flex items-center gap-3 px-3 py-2.5', i > 0 && 'border-t border-black/8')}
            >
              <GripVertical size={15} className="text-gray-300" />
              <span className={cn('flex-1 text-[14px]', p.visible ? 'text-[#1A1A1A]' : 'text-gray-400')}>{p.label}</span>
              <button
                type="button"
                aria-label={p.visible ? `Hide ${p.label}` : `Show ${p.label}`}
                onClick={() => setPageVisible(p.key, !p.visible)}
                className="text-gray-400 transition-colors hover:text-[#7A3FB8]"
              >
                {p.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-gray-500">Toggle a page to show or hide it from your guests.</p>
      </Accordion>
    </div>
  )
}

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-black/8 pb-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-1 text-left"
      >
        <span className="text-[15px] font-bold text-[#1A1A1A]">{title}</span>
        <ChevronDown size={18} className={cn('text-gray-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  ANIMATION
// ─────────────────────────────────────────────────────────────────────────────

export function AnimationPanel({ api }: { api: BuilderApi }) {
  const meta = api.doc.meta
  return (
    <div className="space-y-7 pb-24">
      <span className="inline-block rounded-md bg-gradient-to-r from-[#3FA9C9] to-[#8350E8] px-2.5 py-1 text-[11px] font-bold text-white">
        Premium
      </span>

      <Section title="Animation" onClear={() => api.updateMeta({ animationStyle: 'none' })}>
        <div className="grid grid-cols-3 gap-3">
          {ANIMATION_STYLES.filter((a) => a.id !== 'none').map((a) => (
            <Tile
              key={a.id}
              label={a.label}
              active={meta.animationStyle === a.id}
              onClick={() => api.updateMeta({ animationStyle: a.id })}
            >
              <Sparkles size={20} className="text-[#7A3FB8]" />
            </Tile>
          ))}
        </div>
      </Section>

      <Section title="Transitions" onClear={() => api.updateMeta({ transition: 'rise' })}>
        <div className="grid grid-cols-4 gap-3">
          {TRANSITIONS.map((t) => (
            <Tile
              key={t.id}
              label={t.label}
              active={meta.transition === t.id}
              onClick={() => api.updateMeta({ transition: t.id })}
            >
              <span className="text-[11px] font-bold text-[#1A1A1A]">ABC</span>
            </Tile>
          ))}
        </div>
      </Section>

      <Section title="Font effects" onClear={() => api.updateMeta({ fontEffect: 'none' })}>
        <div className="grid grid-cols-3 gap-3">
          {FONT_EFFECTS.filter((f) => f.id !== 'none').map((f) => (
            <Tile
              key={f.id}
              label={f.label}
              active={meta.fontEffect === f.id}
              onClick={() => api.updateMeta({ fontEffect: f.id })}
            >
              <span className="text-[11px] font-bold text-[#1A1A1A]">Aa</span>
            </Tile>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  onClear,
  children,
}: {
  title: string
  onClear: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[17px] font-bold text-[#1A1A1A]">{title}</h3>
        <button type="button" onClick={onClear} className="text-[13px] font-semibold text-gray-500 underline hover:text-[#1A1A1A]">
          Clear
        </button>
      </div>
      {children}
    </div>
  )
}

function Tile({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button type="button" onClick={onClick} className="text-center">
      <div
        className={cn(
          'flex aspect-square items-center justify-center rounded-xl bg-[#F7F6F2] transition-all',
          active ? 'ring-2 ring-[#7A3FB8]' : 'ring-1 ring-black/10 hover:ring-black/25',
        )}
      >
        {children}
      </div>
      <span className={cn('mt-1.5 block text-[12.5px]', active ? 'font-bold text-[#1A1A1A]' : 'font-medium text-gray-600')}>
        {label}
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export function SettingsPanel({ api }: { api: BuilderApi }) {
  const meta = api.doc.meta
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-[17px] font-bold text-[#1A1A1A]">General settings</h3>
        <div className="overflow-hidden rounded-2xl border border-black/10">
          <SettingRow
            icon={<Globe size={17} />}
            title="Website visibility"
            sub="Make the site viewable to your guests."
            value={
              <ValuePill
                on={meta.visibility === 'published'}
                onLabel="Published"
                offLabel="Private"
                onToggle={() => api.updateMeta({ visibility: meta.visibility === 'published' ? 'private' : 'published' })}
              />
            }
          />
          <SettingRow
            icon={<Megaphone size={17} />}
            title="Announcement banner"
            sub="Share important messages with guests."
            value={
              <ValuePill
                on={meta.announcement}
                onLabel="Enabled"
                offLabel="Not enabled"
                onToggle={() => api.updateMeta({ announcement: !meta.announcement })}
              />
            }
          />
          <SettingRow
            icon={<Pencil size={17} />}
            title="Website title and display"
            sub="Shown at the top of your site."
            value={<span className="text-[13.5px] font-semibold text-gray-700">{api.doc.title}</span>}
          />
          <SettingRow
            icon={<ChevronRight size={17} />}
            title="Website URL"
            sub="Personalize your website link."
            value={<span className="max-w-[160px] truncate text-[13.5px] font-semibold text-gray-700">{meta.slug}</span>}
          >
            <div className="mt-3 flex items-center rounded-lg border border-black/12 bg-white px-3 py-2 text-[13px]">
              <span className="text-gray-400">opuspass.opusfesta.com/i/</span>
              <input
                value={meta.slug}
                onChange={(e) => api.updateMeta({ slug: slugify(e.target.value) })}
                className="min-w-0 flex-1 bg-transparent font-semibold text-[#1A1A1A] outline-none"
              />
            </div>
          </SettingRow>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[17px] font-bold text-[#1A1A1A]">Privacy settings</h3>
        <div className="overflow-hidden rounded-2xl border border-black/10">
          <SettingRow
            icon={<Lock size={17} />}
            title="Password protection"
            sub="Limit access to guests with a password."
            value={
              <ValuePill
                on={meta.password}
                onLabel="Enabled"
                offLabel="Not enabled"
                onToggle={() => api.updateMeta({ password: !meta.password })}
              />
            }
          />
          <SettingRow
            icon={<Search size={17} />}
            title="Search engine visibility"
            sub="Appear on Google, etc.?"
            value={
              <ValuePill
                on={meta.searchVisible}
                onLabel="Enabled"
                offLabel="Hidden"
                onToggle={() => api.updateMeta({ searchVisible: !meta.searchVisible })}
              />
            }
          />
        </div>
      </div>
    </div>
  )
}

function SettingRow({
  icon,
  title,
  sub,
  value,
  children,
}: {
  icon: React.ReactNode
  title: string
  sub: string
  value: React.ReactNode
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-black/8 last:border-b-0">
      <button
        type="button"
        onClick={() => children && setOpen((v) => !v)}
        className={cn('flex w-full items-center gap-3 px-4 py-4 text-left', !children && 'cursor-default')}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3EAFA] text-[#7A3FB8]">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold text-[#1A1A1A]">{title}</span>
          <span className="block text-[12.5px] text-gray-500">{sub}</span>
        </span>
        <span onClick={(e) => e.stopPropagation()}>{value}</span>
      </button>
      {children && open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

function ValuePill({
  on,
  onLabel,
  offLabel,
  onToggle,
}: {
  on: boolean
  onLabel: string
  offLabel: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn('text-[13.5px] font-semibold transition-colors', on ? 'text-[#3FA34D]' : 'text-gray-400')}
    >
      {on ? onLabel : offLabel}
    </button>
  )
}

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, 40)
}

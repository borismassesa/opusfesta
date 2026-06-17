'use client'

import Image from 'next/image'
import {
  Check,
  Type,
  Heading,
  Image as ImageIcon,
  Minus,
  MousePointerClick,
  Calendar,
  Hourglass,
  Map as MapIcon,
  Gift,
  GalleryHorizontalEnd,
  Plus,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BlockType, HeroLayout, SectionType } from '@/lib/builder/types'
import type { BuilderApi } from '../useBuilder'
import { SectionLabel } from './ui'

type Api = BuilderApi
export type LeftTab = 'Layouts' | 'Elements' | 'Widgets' | 'Styles'

const TEMPLATES: { id: HeroLayout; name: string; thumb: 'centered' | 'split' | 'photo' }[] = [
  { id: 'centered', name: 'Classic Centered', thumb: 'centered' },
  { id: 'split', name: 'Split Editorial', thumb: 'split' },
  { id: 'photo', name: 'Modern Minimalist', thumb: 'photo' },
]

const ELEMENTS: { type: BlockType; label: string; icon: LucideIcon }[] = [
  { type: 'heading', label: 'Heading', icon: Heading },
  { type: 'text', label: 'Text', icon: Type },
  { type: 'button', label: 'Button', icon: MousePointerClick },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'divider', label: 'Divider', icon: Minus },
  { type: 'gallery', label: 'Gallery', icon: GalleryHorizontalEnd },
]

const WIDGETS: { type: BlockType; label: string; icon: LucideIcon }[] = [
  { type: 'rsvp', label: 'RSVP Form', icon: Calendar },
  { type: 'countdown', label: 'Countdown', icon: Hourglass },
  { type: 'map', label: 'Venue Map', icon: MapIcon },
  { type: 'registry', label: 'Registry', icon: Gift },
]

const SECTION_PRESETS: { type: SectionType; label: string }[] = [
  { type: 'content', label: 'Our Story' },
  { type: 'details', label: 'Wedding Day' },
  { type: 'rsvp', label: 'RSVP' },
  { type: 'registry', label: 'Registry' },
  { type: 'gallery', label: 'Gallery' },
]

/** Resolve which section new blocks should be added to. */
function targetSectionId(api: Api): string {
  const sel = api.selection
  if (sel) return sel.sectionId
  return api.doc.sections[api.doc.sections.length - 1]?.id ?? api.doc.sections[0].id
}

export function LeftPanel({ tab, api }: { tab: LeftTab; api: Api }) {
  if (tab === 'Layouts') return <LayoutsTab api={api} />
  if (tab === 'Elements') return <ElementsTab api={api} />
  if (tab === 'Widgets') return <WidgetsTab api={api} />
  return <StylesTab api={api} />
}

function LayoutsTab({ api }: { api: Api }) {
  const hero = api.doc.sections.find((s) => s.type === 'hero')
  return (
    <>
      <SectionLabel>Hero Templates</SectionLabel>
      <div className="mt-3 space-y-3">
        {TEMPLATES.map((t) => {
          const selected = hero?.layout === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => hero && api.updateSection(hero.id, { layout: t.id })}
              className={cn(
                'group block w-full overflow-hidden rounded-2xl border bg-white text-left transition-all',
                selected ? 'border-transparent ring-2 ring-[#C9A0DC]' : 'border-black/8 hover:border-black/20',
              )}
            >
              <div className="aspect-[16/9] w-full overflow-hidden">
                <TemplateThumb variant={t.thumb} />
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-[13.5px] font-semibold">{t.name}</span>
                {selected && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A0DC] text-[#1A1A1A]">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-7">
        <SectionLabel>Add a Section</SectionLabel>
        <div className="mt-3 space-y-2">
          {SECTION_PRESETS.map((s) => (
            <button
              key={s.type}
              type="button"
              onClick={() => api.addSection(s.type)}
              className="flex w-full items-center justify-between rounded-xl border border-black/8 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold transition-colors hover:border-[#C9A0DC] hover:bg-[#FBF7FE]"
            >
              {s.label}
              <Plus size={15} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      <PageOutline api={api} />
    </>
  )
}

function ElementsTab({ api }: { api: Api }) {
  return (
    <>
      <SectionLabel>Elements</SectionLabel>
      <p className="mt-1 text-[12.5px] leading-relaxed text-gray-500">
        Click to add to the selected section.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {ELEMENTS.map(({ type, label, icon: Icon }) => (
          <AddTile key={type} label={label} icon={Icon} onClick={() => api.addBlock(targetSectionId(api), type)} />
        ))}
      </div>
      <PageOutline api={api} />
    </>
  )
}

function WidgetsTab({ api }: { api: Api }) {
  return (
    <>
      <SectionLabel>Essential Widgets</SectionLabel>
      <p className="mt-1 text-[12.5px] leading-relaxed text-gray-500">
        Fully interactive — they work in preview and on your live site.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {WIDGETS.map(({ type, label, icon: Icon }) => (
          <AddTile key={type} label={label} icon={Icon} onClick={() => api.addBlock(targetSectionId(api), type)} />
        ))}
      </div>
      <PageOutline api={api} />
    </>
  )
}

function StylesTab({ api }: { api: Api }) {
  const p = api.doc.theme.palette
  return (
    <>
      <SectionLabel>Theme</SectionLabel>
      <button
        type="button"
        onClick={() => api.select(null)}
        className="mt-3 flex w-full items-center justify-between rounded-xl border border-black/8 bg-white px-3.5 py-3 text-left transition-colors hover:border-[#C9A0DC]"
      >
        <span className="text-[13.5px] font-semibold">Edit palette &amp; fonts</span>
        <span className="flex items-center gap-1">
          {[p.bg, p.surface, p.ink, p.accent].map((c, i) => (
            <span key={i} className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: c }} />
          ))}
        </span>
      </button>
      <p className="mt-2 text-[12.5px] leading-relaxed text-gray-500">
        Opens the site theme controls in the inspector on the right.
      </p>
      <PageOutline api={api} />
    </>
  )
}

function AddTile({ label, icon: Icon, onClick }: { label: string; icon: LucideIcon; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-black/8 bg-white px-2 py-4 text-center transition-colors hover:border-[#C9A0DC] hover:bg-[#FBF7FE]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3EAFA] text-[#7A3FB8]">
        <Icon size={16} />
      </span>
      <span className="text-[12px] font-semibold text-gray-700">{label}</span>
    </button>
  )
}

function PageOutline({ api }: { api: Api }) {
  return (
    <div className="mt-7">
      <SectionLabel>Page Outline</SectionLabel>
      <div className="mt-3 space-y-1">
        {api.doc.sections.map((s) => {
          const active = api.selection?.sectionId === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => api.select({ kind: 'section', sectionId: s.id })}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors',
                active ? 'bg-[#F3EAFA] text-[#7A3FB8]' : 'text-gray-600 hover:bg-black/5',
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: active ? '#7A3FB8' : '#C9A0DC' }} />
              {s.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TemplateThumb({ variant }: { variant: 'centered' | 'split' | 'photo' }) {
  if (variant === 'photo') {
    return (
      <div className="relative h-full w-full">
        <Image src="/assets/images/couples_together.jpg" alt="" fill sizes="240px" className="object-cover" />
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="h-1 w-10 rounded-full bg-white/85" />
          <span className="h-1.5 w-16 rounded-full bg-white" />
        </div>
      </div>
    )
  }
  if (variant === 'split') {
    return (
      <div className="flex h-full w-full">
        <div className="flex w-1/2 flex-col items-center justify-center gap-1 bg-[#EFEDE7]">
          <span className="h-1 w-8 rounded-full bg-black/20" />
          <span className="h-1.5 w-12 rounded-full bg-black/40" />
        </div>
        <div className="w-1/2 bg-[#D8E0CF]" />
      </div>
    )
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-[#EFEDE7]">
      <span className="h-1 w-10 rounded-full bg-black/20" />
      <span className="h-2 w-20 rounded-full bg-black/40" />
      <span className="h-1 w-8 rounded-full bg-black/20" />
    </div>
  )
}

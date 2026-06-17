'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Check,
  Loader2,
  ZoomIn,
  ZoomOut,
  Layers,
  LayoutGrid,
  Plus,
  X,
  Wand2,
  LayoutTemplate,
  Shapes,
  Blocks,
  Palette,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FONT_STACKS, type SectionType } from '@/lib/builder/types'
import { useBuilder } from './useBuilder'
import { LeftPanel, type LeftTab } from './components/LeftPanel'
import { Inspector, inspectorTitle } from './components/Inspector'
import { SiteRenderer } from './components/SiteRenderer'

type Device = 'desktop' | 'tablet' | 'mobile'

const ACCENT = '#C9A0DC'

const LEFT_TABS: { key: LeftTab; icon: LucideIcon }[] = [
  { key: 'Layouts', icon: LayoutTemplate },
  { key: 'Elements', icon: Shapes },
  { key: 'Widgets', icon: Blocks },
  { key: 'Styles', icon: Palette },
]

export default function WebsiteBuilderClient() {
  const api = useBuilder()
  const [leftTab, setLeftTab] = useState<LeftTab>('Layouts')
  const [device, setDevice] = useState<Device>('desktop')
  const [zoom, setZoom] = useState(85)
  const [showPreview, setShowPreview] = useState(false)
  const [published, setPublished] = useState(false)

  const deviceWidth = device === 'desktop' ? 920 : device === 'tablet' ? 720 : 390
  const compact = device === 'mobile'
  const insp = inspectorTitle(api.doc, api.selection)

  return (
    // data-lenis-prevent: this is a fixed full-screen app whose document never
    // scrolls; the global Lenis smooth-wheel handler would otherwise swallow
    // wheel/trackpad events and stop the inner panels from scrolling natively.
    <div
      data-lenis-prevent
      className="fixed inset-x-0 top-0 flex h-[100dvh] flex-col overflow-hidden bg-[#EDEAE3] text-[#1A1A1A] font-sans"
    >
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-black/8 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/websites" className="flex items-center gap-2">
            <span className="text-[22px] font-bold tracking-tight" style={{ fontFamily: FONT_STACKS['Playfair Display'] }}>
              OpusPass
            </span>
            <span className="rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ backgroundColor: '#F3EAFA', color: '#7A3FB8' }}>
              Editor
            </span>
          </Link>
          <span className="mx-1 hidden h-6 w-px bg-black/10 sm:block" />
          <div className="hidden items-center gap-1 sm:flex">
            <IconBtn label="Undo" onClick={api.undo} disabled={!api.canUndo}>
              <Undo2 size={17} />
            </IconBtn>
            <IconBtn label="Redo" onClick={api.redo} disabled={!api.canRedo}>
              <Redo2 size={17} />
            </IconBtn>
          </div>
          <span className="ml-1 hidden items-center gap-1.5 text-[13px] text-gray-500 sm:flex">
            {api.saveStatus === 'saving' ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Check size={14} className="text-[#3FA34D]" /> Changes saved
              </>
            )}
          </span>
        </div>

        {/* Device toggle */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full bg-[#F2F0EB] p-1 ring-1 ring-black/5 md:flex">
          {([
            { key: 'desktop', icon: Monitor },
            { key: 'tablet', icon: Tablet },
            { key: 'mobile', icon: Smartphone },
          ] as { key: Device; icon: LucideIcon }[]).map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setDevice(key)}
              aria-label={key}
              aria-pressed={device === key}
              className={cn(
                'flex h-8 w-11 items-center justify-center rounded-full transition-colors',
                device === key ? 'bg-white text-[#1A1A1A] shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-700',
              )}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="hidden items-center gap-1.5 text-[14px] font-medium text-gray-700 transition-colors hover:text-[#1A1A1A] sm:flex"
          >
            <Eye size={16} /> Preview
          </button>
          <button
            type="button"
            onClick={() => setPublished(true)}
            className="rounded-full bg-[#1A1A1A] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-black"
          >
            Publish Site
          </button>
          <span className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white" style={{ boxShadow: `0 0 0 2px ${ACCENT}` }}>
            <Image src="/assets/images/cutesy_couple.jpg" alt="Account" width={36} height={36} className="h-full w-full object-cover" />
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ── Left panel ─────────────────────────────────────────────── */}
        <aside className="hidden min-h-0 w-[272px] shrink-0 flex-col border-r border-black/8 bg-white md:flex">
          <div className="flex shrink-0 items-center gap-1.5 border-b border-black/8 px-4 py-3">
            {LEFT_TABS.map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setLeftTab(key)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition-colors',
                  leftTab === key ? 'bg-[#F3EAFA] text-[#7A3FB8]' : 'text-gray-500 hover:bg-black/5 hover:text-gray-700',
                )}
              >
                <Icon size={17} />
                {key}
              </button>
            ))}
          </div>
          <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <LeftPanel tab={leftTab} api={api} />
          </div>
        </aside>

        {/* ── Canvas ─────────────────────────────────────────────────── */}
        <main className="relative flex min-w-0 flex-1 flex-col overflow-auto">
          {/* Zoom toolbar */}
          <div className="pointer-events-none sticky top-0 z-20 flex w-full justify-center pt-5">
            <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-white px-2 py-1.5 shadow-md ring-1 ring-black/5">
              <ToolBtn label="Zoom out" onClick={() => setZoom((z) => Math.max(40, z - 5))}>
                <ZoomOut size={16} />
              </ToolBtn>
              <span className="w-11 text-center text-[13px] font-semibold tabular-nums">{zoom}%</span>
              <ToolBtn label="Zoom in" onClick={() => setZoom((z) => Math.min(150, z + 5))}>
                <ZoomIn size={16} />
              </ToolBtn>
              <span className="mx-1 h-5 w-px bg-black/10" />
              <ToolBtn label="Layers"><Layers size={16} /></ToolBtn>
              <ToolBtn label="Grid"><LayoutGrid size={16} /></ToolBtn>
            </div>
          </div>

          <div className="flex w-full flex-1 justify-center px-6 pb-16">
            <div className="origin-top transition-[width] duration-300" style={{ width: deviceWidth, transform: `scale(${zoom / 100})` }}>
              <div className="overflow-hidden rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
                <SiteRenderer
                  doc={api.doc}
                  editable
                  compact={compact}
                  selection={api.selection}
                  onSelectBlock={(sectionId, blockId) => api.select({ kind: 'block', sectionId, blockId })}
                  onSelectSection={(sectionId) => api.select({ kind: 'section', sectionId })}
                />
              </div>

              {/* Add-section button */}
              <div className="mt-4 flex justify-center pb-6">
                <AddSectionMenu onAdd={api.addSection} />
              </div>
            </div>
          </div>
        </main>

        {/* ── Right inspector ────────────────────────────────────────── */}
        <aside className="hidden min-h-0 w-[320px] shrink-0 flex-col border-l border-black/8 bg-white lg:flex">
          <div className="flex shrink-0 items-start justify-between border-b border-black/8 px-6 py-5">
            <div>
              <h2 className="text-[19px] font-semibold tracking-tight">{insp.title}</h2>
              <p className="mt-0.5 text-[12px] text-gray-500">{insp.sub}</p>
            </div>
            {api.selection && (
              <button
                type="button"
                onClick={() => api.select(null)}
                className="rounded-md p-1 text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-700"
                aria-label="Deselect"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <Inspector api={api} />
          </div>
          <div className="shrink-0 border-t border-black/8 p-4">
            <button
              type="button"
              onClick={() => api.select(null)}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[14px] font-semibold text-white shadow-sm transition-transform active:scale-[0.99]"
              style={{ backgroundImage: 'linear-gradient(120deg, #8350E8 0%, #C9A0DC 100%)' }}
            >
              <Wand2 size={16} /> Site Theme &amp; Settings
            </button>
          </div>
        </aside>
      </div>

      {showPreview && <PreviewOverlay api={api} onClose={() => setShowPreview(false)} />}
      {published && <PublishModal title={api.doc.title} onClose={() => setPublished(false)} />}
    </div>
  )
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  label: string
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-black/5 hover:text-[#1A1A1A] disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function ToolBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-black/5 hover:text-[#1A1A1A]"
    >
      {children}
    </button>
  )
}

const SECTION_MENU: { type: SectionType; label: string }[] = [
  { type: 'content', label: 'Our Story' },
  { type: 'details', label: 'Wedding Day' },
  { type: 'rsvp', label: 'RSVP' },
  { type: 'registry', label: 'Registry' },
  { type: 'gallery', label: 'Gallery' },
]

function AddSectionMenu({ onAdd }: { onAdd: (t: SectionType) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border-2 border-dashed border-[#C9A0DC] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#7A3FB8] transition-colors hover:bg-[#FBF7FE]"
      >
        <Plus size={16} strokeWidth={2.5} /> Add section
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-xl">
          {SECTION_MENU.map((s) => (
            <button
              key={s.type}
              type="button"
              onClick={() => {
                onAdd(s.type)
                setOpen(false)
              }}
              className="block w-full px-4 py-2 text-left text-[13.5px] hover:bg-[#F3EAFA]"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Preview overlay (clean, no editor chrome) ───────────────────────────────

function PreviewOverlay({ api, onClose }: { api: ReturnType<typeof useBuilder>; onClose: () => void }) {
  const [device, setDevice] = useState<Device>('desktop')
  const width = device === 'desktop' ? 1000 : device === 'tablet' ? 760 : 390
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1A1A1A]/90 backdrop-blur-sm">
      <div className="flex h-14 shrink-0 items-center justify-between px-5 text-white">
        <span className="text-[14px] font-semibold">Preview — {api.doc.title}</span>
        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
          {([
            { key: 'desktop', icon: Monitor },
            { key: 'tablet', icon: Tablet },
            { key: 'mobile', icon: Smartphone },
          ] as { key: Device; icon: LucideIcon }[]).map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setDevice(key)}
              aria-label={key}
              className={cn('flex h-8 w-10 items-center justify-center rounded-full', device === key ? 'bg-white text-[#1A1A1A]' : 'text-white/70')}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#1A1A1A]">
          <X size={15} /> Close
        </button>
      </div>
      <div className="flex flex-1 justify-center overflow-auto p-5">
        <div className="h-fit overflow-hidden rounded-2xl bg-white shadow-2xl" style={{ width }}>
          <SiteRenderer doc={api.doc} editable={false} compact={device === 'mobile'} />
        </div>
      </div>
    </div>
  )
}

// ── Publish modal ───────────────────────────────────────────────────────────

function PublishModal({ title, onClose }: { title: string; onClose: () => void }) {
  const slug = title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const url = `opuspass.opusfesta.com/i/${slug || 'our-wedding'}`
  const [copied, setCopied] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#9FE870]">
          <Check size={28} className="text-[#1A1A1A]" strokeWidth={2.5} />
        </span>
        <h3 className="text-[22px] font-bold tracking-tight">Your site is live!</h3>
        <p className="mt-2 text-[14px] text-gray-600">Share this link with your guests so they can RSVP and find every detail.</p>
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-black/10 bg-[#F7F6F2] px-3 py-2.5">
          <span className="flex-1 truncate text-left text-[13.5px] font-medium text-gray-800">{url}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(`https://${url}`).catch(() => {})
              setCopied(true)
            }}
            className="rounded-lg bg-[#1A1A1A] px-3 py-1.5 text-[12.5px] font-semibold text-white"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <button type="button" onClick={onClose} className="mt-5 text-[13.5px] font-semibold text-gray-500 hover:text-gray-800">
          Keep editing
        </button>
      </div>
    </div>
  )
}

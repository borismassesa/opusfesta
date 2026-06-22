'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  X,
  Palette,
  LayoutGrid,
  Files,
  Sparkles,
  Settings as SettingsIcon,
  Monitor,
  Smartphone,
  Mail,
  Eye,
  Check,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { composeDoc } from '@/lib/builder/presets'
import { useBuilder } from './useBuilder'
import { SiteRenderer } from './components/SiteRenderer'
import { DesignPanel, LayoutPanel, PagesPanel, AnimationPanel, SettingsPanel } from './components/Panels'

type Tab = 'Design' | 'Layout' | 'Pages' | 'Animation' | 'Settings'
type Device = 'desktop' | 'mobile' | 'invite'

const TABS: { key: Tab; icon: LucideIcon }[] = [
  { key: 'Design', icon: Palette },
  { key: 'Layout', icon: LayoutGrid },
  { key: 'Pages', icon: Files },
  { key: 'Animation', icon: Sparkles },
  { key: 'Settings', icon: SettingsIcon },
]

export default function WebsiteBuilderClient() {
  const api = useBuilder()
  const [tab, setTab] = useState<Tab>('Design')
  const [device, setDevice] = useState<Device>('desktop')
  const [showPreview, setShowPreview] = useState(false)

  const meta = api.doc.meta
  const rendered = useMemo(() => composeDoc(api.doc), [api.doc])

  // Re-key the preview so the CSS transition replays whenever a visual choice
  // changes. Animation only runs when the couple has picked a style.
  const animClass =
    meta.animationStyle === 'none' ? '' : `wb-anim-${meta.transition || 'rise'}`
  const animKey = `${meta.presetId}-${meta.layoutId}-${meta.animationStyle}-${meta.transition}`

  return (
    <div
      data-lenis-prevent
      className="fixed inset-x-0 top-0 flex h-[100dvh] flex-col overflow-hidden bg-[#EFEDE8] text-[#1A1A1A] font-sans"
    >
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-black/8 bg-white px-3 sm:px-5">
        <Link
          href="/websites"
          aria-label="Close editor"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-black/5 hover:text-[#1A1A1A]"
        >
          <X size={20} />
        </Link>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 md:flex">
          <span className="text-[14px] text-gray-700">
            opuspass.opusfesta.com/i/<span className="font-semibold text-[#1A1A1A]">{meta.slug || 'our-wedding'}</span>
          </span>
          <button
            type="button"
            onClick={() => setTab('Settings')}
            className="text-[14px] font-semibold text-[#7A3FB8] underline-offset-2 hover:underline"
          >
            Get a custom URL
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-[12.5px] text-gray-400 sm:flex">
            {api.saveStatus === 'saving' ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Check size={13} className="text-[#3FA34D]" /> Saved
              </>
            )}
          </span>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 rounded-full border border-black/15 px-4 py-1.5 text-[13.5px] font-semibold text-[#1A1A1A] transition-colors hover:bg-black/5"
          >
            <Eye size={15} /> Preview
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ── Left rail ──────────────────────────────────────────────── */}
        <nav className="flex w-[64px] shrink-0 flex-col gap-1 border-r border-black/8 bg-white py-3 sm:w-[124px] sm:px-2">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors sm:px-3',
                tab === key ? 'bg-[#F2F0EB] text-[#1A1A1A]' : 'text-gray-500 hover:bg-black/5 hover:text-gray-800',
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden sm:inline">{key}</span>
            </button>
          ))}
        </nav>

        {/* ── Middle panel ───────────────────────────────────────────── */}
        <section className="hide-scrollbar min-h-0 w-full max-w-[440px] shrink-0 overflow-y-auto border-r border-black/8 bg-white px-5 py-6 sm:px-7">
          {tab === 'Design' && <DesignPanel api={api} />}
          {tab === 'Layout' && <LayoutPanel api={api} />}
          {tab === 'Pages' && <PagesPanel api={api} />}
          {tab === 'Animation' && <AnimationPanel api={api} />}
          {tab === 'Settings' && <SettingsPanel api={api} />}
        </section>

        {/* ── Live preview ───────────────────────────────────────────── */}
        <main className="relative hidden min-w-0 flex-1 flex-col overflow-y-auto bg-[#EFEDE8] px-8 pb-24 pt-8 lg:flex">
          <ScaledPreview device={device} announcement={meta.announcement}>
            <div key={animKey} className={animClass}>
              <SiteRenderer doc={rendered} editable={false} compact={device !== 'desktop'} />
            </div>
          </ScaledPreview>

          {/* Device toggle */}
          <div className="fixed bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/10">
            {([
              { key: 'desktop', icon: Monitor, label: 'Desktop' },
              { key: 'mobile', icon: Smartphone, label: 'Mobile' },
              { key: 'invite', icon: Mail, label: 'Save the date' },
            ] as { key: Device; icon: LucideIcon; label: string }[]).map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                aria-label={label}
                aria-pressed={device === key}
                onClick={() => setDevice(key)}
                className={cn(
                  'flex h-9 w-11 items-center justify-center rounded-lg transition-colors',
                  device === key ? 'bg-[#F2F0EB] text-[#1A1A1A]' : 'text-gray-400 hover:text-gray-700',
                )}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </main>
      </div>

      {showPreview && (
        <PreviewOverlay onClose={() => setShowPreview(false)}>
          <SiteRenderer doc={rendered} editable={false} compact={false} />
        </PreviewOverlay>
      )}
    </div>
  )
}

// ── Scale-to-fit preview frame (browser chrome) ──────────────────────────────
//  Renders the site at a fixed device width, then scales it down to fit the
//  available column and centres it — so a full desktop layout is always visible
//  (never clipped) and mobile sits in a phone-width card, mirroring Zola.

const DEVICE_WIDTH: Record<Device, number> = { desktop: 1240, mobile: 412, invite: 460 }

function ScaledPreview({
  device,
  announcement,
  children,
}: {
  device: Device
  announcement: boolean
  children: React.ReactNode
}) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState<number | undefined>(undefined)
  const width = DEVICE_WIDTH[device]

  useEffect(() => {
    const compute = () => {
      const avail = outerRef.current?.clientWidth ?? width
      const s = Math.min(1, avail / width)
      setScale(s)
      const h = innerRef.current?.offsetHeight
      if (h) setHeight(h * s)
    }
    compute()
    const ro = new ResizeObserver(compute)
    if (outerRef.current) ro.observe(outerRef.current)
    if (innerRef.current) ro.observe(innerRef.current)
    return () => ro.disconnect()
  }, [width, children])

  return (
    <div ref={outerRef} className="flex w-full flex-1 justify-center">
      {/* Placeholder reserves the post-scale footprint so the column scrolls right. */}
      <div style={{ width: width * scale, height }}>
        <div
          ref={innerRef}
          className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_-24px_rgba(0,0,0,0.4)] ring-1 ring-black/5"
          style={{ width, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          {announcement && (
            <div className="bg-gradient-to-r from-[#3FA9C9] to-[#8350E8] px-5 py-3 text-center text-[14px] font-medium text-white">
              A note from the couple — see you there! 💌
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Full-screen preview overlay ──────────────────────────────────────────────

function PreviewOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const [device, setDevice] = useState<Device>('desktop')
  const width = device === 'mobile' ? 390 : 1040
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1A1A1A]/90 backdrop-blur-sm">
      <div className="flex h-14 shrink-0 items-center justify-between px-5 text-white">
        <span className="text-[14px] font-semibold">Preview</span>
        <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
          {([
            { key: 'desktop', icon: Monitor },
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
          {children}
        </div>
      </div>
    </div>
  )
}

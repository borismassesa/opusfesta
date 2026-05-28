'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Users, CalendarDays, Shirt, QrCode, Palette, Check, Sparkles, Plus, X,
  ZoomIn, ZoomOut, Lightbulb, HelpCircle, Pencil, Eye, EyeOff, LayoutGrid,
  MessageSquare, Upload, Type, Layers, Text, ChevronUp, ChevronDown, Ticket,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useCart } from '@/components/providers/CartProvider'
import { InvitationVisual } from '@/components/guests/InvitationVisual'
import type { FontStyle } from '@/components/guests/InvitationVisual'
import type { CatalogProduct } from '@/data/invitations-products'
import { OverlayEditor } from './OverlayEditor'
import type { OverlayItem } from './_overlay-types'
import { STICKERS } from './_overlay-types'

type Step = 'design' | 'review'
type Panel = 'event' | 'details' | 'dress' | 'rsvp' | 'message' | 'elements' | 'theme' | 'ticket'

const PANELS: { id: Panel; label: string; icon: React.ReactNode }[] = [
  { id: 'event',    label: 'Event',    icon: <Users size={16} /> },
  { id: 'details',  label: 'Details',  icon: <CalendarDays size={16} /> },
  { id: 'dress',    label: 'Dress',    icon: <Shirt size={16} /> },
  { id: 'rsvp',     label: 'RSVP',     icon: <QrCode size={16} /> },
  { id: 'message',  label: 'Message',  icon: <MessageSquare size={16} /> },
  { id: 'elements', label: 'Elements', icon: <Layers size={16} /> },
  { id: 'theme',    label: 'Theme',    icon: <Palette size={16} /> },
  { id: 'ticket',   label: 'Ticket',   icon: <Ticket size={16} /> },
]

const TICKET_ACCENT_COLORS = [
  { name: 'Gold',      value: '#8B7355' },
  { name: 'Champagne', value: '#C4A76B' },
  { name: 'Blush',     value: '#B07070' },
  { name: 'Navy',      value: '#2B3A5C' },
  { name: 'Sage',      value: '#5C6B4D' },
  { name: 'Charcoal',  value: '#3A3A3A' },
]

const FONT_STYLES: { id: FontStyle; label: string; fontFamily: string; fontStyle: string }[] = [
  { id: 'serif',      label: 'Classic Serif',    fontFamily: "Georgia, 'Times New Roman', serif",            fontStyle: 'normal' },
  { id: 'script',     label: 'Serif Italic',     fontFamily: "Georgia, 'Times New Roman', serif",            fontStyle: 'italic' },
  { id: 'playfair',   label: 'Playfair Display', fontFamily: "var(--font-playfair), Georgia, serif",         fontStyle: 'normal' },
  { id: 'cormorant',  label: 'Cormorant Garant', fontFamily: "var(--font-cormorant), Georgia, serif",        fontStyle: 'italic' },
  { id: 'dancing',    label: 'Dancing Script',   fontFamily: "var(--font-dancing), cursive",                 fontStyle: 'normal' },
  { id: 'garamond',   label: 'EB Garamond',      fontFamily: "var(--font-garamond), Georgia, serif",         fontStyle: 'normal' },
  { id: 'montserrat', label: 'Montserrat',       fontFamily: "var(--font-montserrat), system-ui, sans-serif", fontStyle: 'normal' },
  { id: 'modern',     label: 'System Modern',    fontFamily: 'system-ui, -apple-system, sans-serif',         fontStyle: 'normal' },
]

const MESSAGE_MAX = 120

export default function CustomiseClient({ product }: { product: CatalogProduct }) {
  const router = useRouter()
  const { addItem } = useCart()
  const [step, setStep] = useState<Step>('design')
  const [activePanel, setActivePanel] = useState<Panel>('event')
  const [zoom, setZoom] = useState(1)
  const [canvasVisible, setCanvasVisible] = useState(true)

  // Couple fields — names / date / venue map directly to InvitationVisual
  const [celebrant, setCelebrant] = useState('Amani & Neema')
  const [familyIntro, setFamilyIntro] = useState('')
  const [dateISO, setDateISO] = useState('2026-08-22')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('Bagamoyo, Tanzania')

  // Reception details (metadata — design team applies to card)
  const [receptionVenue, setReceptionVenue] = useState('')
  const [receptionTime, setReceptionTime] = useState('')

  // Dress code + palette swatches (display only — shown on sidebar review)
  const [dressCode, setDressCode] = useState('')
  const [palette, setPalette] = useState<string[]>([])

  // RSVP + QR — seed from the card's placeholder for save-the-date designs
  const defaultRsvp = (product.treatment === 'save-the-date' || product.treatment === 'save-the-date-photo')
    ? ['+255 795 682 205']
    : ['']
  const [rsvpContacts, setRsvpContacts] = useState<string[]>(defaultRsvp)
  const [qrLabel, setQrLabel] = useState<'SINGLE' | 'DOUBLE'>('SINGLE')

  // Message / quote
  const [message, setMessage] = useState('')
  const [messageAttr, setMessageAttr] = useState('')

  // Font style
  const [fontStyle, setFontStyle] = useState<FontStyle>('serif')

  // Photo upload + overlay opacity
  const [photoSrc, setPhotoSrc] = useState<string | undefined>()
  const [photoOpacity, setPhotoOpacity] = useState(0.85)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Overlay elements (text, stickers, images placed on card)
  const [overlayItems, setOverlayItems] = useState<OverlayItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const elemImageInputRef = useRef<HTMLInputElement>(null)

  // Wedding ticket customisation (boarding-pass-style door-scan ticket)
  const [ticketAccentColor, setTicketAccentColor] = useState('#8B7355')
  const [ticketAddress, setTicketAddress] = useState('')
  const [ticketStubLabel, setTicketStubLabel] = useState('BOARDING PASS TO OUR WEDDING')

  // Product palette selection — drives InvitationVisual colour theme
  const [paletteIndex, setPaletteIndex] = useState(0)

  // Sidebar overlay drawers
  const [drawer, setDrawer] = useState<'contact' | 'tips' | null>(null)

  // Change-design confirmation popover
  const [confirmLeave, setConfirmLeave] = useState(false)
  const confirmRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!confirmLeave) return
    const handler = (e: MouseEvent) => {
      if (confirmRef.current && !confirmRef.current.contains(e.target as Node)) {
        setConfirmLeave(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [confirmLeave])

  const selectedPalette = product.palettes[paletteIndex] ?? product.palettes[0]

  const couple = useMemo(
    () => ({
      names: celebrant.replace(/\s*&\s*/g, '  &  '),
      date: dateISO ? dateISO.split('-').reverse().join(' · ') : '',
      venue,
      time: time || undefined,
    }),
    [celebrant, dateISO, venue, time],
  )

  const handleSave = () =>
    toast.success('Draft saved', { description: 'Jump back to this design any time.' })

  const handleContinue = () => {
    const summaryParts = [
      celebrant && `${celebrant}`,
      dateISO && dateDisplay,
      venue,
    ].filter(Boolean)
    addItem({
      id: product.id,
      name: product.name,
      designer: product.designer,
      treatment: product.treatment,
      summary: summaryParts.join(' · '),
      total: product.digitalUnitPrice * 150,
    })
    toast.success('Added to cart', {
      description: `${product.name} — TZS ${(product.digitalUnitPrice * 150).toLocaleString('en-US')}`,
    })
    router.push('/invitations/cart')
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoSrc(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const setPaletteAt = (i: number, v: string) => setPalette((p) => p.map((c, idx) => (idx === i ? v : c)))
  const setContactAt = (i: number, v: string) => setRsvpContacts((c) => c.map((x, idx) => (idx === i ? v : x)))

  // Overlay element helpers
  const addTextItem = () => {
    setOverlayItems((prev) => [...prev, {
      id: crypto.randomUUID(), type: 'text', x: 40, y: 40,
      content: 'Your text', fontSize: 14, color: '#1A1A1A',
      rotation: 0, opacity: 1, zIndex: prev.length,
    }])
  }

  const addStickerItem = (char: string) => {
    setOverlayItems((prev) => [...prev, {
      id: crypto.randomUUID(), type: 'sticker', x: 45, y: 45,
      content: char, fontSize: 24, color: '#1A1A1A',
      rotation: 0, opacity: 1, zIndex: prev.length,
    }])
  }

  const addImageItem = (dataUrl: string) => {
    setOverlayItems((prev) => [...prev, {
      id: crypto.randomUUID(), type: 'image', x: 30, y: 30,
      content: dataUrl, fontSize: 14, color: '',
      rotation: 0, opacity: 1, zIndex: prev.length,
    }])
  }

  const updateOverlayItem = (id: string, patch: Partial<OverlayItem>) =>
    setOverlayItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))

  const deleteOverlayItem = (id: string) => {
    setOverlayItems((prev) => prev.filter((it) => it.id !== id))
    if (selectedItemId === id) setSelectedItemId(null)
  }

  const duplicateOverlayItem = (id: string) => {
    const item = overlayItems.find((it) => it.id === id)
    if (!item) return
    setOverlayItems((prev) => [...prev, {
      ...item,
      id: crypto.randomUUID(),
      x: Math.min(90, item.x + 5),
      y: Math.min(90, item.y + 5),
      zIndex: prev.length,
    }])
  }

  const handleElemImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => addImageItem(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const moveOverlayItem = (id: string, dir: 'up' | 'down') => {
    setOverlayItems((prev) => {
      const idx = prev.findIndex((it) => it.id === id)
      if (idx < 0) return prev
      const next = [...prev]
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= next.length) return prev
      ;[next[idx], next[swapIdx]] = [next[swapIdx]!, next[idx]!]
      return next
    })
  }

  const dateDisplay = couple.date ? couple.date.replace(/ · /g, ' / ') : '—'

  // Which panels have meaningful content filled in
  const panelDone: Record<Panel, boolean> = {
    event:    celebrant.trim().length > 0,
    details:  Boolean(dateISO) && venue.trim().length > 0,
    dress:    Boolean(dressCode.trim()) || palette.length > 0,
    rsvp:     rsvpContacts.filter(Boolean).length > 0,
    message:  message.trim().length > 0,
    elements: overlayItems.length > 0,
    theme:    true,
    ticket:   ticketAddress.trim().length > 0 || ticketAccentColor !== '#8B7355',
  }

  const goEdit = (panel: Panel) => {
    setStep('design')
    setActivePanel(panel)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8] text-[#1A1A1A]">
      {/* ─── Top toolbar ─── */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="relative flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Left — product name */}
          <div className="flex min-w-0 max-w-[40%] items-center sm:w-48">
            <p className="truncate text-[13px] font-bold text-gray-900">{product.name}</p>
          </div>

          {/* Center — step tabs */}
          <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-7" aria-label="Steps">
            {(['design', 'review'] as const).map((s) => {
              const active = step === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStep(s)}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'border-b-2 pb-1 text-[14px] font-medium capitalize transition',
                    active ? 'border-[#1A1A1A] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700',
                  )}
                >
                  {s}
                </button>
              )
            })}
          </nav>

          {/* Right — actions */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setCanvasVisible((v) => !v)}
              aria-label={canvasVisible ? 'Hide preview' : 'Show preview'}
              className="grid h-8 w-8 place-items-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
            >
              {canvasVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <div className="relative" ref={confirmRef}>
              <button
                type="button"
                onClick={() => setConfirmLeave((v) => !v)}
                aria-expanded={confirmLeave}
                aria-haspopup="dialog"
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold transition',
                  confirmLeave
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500 hover:text-gray-900',
                )}
              >
                <LayoutGrid size={13} />
                <span className="hidden sm:inline">Change design</span>
              </button>

              {confirmLeave && (
                <div
                  role="dialog"
                  aria-label="Leave customiser?"
                  className="absolute right-0 top-full z-30 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)]"
                >
                  <p className="text-[13px] font-semibold text-gray-900">Leave this design?</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-gray-500">
                    Your changes won&apos;t be saved. Browse the catalog to pick a different design.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href="/invitations/catalog"
                      className="flex-1 rounded-lg bg-[#1A1A1A] px-3 py-2 text-center text-[12px] font-bold text-white transition hover:bg-black"
                    >
                      Browse catalog
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirmLeave(false)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-[12px] font-bold text-gray-700 transition hover:bg-gray-50"
                    >
                      Stay here
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full border border-gray-300 px-4 py-1.5 text-[12px] font-bold text-gray-800 transition hover:bg-gray-50 sm:px-5"
            >
              Save
            </button>
            <button
              type="button"
              onClick={step === 'design' ? () => setStep('review') : handleContinue}
              className="rounded-full bg-[#1A1A1A] px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-black sm:px-5"
            >
              {step === 'design' ? 'Next' : 'Continue to send'}
            </button>
            <Link
              href={`/invitations/p/${product.id}`}
              aria-label="Close customiser"
              className="ml-0.5 grid h-8 w-8 place-items-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <X size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Editor body ─── */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[340px_1fr]">
        {/* ─── Left sidebar — controls / review ─── */}
        <aside className="order-2 flex flex-col border-t border-gray-200 bg-white lg:order-1 lg:border-r lg:border-t-0 lg:h-[calc(100vh-57px)]">
          <div className="border-b border-gray-200 px-5 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
              {step === 'design' ? 'Design' : 'Review'}
            </p>
            {step === 'design' && (
              <div className="mt-3 grid grid-cols-4 gap-1">
                {PANELS.map((p) => {
                  const active = activePanel === p.id
                  const done = panelDone[p.id]
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePanel(p.id)}
                      aria-pressed={active}
                      className={cn(
                        'relative flex flex-col items-center gap-1 rounded-md py-2 text-[10px] font-bold uppercase tracking-[0.08em] transition',
                        active ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
                      )}
                    >
                      {p.icon}
                      {p.label}
                      {done && !active && (
                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#5C6B4D]" aria-hidden="true" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            {step === 'review' ? (
              <>
                <ReviewRow label="Celebrant" value={celebrant} onEdit={() => goEdit('event')} />
                <ReviewRow label="Date & time" value={`${dateDisplay}${time ? ` · ${time}` : ''}`} onEdit={() => goEdit('details')} />
                <ReviewRow label="Venue" value={venue} onEdit={() => goEdit('details')} />
                {(receptionVenue || receptionTime) && (
                  <ReviewRow
                    label="Reception"
                    value={[receptionVenue, receptionTime].filter(Boolean).join(' · ') || '—'}
                    onEdit={() => goEdit('details')}
                  />
                )}
                <ReviewRow label="Dress code" value={dressCode || '—'} onEdit={() => goEdit('dress')}>
                  {palette.length > 0 && (
                    <span className="flex items-center gap-1">
                      {palette.map((c, i) => (
                        <span key={i} className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: c }} />
                      ))}
                    </span>
                  )}
                </ReviewRow>
                <ReviewRow label="RSVP" value={rsvpContacts.filter(Boolean).join(', ') || '—'} onEdit={() => goEdit('rsvp')} />
                <ReviewRow label="QR entry" value={qrLabel} onEdit={() => goEdit('rsvp')} />
                {message && (
                  <>
                    <ReviewRow label="Quote" value={message} onEdit={() => goEdit('message')} />
                    {messageAttr && <ReviewRow label="Attribution" value={messageAttr} onEdit={() => goEdit('message')} />}
                  </>
                )}
                {overlayItems.length > 0 && (
                  <ReviewRow
                    label="Elements"
                    value={`${overlayItems.length} overlay item${overlayItems.length > 1 ? 's' : ''}`}
                    onEdit={() => goEdit('elements')}
                  />
                )}
                <ReviewRow label="Font" value={FONT_STYLES.find((f) => f.id === fontStyle)?.label ?? fontStyle} onEdit={() => goEdit('theme')} />
                <ReviewRow label="Palette" value={selectedPalette.name ?? '—'} onEdit={() => goEdit('theme')} />
                <ReviewRow
                  label="Ticket colour"
                  value={TICKET_ACCENT_COLORS.find((c) => c.value === ticketAccentColor)?.name ?? 'Custom'}
                  onEdit={() => goEdit('ticket')}
                >
                  <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: ticketAccentColor }} />
                </ReviewRow>
                {ticketAddress && (
                  <ReviewRow label="Ticket address" value={ticketAddress} onEdit={() => goEdit('ticket')} />
                )}
                {photoSrc && (
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-500">Photo</span>
                    <div className="flex items-center gap-2">
                      <img src={photoSrc} alt="Uploaded photo" className="h-8 w-8 rounded object-cover ring-1 ring-black/10" />
                      <button type="button" onClick={() => goEdit('theme')} aria-label="Edit photo" className="text-gray-400 hover:text-gray-900">
                        <Pencil size={12} />
                      </button>
                    </div>
                  </div>
                )}
                <p className="rounded-md border border-[#E8D9A7]/60 bg-[#F5EFE3]/60 px-3.5 py-3 text-[12px] leading-snug text-gray-700">
                  Looks good? Continue to send your invite by WhatsApp or SMS, with a live RSVP page for every guest.
                </p>
              </>
            ) : (
              <>
                {activePanel === 'event' && (
                  <>
                    <Field label="Celebrant names" hint="The large script line on the card">
                      <Input value={celebrant} onChange={setCelebrant} placeholder="e.g. Amani & Neema" />
                    </Field>
                    <Field label="Family introduction" hint={'Swahili lead — “Familia ya …”'}>
                      <textarea
                        value={familyIntro}
                        onChange={(e) => setFamilyIntro(e.target.value)}
                        rows={3}
                        placeholder="Familia ya … pamoja na Familia ya …"
                        className="w-full resize-none rounded-md border border-gray-300 px-3.5 py-2.5 text-[14px] leading-relaxed focus:border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                      />
                    </Field>
                  </>
                )}

                {activePanel === 'details' && (
                  <>
                    <Field label="Wedding date">
                      <input
                        type="date"
                        value={dateISO}
                        onChange={(e) => setDateISO(e.target.value)}
                        className="h-11 w-full rounded-md border border-gray-300 px-3.5 text-[14px] focus:border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                      />
                    </Field>
                    <Field label="Ceremony time">
                      <Input value={time} onChange={setTime} placeholder="e.g. 4:00 PM" />
                    </Field>
                    <Field label="Ceremony venue">
                      <Input value={venue} onChange={setVenue} placeholder="e.g. Bagamoyo, Tanzania" />
                    </Field>
                    <div className="border-t border-gray-100 pt-4">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">Reception (optional)</p>
                      <div className="space-y-4">
                        <Field label="Reception venue" hint="If different from ceremony">
                          <Input value={receptionVenue} onChange={setReceptionVenue} placeholder="e.g. Grand Ballroom, Dar es Salaam" />
                        </Field>
                        <Field label="Reception time">
                          <Input value={receptionTime} onChange={setReceptionTime} placeholder="e.g. 7:00 PM" />
                        </Field>
                      </div>
                    </div>
                  </>
                )}

                {activePanel === 'dress' && (
                  <>
                    <Field label="Dress code" hint={'Shown as "Mavazi · …"'}>
                      <Input value={dressCode} onChange={setDressCode} placeholder="e.g. Cocktail" />
                    </Field>
                    <Field label="Colour palette" hint="The dress-code colours shown as dots">
                      <div className="flex items-center gap-3">
                        {palette.map((c, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <input
                              type="color"
                              value={c}
                              onChange={(e) => setPaletteAt(i, e.target.value)}
                              aria-label={`Palette colour ${i + 1}`}
                              className="h-10 w-12 cursor-pointer rounded-md border border-gray-300 bg-white p-1"
                            />
                            {palette.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setPalette((p) => p.filter((_, idx) => idx !== i))}
                                className="text-gray-500 hover:text-gray-900"
                                aria-label={`Remove colour ${i + 1}`}
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                        {palette.length < 4 && (
                          <button
                            type="button"
                            onClick={() => setPalette((p) => [...p, '#C8A35C'])}
                            className="grid h-10 w-10 place-items-center rounded-md border border-dashed border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-900"
                            aria-label="Add palette colour"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </div>
                    </Field>
                  </>
                )}

                {activePanel === 'rsvp' && (
                  <>
                    <Field label="RSVP contacts" hint="Phone numbers guests can reach">
                      <div className="space-y-2">
                        {rsvpContacts.map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="tel"
                              value={c}
                              onChange={(e) => setContactAt(i, e.target.value)}
                              placeholder="+255 7XX XXX XXX"
                              className="h-11 w-full rounded-md border border-gray-300 px-3.5 text-[14px] tabular-nums focus:border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                            />
                            <button
                              type="button"
                              onClick={() => setRsvpContacts((list) => list.filter((_, idx) => idx !== i))}
                              className="shrink-0 text-gray-400 hover:text-gray-900"
                              aria-label={`Remove contact ${i + 1}`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        {rsvpContacts.length < 3 && (
                          <button
                            type="button"
                            onClick={() => setRsvpContacts((list) => [...list, ''])}
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-700 hover:text-gray-900"
                          >
                            <Plus size={14} /> Add contact
                          </button>
                        )}
                      </div>
                    </Field>
                    <Field label="QR entry label" hint="Tagged on the QR code at the door">
                      <div className="flex gap-2">
                        {(['SINGLE', 'DOUBLE'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setQrLabel(opt)}
                            aria-pressed={qrLabel === opt}
                            className={cn(
                              'flex-1 rounded-md border px-3 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition',
                              qrLabel === opt
                                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500',
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </>
                )}

                {activePanel === 'message' && (
                  <>
                    <Field label="Quote or verse" hint="Appears on the card — keep it short">
                      <div className="relative">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                          rows={4}
                          placeholder="e.g. Love is patient, love is kind…"
                          className="w-full resize-none rounded-md border border-gray-300 px-3.5 py-2.5 text-[14px] leading-relaxed focus:border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                        />
                        <span className={cn(
                          'absolute bottom-2.5 right-3 text-[11px] tabular-nums',
                          message.length >= MESSAGE_MAX ? 'text-red-500' : 'text-gray-400',
                        )}>
                          {message.length}/{MESSAGE_MAX}
                        </span>
                      </div>
                    </Field>
                    <Field label="Attribution" hint="e.g. — 1 Corinthians 13:4">
                      <Input value={messageAttr} onChange={setMessageAttr} placeholder="— Source or author" />
                    </Field>
                  </>
                )}

                {activePanel === 'elements' && (
                  <>
                    {/* Add buttons */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={addTextItem}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-2.5 text-[12px] font-semibold text-gray-700 transition hover:border-gray-500 hover:text-gray-900"
                      >
                        <Text size={14} /> Add text
                      </button>
                      <button
                        type="button"
                        onClick={() => elemImageInputRef.current?.click()}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-2.5 text-[12px] font-semibold text-gray-700 transition hover:border-gray-500 hover:text-gray-900"
                      >
                        <Upload size={14} /> Add image
                      </button>
                      <input
                        ref={elemImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleElemImageChange}
                        className="hidden"
                        aria-label="Upload overlay image"
                      />
                    </div>

                    {/* Sticker grid */}
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Stickers</p>
                      {STICKERS.map((group) => (
                        <div key={group.group} className="mb-3">
                          <p className="mb-1.5 text-[11px] font-semibold text-gray-500">{group.group}</p>
                          <div className="flex flex-wrap gap-1">
                            {group.items.map((char) => (
                              <button
                                key={char}
                                type="button"
                                onClick={() => addStickerItem(char)}
                                aria-label={`Add ${char} sticker`}
                                className="grid h-9 w-9 place-items-center rounded-md border border-gray-200 text-[18px] transition hover:border-gray-400 hover:bg-gray-50"
                              >
                                {char}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Items list */}
                    {overlayItems.length > 0 && (
                      <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                          On card ({overlayItems.length})
                        </p>
                        <div className="space-y-1">
                          {overlayItems.map((item, i) => (
                            <div
                              key={item.id}
                              className={cn(
                                'flex items-center gap-2 rounded-md border px-2.5 py-2 text-[12px] transition cursor-pointer',
                                selectedItemId === item.id
                                  ? 'border-[#1A1A1A] bg-gray-50'
                                  : 'border-gray-200 hover:border-gray-400',
                              )}
                              onClick={() => { setSelectedItemId(item.id); setActivePanel('elements') }}
                            >
                              <span className="shrink-0 text-[16px]">
                                {item.type === 'text' ? 'T' : item.type === 'image' ? '🖼' : item.content}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-gray-700">
                                {item.type === 'image' ? 'Image' : item.content}
                              </span>
                              <div className="flex shrink-0 items-center gap-0.5">
                                <button
                                  type="button"
                                  aria-label="Move up"
                                  onClick={(e) => { e.stopPropagation(); moveOverlayItem(item.id, 'up') }}
                                  disabled={i === 0}
                                  className="grid h-6 w-6 place-items-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30"
                                >
                                  <ChevronUp size={12} />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Move down"
                                  onClick={(e) => { e.stopPropagation(); moveOverlayItem(item.id, 'down') }}
                                  disabled={i === overlayItems.length - 1}
                                  className="grid h-6 w-6 place-items-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30"
                                >
                                  <ChevronDown size={12} />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Delete element"
                                  onClick={(e) => { e.stopPropagation(); deleteOverlayItem(item.id) }}
                                  className="grid h-6 w-6 place-items-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activePanel === 'theme' && (
                  <>
                    {product.treatment === 'save-the-date-photo' && !photoSrc && (
                      <div className="rounded-md border-2 border-dashed border-[#00a79d]/40 bg-[#00a79d]/5 p-4">
                        <p className="mb-2 text-[12px] font-bold text-gray-900">Upload your couple photo</p>
                        <p className="mb-3 text-[11px] leading-relaxed text-gray-500">
                          This design uses your photo as a background with a teal colour overlay — upload to see the full effect.
                        </p>
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1A1A1A] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-black"
                        >
                          <Upload size={14} /> Upload photo
                        </button>
                      </div>
                    )}

                    <Field label="Colour palette" hint="Pick the palette for this design">
                      <div className="flex flex-wrap gap-3">
                        {product.palettes.map((p, i) => {
                          const active = paletteIndex === i
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setPaletteIndex(i)}
                              aria-pressed={active}
                              title={p.name}
                              className={cn(
                                'flex flex-col items-center gap-1.5 rounded-md border p-2 text-left transition',
                                active ? 'border-[#1A1A1A] ring-1 ring-[#1A1A1A]' : 'border-gray-300 hover:border-gray-500',
                              )}
                            >
                              <span
                                className="h-10 w-10 rounded-full ring-1 ring-black/10"
                                style={{ backgroundColor: p.accent, border: `3px solid ${p.background}`, outline: `1px solid ${p.textSecondary}` }}
                                aria-hidden="true"
                              />
                              <span className="text-[10px] font-bold text-gray-700">{p.name}</span>
                              {active && <Check size={11} className="text-[#1A1A1A]" aria-hidden="true" />}
                            </button>
                          )
                        })}
                      </div>
                    </Field>

                    <Field label="Font style" hint="Changes the name typography on the card">
                      {(() => {
                        const active = FONT_STYLES.find((f) => f.id === fontStyle) ?? FONT_STYLES[0]!
                        return (
                          <div className="space-y-2">
                            <select
                              value={fontStyle}
                              onChange={(e) => setFontStyle(e.target.value as FontStyle)}
                              className="h-11 w-full rounded-md border border-gray-300 px-3 text-[14px] focus:border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                            >
                              {FONT_STYLES.map((f) => (
                                <option key={f.id} value={f.id}>{f.label}</option>
                              ))}
                            </select>
                            <p
                              className="rounded-md border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-[20px] text-gray-800"
                              style={{ fontFamily: active.fontFamily, fontStyle: active.fontStyle }}
                            >
                              {celebrant || 'Amani & Neema'}
                            </p>
                          </div>
                        )
                      })()}
                    </Field>

                    <Field label="Couple photo" hint={product.treatment === 'save-the-date-photo' ? 'Shown behind the teal overlay on this design — upload to see the effect' : 'Used as background on photo designs; our team places it on others'}>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        aria-label="Upload couple photo"
                      />
                      {photoSrc ? (
                        <div className="flex items-center gap-3">
                          <img src={photoSrc} alt="Uploaded couple photo" className="h-16 w-16 rounded-md object-cover ring-1 ring-black/10" />
                          <div className="flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={() => photoInputRef.current?.click()}
                              className="text-[12px] font-semibold text-gray-700 underline-offset-2 hover:underline"
                            >
                              Change photo
                            </button>
                            <button
                              type="button"
                              onClick={() => setPhotoSrc(undefined)}
                              className="text-left text-[12px] text-gray-400 hover:text-gray-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-5 text-[13px] font-semibold text-gray-600 transition hover:border-gray-500 hover:text-gray-900"
                        >
                          <Upload size={15} />
                          Upload photo
                        </button>
                      )}
                    </Field>

                    {photoSrc && (
                      <Field label="Photo opacity" hint="How much the colour overlay covers the photo">
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={photoOpacity}
                            onChange={(e) => setPhotoOpacity(Number(e.target.value))}
                            aria-label="Photo opacity"
                            className="flex-1 accent-[#1A1A1A]"
                          />
                          <span className="w-9 text-right text-[12px] tabular-nums text-gray-500">
                            {Math.round(photoOpacity * 100)}%
                          </span>
                        </div>
                      </Field>
                    )}
                  </>
                )}

                {activePanel === 'ticket' && (
                  <>
                    <p className="text-[12px] leading-relaxed text-gray-600">
                      Customise the boarding-pass-style wedding ticket your guests receive for door scanning.
                    </p>

                    <Field label="Stub accent colour" hint="The coloured left-hand stub of the ticket">
                      <div className="flex flex-wrap gap-2">
                        {TICKET_ACCENT_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setTicketAccentColor(c.value)}
                            aria-pressed={ticketAccentColor === c.value}
                            title={c.name}
                            className={cn(
                              'flex flex-col items-center gap-1 rounded-md border p-2 transition',
                              ticketAccentColor === c.value
                                ? 'border-[#1A1A1A] ring-1 ring-[#1A1A1A]'
                                : 'border-gray-300 hover:border-gray-500',
                            )}
                          >
                            <span
                              className="h-8 w-8 rounded-full ring-1 ring-black/10"
                              style={{ backgroundColor: c.value }}
                              aria-hidden="true"
                            />
                            <span className="text-[10px] font-bold text-gray-700">{c.name}</span>
                            {ticketAccentColor === c.value && <Check size={11} className="text-[#1A1A1A]" aria-hidden="true" />}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Venue address" hint="Full address printed on the ticket (e.g. 123 Anywhere St., Dar es Salaam)">
                      <Input value={ticketAddress} onChange={setTicketAddress} placeholder="e.g. 45 Ocean Rd, Dar es Salaam" />
                    </Field>

                    <Field label="Stub label" hint="Vertical text on the left stub">
                      <Input value={ticketStubLabel} onChange={setTicketStubLabel} placeholder="BOARDING PASS TO OUR WEDDING" />
                    </Field>
                  </>
                )}

                <div className="flex items-start gap-2.5 rounded-md border border-[#E8D9A7]/60 bg-[#F5EFE3]/60 px-3.5 py-3">
                  <Sparkles size={16} className="mt-0.5 shrink-0 text-[#7A1F2B]" aria-hidden="true" />
                  <p className="text-[12px] leading-snug text-gray-700">
                    Free design assistance and one round of revisions are included — our team polishes your
                    card before it goes out.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Sidebar footer — helper links */}
          <div className="relative">
            {/* Contact drawer */}
            {drawer === 'contact' && (
              <div className="absolute bottom-full left-0 right-0 z-10 border-t border-gray-200 bg-white shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.12)]">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                  <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-gray-900">Contact us</p>
                  <button type="button" onClick={() => setDrawer(null)} aria-label="Close" className="text-gray-400 hover:text-gray-900">
                    <X size={15} />
                  </button>
                </div>
                <div className="space-y-3 px-5 py-4">
                  <p className="text-[12px] leading-relaxed text-gray-600">
                    Our design team is here to help — free assistance and one round of revisions are included with every order.
                  </p>
                  <a
                    href="https://wa.me/255700000000?text=Hi%2C%20I%20need%20help%20with%20my%20invitation%20design"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-md border border-[#25D366]/40 bg-[#F0FBF3] px-3.5 py-2.5 text-[13px] font-semibold text-[#1A7A3C] transition hover:bg-[#E3F7E9]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-[#25D366]" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    WhatsApp our team
                  </a>
                  <a
                    href="mailto:design@opusfesta.com"
                    className="flex items-center gap-2.5 rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[13px] font-semibold text-gray-700 transition hover:bg-gray-100"
                  >
                    <HelpCircle size={15} className="shrink-0 text-gray-500" aria-hidden="true" />
                    Email design@opusfesta.com
                  </a>
                </div>
              </div>
            )}

            {/* Tips drawer */}
            {drawer === 'tips' && (
              <div className="absolute bottom-full left-0 right-0 z-10 border-t border-gray-200 bg-white shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.12)]">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                  <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-gray-900">Design tips</p>
                  <button type="button" onClick={() => setDrawer(null)} aria-label="Close" className="text-gray-400 hover:text-gray-900">
                    <X size={15} />
                  </button>
                </div>
                <ul className="divide-y divide-gray-100 px-5 py-2">
                  {[
                    { heading: 'Names first', body: 'Lead with the celebrant names — guests scan the card top to bottom.' },
                    { heading: 'Short venue', body: 'Keep venue to a city or landmark. Full addresses go on the details card.' },
                    { heading: 'Dress code matters', body: 'A specific code (Cocktail, Black Tie) saves guests guesswork and photographs better.' },
                    { heading: 'Two RSVP contacts', body: 'Add a backup number — one contact is often unavailable during wedding prep.' },
                    { heading: 'QR label', body: 'Use DOUBLE for couples or families sharing one invitation, SINGLE for individual guests.' },
                    { heading: 'Keep quotes brief', body: 'One line reads well on a card. Long quotes shrink to fit and lose impact.' },
                  ].map((tip) => (
                    <li key={tip.heading} className="py-3">
                      <p className="text-[12px] font-bold text-gray-900">{tip.heading}</p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-gray-500">{tip.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-5 border-t border-gray-200 px-5 py-3 text-[12px] font-semibold text-gray-600">
              <button
                type="button"
                onClick={() => setDrawer((d) => (d === 'contact' ? null : 'contact'))}
                className={cn('inline-flex items-center gap-1.5 transition hover:text-gray-900', drawer === 'contact' && 'text-gray-900')}
              >
                <HelpCircle size={15} /> Contact us
              </button>
              <button
                type="button"
                onClick={() => setDrawer((d) => (d === 'tips' ? null : 'tips'))}
                className={cn('inline-flex items-center gap-1.5 transition hover:text-gray-900', drawer === 'tips' && 'text-gray-900')}
              >
                <Lightbulb size={15} /> Tips
              </button>
            </div>
          </div>
        </aside>

        {/* ─── Canvas — live preview ─── */}
        <div className={cn(
          'order-1 flex flex-col bg-[#E9E7E3] lg:order-2 lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)]',
          !canvasVisible && 'hidden lg:flex',
        )}>
          <div className="flex flex-1 items-center justify-center overflow-auto p-6 sm:p-10">
            {activePanel === 'ticket' ? (
              <div className="w-full max-w-xl origin-center transition-transform" style={{ transform: `scale(${zoom})` }}>
                <TicketPreview
                  coupleNames={celebrant || 'Amani & Neema'}
                  dateISO={dateISO}
                  time={time}
                  venue={venue}
                  address={ticketAddress}
                  rsvpContact={rsvpContacts.filter(Boolean)[0] ?? ''}
                  accentColor={ticketAccentColor}
                  stubLabel={ticketStubLabel || 'BOARDING PASS TO OUR WEDDING'}
                />
              </div>
            ) : (
              <div className="w-full max-w-sm origin-center transition-transform" style={{ transform: `scale(${zoom})` }}>
                <div ref={cardRef} className="relative aspect-[5/7] overflow-hidden rounded-[4px] bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/5">
                  <InvitationVisual
                    treatment={product.treatment}
                    couple={couple}
                    palette={selectedPalette}
                    message={message || undefined}
                    messageAttr={messageAttr || undefined}
                    fontStyle={fontStyle}
                    photoSrc={photoSrc}
                    photoOpacity={photoOpacity}
                    dressCode={dressCode || undefined}
                    rsvpContact={rsvpContacts.filter(Boolean).join('  ·  ') || undefined}
                    receptionVenue={receptionVenue || undefined}
                    receptionTime={receptionTime || undefined}
                  />
                  <OverlayEditor
                    containerRef={cardRef}
                    items={overlayItems}
                    selectedId={selectedItemId}
                    onSelect={setSelectedItemId}
                    onMove={(id, x, y) => updateOverlayItem(id, { x, y })}
                    onUpdate={updateOverlayItem}
                    onDelete={deleteOverlayItem}
                    onDuplicate={duplicateOverlayItem}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Zoom control */}
          <div className="flex items-center justify-center gap-3 border-t border-black/5 px-6 py-3">
            <ZoomOut size={16} className="text-gray-500" aria-hidden="true" />
            <input
              type="range"
              min={0.6}
              max={1.4}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom preview"
              className="w-44 accent-[#1A1A1A] sm:w-56"
            />
            <ZoomIn size={16} className="text-gray-500" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}

function TicketPreview({
  coupleNames, dateISO, time, venue, address, rsvpContact, accentColor, stubLabel,
}: {
  coupleNames: string; dateISO: string; time: string; venue: string; address: string
  rsvpContact: string; accentColor: string; stubLabel: string
}) {
  const [first, second] = coupleNames.split(/\s*&\s*/)
  const dateDisplay = dateISO
    ? new Date(dateISO + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
    : 'TBD'
  const dateShort = dateISO
    ? new Date(dateISO + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/')
    : '—'

  return (
    <div className="relative flex w-full overflow-hidden rounded-lg bg-[#FDFCF8] shadow-[0_24px_60px_-16px_rgba(0,0,0,0.35)] ring-1 ring-black/10" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* Left stub */}
      <div className="relative flex w-[13%] shrink-0 flex-col items-center justify-center py-5" style={{ backgroundColor: accentColor }}>
        <p
          className="select-none text-[9px] font-bold tracking-[0.22em] text-white"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', overflow: 'hidden', maxHeight: '90%' }}
        >
          {stubLabel}
        </p>
        {/* Notch cutouts */}
        <span className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#E9E7E3]" aria-hidden="true" />
      </div>

      {/* Perforated edge */}
      <div className="flex w-[3px] shrink-0 flex-col items-center justify-around py-2" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="h-1 w-0.5 rounded-full bg-gray-300" />
        ))}
      </div>

      {/* Main body */}
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-4 py-4">
        <p className="text-[8px] font-bold tracking-[0.28em] text-gray-500 uppercase">You are invited to the wedding of</p>

        {/* Names */}
        <div className="flex items-center gap-2 border-y border-gray-200 py-2">
          <span className="flex-1 text-center text-[22px] font-bold uppercase tracking-widest text-gray-900 leading-none">
            {first?.trim() || 'BRIDE'}
          </span>
          <span className="shrink-0 text-[11px] italic text-gray-500" style={{ fontFamily: "Georgia, serif", fontStyle: 'italic' }}>and</span>
          <span className="flex-1 text-center text-[22px] font-bold uppercase tracking-widest text-gray-900 leading-none">
            {second?.trim() || 'GROOM'}
          </span>
        </div>

        {/* Details row */}
        <div className="grid grid-cols-2 gap-x-4 text-[9px] text-gray-700 uppercase tracking-[0.14em]">
          <p><span className="font-bold">Date:</span> {dateDisplay}</p>
          <p><span className="font-bold">Address:</span> {address || venue || '—'}</p>
          {time && <p><span className="font-bold">Time:</span> {time}</p>}
        </div>

        {/* Barcode */}
        <div className="flex items-end gap-3 pt-1">
          <div className="flex h-7 items-end gap-px">
            {[3,1,2,1,3,2,1,3,1,2,3,1,2,1,3,2,1,2,3,1,2,3,1,2,1,3,2,1,3,1,2,3,1,2,3,1].map((w, i) => (
              <span key={i} className="rounded-[1px] bg-gray-800" style={{ width: w, height: `${55 + (i % 4) * 10}%` }} />
            ))}
          </div>
          <p
            className="pb-0.5 text-[18px] leading-none text-gray-400"
            style={{ fontFamily: "Georgia, serif", fontStyle: 'italic' }}
          >
            Save the Date
          </p>
        </div>
      </div>

      {/* Perforated edge */}
      <div className="flex w-[3px] shrink-0 flex-col items-center justify-around py-2" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="h-1 w-0.5 rounded-full bg-gray-300" />
        ))}
      </div>

      {/* Right mini-stub */}
      <div className="relative flex w-[18%] shrink-0 flex-col items-center justify-center gap-3 px-2 py-4 text-center">
        <span className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#E9E7E3]" aria-hidden="true" />
        <div>
          <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-gray-500">Save the Date</p>
          <p className="mt-0.5 text-[11px] font-bold tabular-nums text-gray-900">{dateShort}</p>
        </div>
        <div>
          <p className="text-[13px]" aria-hidden="true">🤍</p>
          <p className="text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: accentColor }}>RSVP</p>
          <p className="mt-0.5 text-[8px] tabular-nums text-gray-700">{rsvpContact || '+255 7XX XXX XXX'}</p>
        </div>
      </div>
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-md border border-gray-300 px-3.5 text-[14px] focus:border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
    />
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-bold text-gray-900">{label}</label>
      {hint && <p className="mb-1.5 mt-0.5 text-[11px] text-gray-500">{hint}</p>}
      <div className={hint ? '' : 'mt-1.5'}>{children}</div>
    </div>
  )
}

function ReviewRow({
  label,
  value,
  onEdit,
  children,
}: {
  label: string
  value: string
  onEdit?: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="group flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span>
      <span className="flex items-center gap-2 text-right text-[13px] font-medium text-gray-900">
        {children}
        {value}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${label}`}
            className="ml-0.5 shrink-0 text-gray-400 opacity-0 transition hover:text-gray-900 group-hover:opacity-100"
          >
            <Pencil size={12} />
          </button>
        )}
      </span>
    </div>
  )
}

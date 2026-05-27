'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, ChevronRight, MessageCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InvitationVisual, COUPLE_DEFAULT } from '@/components/guests/InvitationVisual'
import { MockupCarousel } from '@/components/guests/MockupCarousel'
import { PACK_QTY, PROMO_CODE } from '@/components/guests/productInfo'
import { PRODUCTS, type CatalogProduct } from '@/data/invitations-products'

// Pricing model:
//   • Digital cards — `product.digitalUnitPrice × digitalQty` (priced per-card, scales with guest count)
//   • Paper prints  — `paperUnitPrice × paperQty` (priced per-card)
//   • Door-scan     — flat base fee per event
//   • Foil add-on   — flat base fee
const DOOR_SCAN_SERVICE_PRICE = 150000 // TZS — flat per event (host with scanner at venue entrance)
const FOIL_ADDON_PRICE = 35000 // TZS — flat for foil + letterpress accents on paper prints

const FORMAT_OPTIONS = ['Standard', 'All-in-One'] as const
const PAPER_TYPES = ['Signature', 'Signature smooth', 'Pearlescent', 'Recycled', 'Double thick', 'Triple thick']
const TRIM_SHAPES = [
  { id: 'standard', label: 'Standard', d: 'M2 2h12v16H2z' },
  { id: 'rounded',  label: 'Rounded',  d: 'M4 2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z' },
  { id: 'arch',     label: 'Arch',     d: 'M2 8a6 6 0 0 1 12 0v10H2z' },
  { id: 'tag',      label: 'Tag',      d: 'M2 2h12v14l-6 2-6-2z' },
  { id: 'scallop',  label: 'Scallop',  d: 'M2 4q2-2 4 0 q2-2 4 0 q2-2 4 0 v12 q-2 2-4 0 q-2 2-4 0 q-2 2-4 0z' },
] as const

const DIGITAL_QTY_OPTIONS = [50, 100, 150, 200, 300, 500]
const PAPER_QTY_OPTIONS = [10, 25, 50, 100, 150, 200, 300, 500]

export default function ProductDetailClient({ product }: { product: CatalogProduct }) {
  // Core selections
  const [selectedColor, setSelectedColor] = useState(0)
  const [digitalQty, setDigitalQty] = useState<number>(150) // default to 150 guests — typical mid-sized Tanzanian wedding count

  // Paper add-on selections
  const [paperPrints, setPaperPrints] = useState(false)
  const [paperQty, setPaperQty] = useState<number>(50)
  const [format, setFormat] = useState<typeof FORMAT_OPTIONS[number]>('Standard')
  const [trimShape, setTrimShape] = useState<string>('standard')
  const [paperType, setPaperType] = useState('Signature')
  const [foilAddon, setFoilAddon] = useState(false)

  // Service add-on
  const [doorScan, setDoorScan] = useState(false)

  const [favourited, setFavourited] = useState(false)

  // Modal state for the two CTAs
  const [showPreview, setShowPreview] = useState(false)
  const [showCustomise, setShowCustomise] = useState(false)

  const digitalSubtotal = product.digitalUnitPrice * digitalQty
  const paperUnitPrice = Math.round(product.priceNow / PACK_QTY / 10) * 10 // TZS per piece
  const paperSubtotal = paperPrints ? paperUnitPrice * paperQty : 0
  const foilSubtotal = paperPrints && foilAddon ? FOIL_ADDON_PRICE : 0
  const doorScanSubtotal = doorScan ? DOOR_SCAN_SERVICE_PRICE : 0
  const total = digitalSubtotal + paperSubtotal + foilSubtotal + doorScanSubtotal

  const sameCategory = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category)
  const others = PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category)
  const recommendations = [...sameCategory, ...others].slice(0, 4)

  return (
    <div className="bg-[#FAFAF8] text-[#1A1A1A]">
      {/* Breadcrumb */}
      <nav className="px-4 sm:px-6 pt-6 sm:pt-8" aria-label="Breadcrumb">
        <div className="mx-auto max-w-7xl flex items-center gap-1.5 text-xs text-gray-600 flex-wrap">
          <Link href="/invitations" className="hover:text-gray-900 hover:underline">Invitations</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <Link href="/invitations/catalog" className="hover:text-gray-900 hover:underline">{product.category}</Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-900">{product.name}</span>
        </div>
      </nav>

      {/* Main 2-column layout */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 pb-12 sm:pb-16">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* ─── LEFT: sticky mockup carousel ─── */}
          <div className="lg:sticky lg:top-6">
            <MockupCarousel
              treatment={product.treatment}
              couple={COUPLE_DEFAULT}
              designImage={product.designImage}
              palette={product.palettes?.[selectedColor]}
              favourited={favourited}
              onFavourite={() => setFavourited((v) => !v)}
            />
          </div>

          {/* ─── RIGHT: scrollable configurator ─── */}
          <div className="space-y-7">
            {/* Title block */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500 mb-2">{product.designer}</p>
              <h1 className="text-2xl md:text-3xl lg:text-[34px] font-serif font-medium text-gray-900 leading-tight">
                {product.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-sm bg-[#1A1A1A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Digital
                </span>
                <span className="inline-flex items-center rounded-sm bg-[#1A1A1A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Bilingual
                </span>
                <span className="inline-flex items-center rounded-sm bg-[#1A1A1A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Free RSVP page
                </span>
              </div>
            </div>

            {/* Digital invitation suite — primary product card */}
            <div className="bg-[#F5EFE3]/60 border border-[#E8D9A7]/50 rounded-md p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-gray-700">Digital cards</p>
                  <p className="mt-1 text-[15px] font-bold text-gray-900">
                    TZS {product.digitalUnitPrice.toLocaleString('en-US')} per card
                  </p>
                </div>
                <p className="text-[15px] font-bold text-gray-900 whitespace-nowrap tabular-nums">
                  TZS {digitalSubtotal.toLocaleString('en-US')}
                </p>
              </div>

              {/* Digital quantity picker — chip grid */}
              <div className="mb-4">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <p className="text-[12px] font-bold text-gray-700">How many guests?</p>
                  <p className="text-[12px] text-gray-600 tabular-nums">
                    {digitalQty.toLocaleString('en-US')} selected
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Number of guests">
                  {DIGITAL_QTY_OPTIONS.map((n) => {
                    const active = digitalQty === n
                    return (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setDigitalQty(n)}
                        className={cn(
                          'min-w-[60px] rounded-md border px-3.5 py-2 text-[13px] font-semibold transition tabular-nums',
                          active
                            ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500',
                        )}
                      >
                        {n.toLocaleString('en-US')}
                      </button>
                    )
                  })}
                  <span className="text-[12px] text-gray-500 mx-1" aria-hidden="true">or</span>
                  <input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder="Custom"
                    aria-label="Enter custom number of guests"
                    value={DIGITAL_QTY_OPTIONS.includes(digitalQty) ? '' : digitalQty}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === '') return
                      const n = Number(v)
                      if (!Number.isNaN(n) && n > 0) setDigitalQty(n)
                    }}
                    className="w-28 h-9 rounded-md border border-gray-300 bg-white px-3 text-[13px] font-semibold text-gray-800 tabular-nums focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A]"
                  />
                </div>
              </div>

              <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-gray-700 mb-2">Each card includes</p>
              <ul className="space-y-1.5 text-[13px] text-gray-700">
                {[
                  'Customised design with your names, date, and colours',
                  'Sent to every guest by WhatsApp or SMS — unlimited shares',
                  'Bilingual RSVP page (Swahili & English)',
                  'Live guest list dashboard with real-time response tracking',
                  'Free design assistance and one round of revisions',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check size={14} className="shrink-0 mt-0.5 text-[#1A1A1A]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Design colour — always relevant */}
            <ConfigGroup title="Design colour" value={`Swatch ${selectedColor + 1}`}>
              <div className="flex flex-wrap gap-2.5">
                {product.swatches.map((c, i) => (
                  <button
                    key={`${product.id}-c-${i}`}
                    type="button"
                    onClick={() => setSelectedColor(i)}
                    title={c}
                    aria-label={`Colour ${i + 1}: ${c}`}
                    aria-pressed={selectedColor === i}
                    className={cn(
                      'h-9 w-9 rounded-full border transition',
                      selectedColor === i ? 'ring-2 ring-offset-2 ring-[#1A1A1A] border-white' : 'border-gray-300 hover:border-gray-500',
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </ConfigGroup>

            {/* ─── Optional add-ons ─── */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-[13px] font-bold text-gray-900 mb-3">Optional add-ons</p>

              {/* VIP paper prints toggle */}
              <AddOnCard
                checked={paperPrints}
                onToggle={() => setPaperPrints((v) => !v)}
                title="VIP paper prints"
                description="Printed cards for elders, the head table, and anyone who needs a physical invite. Designed in Bagamoyo, shipped across Tanzania in 3–5 days."
                priceLabel={`From TZS ${paperUnitPrice.toLocaleString('en-US')} per piece`}
              >
                {paperPrints && (
                  <div className="mt-5 space-y-5 pl-7 border-l-2 border-gray-200">
                    {/* Paper qty — chip grid (matches digital qty pattern) */}
                    <div>
                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <p className="text-[12px] font-bold text-gray-700">Paper quantity</p>
                        <p className="text-[12px] text-gray-600 tabular-nums">
                          {paperQty.toLocaleString('en-US')} selected
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Number of paper prints">
                        {PAPER_QTY_OPTIONS.map((n) => {
                          const active = paperQty === n
                          return (
                            <button
                              key={n}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => setPaperQty(n)}
                              className={cn(
                                'min-w-[56px] rounded-md border px-3 py-1.5 text-[12px] font-semibold transition tabular-nums',
                                active
                                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500',
                              )}
                            >
                              {n.toLocaleString('en-US')}
                            </button>
                          )
                        })}
                        <span className="text-[12px] text-gray-500 mx-1" aria-hidden="true">or</span>
                        <input
                          type="number"
                          min={1}
                          inputMode="numeric"
                          placeholder="Custom"
                          aria-label="Enter custom paper quantity"
                          value={PAPER_QTY_OPTIONS.includes(paperQty) ? '' : paperQty}
                          onChange={(e) => {
                            const v = e.target.value
                            if (v === '') return
                            const n = Number(v)
                            if (!Number.isNaN(n) && n > 0) setPaperQty(n)
                          }}
                          className="w-24 h-8 rounded-md border border-gray-300 bg-white px-3 text-[12px] font-semibold text-gray-800 tabular-nums focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A]"
                        />
                      </div>
                    </div>

                    {/* Format */}
                    <ConfigGroup title="Format" value={format} compact>
                      <div className="flex gap-2 flex-wrap">
                        {FORMAT_OPTIONS.map((f) => {
                          const active = format === f
                          return (
                            <button
                              key={f}
                              type="button"
                              onClick={() => setFormat(f)}
                              className={cn(
                                'min-w-[110px] rounded-md border px-3.5 py-2 text-[13px] font-medium transition',
                                active
                                  ? 'border-[#1A1A1A] bg-white text-[#1A1A1A] ring-1 ring-[#1A1A1A]'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                              )}
                            >
                              {f}
                            </button>
                          )
                        })}
                      </div>
                    </ConfigGroup>

                    {/* Trim shape */}
                    <ConfigGroup title="Trim shape" value={TRIM_SHAPES.find((t) => t.id === trimShape)?.label} compact>
                      <div className="flex flex-wrap gap-2">
                        {TRIM_SHAPES.map((shape) => {
                          const active = trimShape === shape.id
                          return (
                            <button
                              key={shape.id}
                              type="button"
                              onClick={() => setTrimShape(shape.id)}
                              title={shape.label}
                              aria-label={shape.label}
                              aria-pressed={active}
                              className={cn(
                                'grid h-11 w-11 place-items-center rounded-md border transition',
                                active ? 'border-[#1A1A1A] ring-1 ring-[#1A1A1A]' : 'border-gray-300 hover:border-gray-500',
                              )}
                            >
                              <svg viewBox="0 0 16 20" className="h-5 w-4 stroke-[#1A1A1A]" fill="none" strokeWidth="1.4">
                                <path d={shape.d} />
                              </svg>
                            </button>
                          )
                        })}
                      </div>
                    </ConfigGroup>

                    {/* Paper type */}
                    <ConfigGroup title="Paper type" value={paperType} compact>
                      <div className="flex flex-wrap gap-2">
                        {PAPER_TYPES.map((p) => {
                          const active = paperType === p
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPaperType(p)}
                              className={cn(
                                'rounded-md border px-3 py-1.5 text-[12px] transition',
                                active
                                  ? 'border-[#1A1A1A] bg-white text-[#1A1A1A] ring-1 ring-[#1A1A1A]'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                              )}
                            >
                              {p}
                            </button>
                          )
                        })}
                      </div>
                    </ConfigGroup>

                    {/* Foil sub-add-on */}
                    <label className="flex items-start gap-3 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={foilAddon}
                        onChange={() => setFoilAddon((v) => !v)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <div className="grow">
                        <p className="text-[13px] font-bold text-gray-900">Foil &amp; letterpress accents</p>
                        <p className="text-[12px] text-gray-600">
                          Gold, silver, or rose-gold foil pressed onto your design — adds <strong>TZS {FOIL_ADDON_PRICE.toLocaleString('en-US')}</strong> flat to the order.
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </AddOnCard>

              {/* Door-scan service toggle */}
              <AddOnCard
                checked={doorScan}
                onToggle={() => setDoorScan((v) => !v)}
                title="Door-scan check-in service"
                description="Send an OpusFesta host to your venue. We scan each guest's invite QR code at the entrance and tick them off your live guest list in real time — no clipboards, no chaos."
                priceLabel={`TZS ${DOOR_SCAN_SERVICE_PRICE.toLocaleString('en-US')} flat fee per event`}
              />
            </div>

            {/* Order summary */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-[13px] font-bold text-gray-900 mb-3">Order summary</p>
              <dl className="space-y-2 text-[14px]">
                <SummaryRow label={`Digital cards (${digitalQty} guests)`} value={digitalSubtotal} />
                {paperPrints && (
                  <SummaryRow label={`VIP paper prints (${paperQty})`} value={paperSubtotal} />
                )}
                {paperPrints && foilAddon && (
                  <SummaryRow label="Foil & letterpress accents" value={FOIL_ADDON_PRICE} />
                )}
                {doorScan && (
                  <SummaryRow label="Door-scan check-in service" value={DOOR_SCAN_SERVICE_PRICE} />
                )}
                <div className="border-t border-gray-200 pt-3 flex items-baseline justify-between">
                  <dt className="text-[15px] font-bold text-gray-900">Total</dt>
                  <dd className="text-[26px] font-bold text-gray-900 leading-none">
                    TZS {total.toLocaleString('en-US')}
                  </dd>
                </div>
              </dl>
              {paperPrints && (
                <p className="mt-3 text-[12px] text-gray-700">
                  *Use code{' '}
                  <strong className="font-bold text-gray-900">{PROMO_CODE}</strong>{' '}
                  at checkout for 40% off the paper-print portion.
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center justify-center rounded-full border border-[#1A1A1A] bg-white text-[#1A1A1A] px-7 py-3.5 text-[13px] font-extrabold uppercase tracking-[0.1em] hover:bg-gray-50 transition"
              >
                Preview my invite
              </button>
              <button
                type="button"
                onClick={() => setShowCustomise(true)}
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-7 py-3.5 text-[13px] font-extrabold uppercase tracking-[0.1em]"
              >
                Customise
              </button>
            </div>

            {/* Reassurance card */}
            <div className="rounded-md bg-[#F5EFE3] border border-[#E8D9A7]/50 px-4 py-3.5 flex items-start gap-3">
              <span aria-hidden className="text-[#7A1F2B] text-lg leading-none mt-0.5">✦</span>
              <div className="text-[13px] leading-snug">
                <p className="font-bold text-gray-900">Free revisions if your plans change.</p>
                <Link href="#" className="text-gray-700 underline underline-offset-2 hover:text-gray-900">
                  See full details
                </Link>
              </div>
            </div>

            {/* Accordion */}
            <div className="border-t border-gray-200">
              <Accordion title="Details" defaultOpen>
                <p>
                  {product.name} is a {product.designer} signature design — elegant typography paired with
                  a customisable colour palette. Sent digitally to every guest by WhatsApp or SMS, with optional
                  paper prints designed in Bagamoyo for elders, VIPs, and the head table.
                </p>
                <dl className="grid grid-cols-[110px_1fr] gap-y-1 mt-3 text-[13px]">
                  <dt className="font-bold">Designer</dt><dd>{product.designer}</dd>
                  <dt className="font-bold">Delivery</dt><dd>WhatsApp / SMS / link</dd>
                  <dt className="font-bold">Languages</dt><dd>Swahili &amp; English (bilingual)</dd>
                  <dt className="font-bold">RSVP</dt><dd>Built-in, real-time tracking</dd>
                  {paperPrints && (
                    <>
                      <dt className="font-bold">Paper format</dt><dd>{format}</dd>
                      <dt className="font-bold">Trim</dt><dd>{TRIM_SHAPES.find((t) => t.id === trimShape)?.label}</dd>
                      <dt className="font-bold">Paper type</dt><dd>{paperType}</dd>
                      <dt className="font-bold">Paper size</dt><dd>5 × 7 inches</dd>
                    </>
                  )}
                </dl>
              </Accordion>
              <Accordion title="How door-scan check-in works">
                <p>
                  When you add the check-in service to your order, our host shows up at your venue 30 minutes
                  before the event with a scanner. Every digital invite includes a unique QR code — the host
                  scans each guest at the door and ticks them off your live guest list, so you know exactly
                  who arrived in real time. Travel costs included within Dar es Salaam, Arusha, Mwanza,
                  Bagamoyo, and Zanzibar.
                </p>
              </Accordion>
              {paperPrints && (
                <Accordion title="Paper, shipping & delivery">
                  <p>
                    <strong>{paperType}:</strong> Premium {paperType.toLowerCase()} stock, FSC-certified.
                    Paper prints ship from Bagamoyo in 3–5 working days anywhere in Tanzania.
                  </p>
                </Accordion>
              )}
              <Accordion title="Payment">
                <p>
                  M-Pesa, Airtel Money, Tigo Pesa, and major bank cards accepted. Pay in full or split into
                  two instalments — second instalment due before paper goes to print or before the
                  door-scan event date.
                </p>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Similar designs */}
      {recommendations.length > 0 && (
        <section className="px-4 sm:px-6 pb-16 sm:pb-24 border-t border-gray-200">
          <div className="mx-auto max-w-7xl pt-12 sm:pt-16">
            <h2 className="text-xl md:text-2xl font-serif font-medium text-gray-900 mb-6 sm:mb-8">
              Explore similar designs
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommendations.map((p) => (
                <Link key={p.id} href={`/invitations/p/${p.id}`} className="group flex flex-col">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_16px_-8px_rgba(0,0,0,0.12)] group-hover:shadow-xl transition-shadow duration-300">
                    <span className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.04]">
                      <InvitationVisual treatment={p.treatment} />
                    </span>
                  </div>
                  <p className="mt-2.5 text-[11px] uppercase tracking-[0.18em] text-gray-500">{p.designer}</p>
                  <p className="mt-0.5 text-[14px] font-bold text-gray-900 leading-snug line-clamp-2">{p.name}</p>
                  <p className="mt-1 text-[13px] text-gray-700">
                    From TZS {p.digitalUnitPrice.toLocaleString('en-US')} per digital card
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Preview modal — sample personalisation + WhatsApp share-preview */}
      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onCustomise={() => {
          setShowPreview(false)
          setShowCustomise(true)
        }}
        product={product}
        palette={product.palettes?.[selectedColor]}
      />

      {/* Customise modal — real form, live preview, send-out CTA */}
      <CustomiseModal
        open={showCustomise}
        onClose={() => setShowCustomise(false)}
        product={product}
        palette={product.palettes?.[selectedColor]}
      />
    </div>
  )
}

function ConfigGroup({
  title,
  value,
  compact = false,
  children,
}: {
  title: string
  value?: React.ReactNode
  compact?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <p className={cn('font-bold text-gray-900', compact ? 'text-[12px] mb-1.5' : 'text-[13px] mb-2.5')}>
        {title}
        {value && <span className="ml-2 font-normal text-gray-600">{value}</span>}
      </p>
      {children}
    </div>
  )
}

function AddOnCard({
  checked,
  onToggle,
  title,
  description,
  priceLabel,
  children,
}: {
  checked: boolean
  onToggle: () => void
  title: string
  description: string
  priceLabel: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn(
      'mb-3 rounded-md border transition',
      checked ? 'border-[#1A1A1A] bg-white' : 'border-gray-200 bg-white hover:border-gray-300',
    )}>
      <label className="flex items-start gap-3 cursor-pointer p-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
        />
        <div className="grow">
          <p className="text-[14px] font-bold text-gray-900">{title}</p>
          <p className="mt-1 text-[12px] text-gray-600 leading-relaxed">{description}</p>
          <p className="mt-1.5 text-[12px] font-bold text-[#1A1A1A]">{priceLabel}</p>
        </div>
      </label>
      {children && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-baseline">
      <dt className="text-gray-700">{label}</dt>
      <dd className="font-medium text-gray-900 tabular-nums">TZS {value.toLocaleString('en-US')}</dd>
    </div>
  )
}

function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] font-medium text-gray-900"
      >
        {title}
        <ChevronDown
          className={cn('h-5 w-5 text-gray-500 shrink-0 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="pb-5 text-[14px] text-gray-700 space-y-2 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MODALS — Preview my invite + Customise
// ─────────────────────────────────────────────────────────────────────────────

function ModalShell({
  open,
  onClose,
  ariaLabel,
  children,
}: {
  open: boolean
  onClose: () => void
  ariaLabel: string
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
        aria-hidden="true"
        data-lenis-prevent
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        data-lenis-prevent
        className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
      >
        <div className="min-h-full flex items-center justify-center p-4">{children}</div>
      </div>
    </>
  )
}

function PreviewModal({
  open,
  onClose,
  onCustomise,
  product,
  palette,
}: {
  open: boolean
  onClose: () => void
  onCustomise: () => void
  product: CatalogProduct
  palette?: import('@/components/guests/InvitationVisual').InvitationPalette
}) {
  const sampleCouple = { names: 'Amani  &  Neema', date: '22 · 08 · 2026', venue: 'Bagamoyo, Tanzania' }
  return (
    <ModalShell open={open} onClose={onClose} ariaLabel="Preview your invite">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
        <header className="sticky top-0 bg-white border-b border-gray-200 px-5 sm:px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-gray-500">Sample preview</p>
            <h2 className="text-[17px] font-bold text-gray-900 mt-0.5">{product.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </header>

        <div className="px-5 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invite preview — large */}
          <div className="relative aspect-[3/4] bg-gray-50 rounded-md shadow-md overflow-hidden ring-1 ring-gray-200">
            <InvitationVisual treatment={product.treatment} couple={sampleCouple} palette={palette} />
          </div>

          {/* Right column */}
          <div className="space-y-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-gray-500">Previewing as</p>
              <p className="mt-1 text-[15px] font-bold text-gray-900">{sampleCouple.names}</p>
              <p className="text-[13px] text-gray-700">{sampleCouple.date} · {sampleCouple.venue}</p>
            </div>

            {/* WhatsApp share preview mock */}
            <div className="rounded-lg bg-[#DCF8C6] border border-[#A8D89C]/60 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle size={14} className="text-[#075E54]" aria-hidden="true" />
                <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#075E54]">
                  WhatsApp share preview
                </p>
              </div>
              <p className="text-[13px] text-gray-900 leading-snug">
                Karibu! You&rsquo;re invited to <strong>{sampleCouple.names}</strong>&rsquo;s wedding on {sampleCouple.date}. View your invite &amp; RSVP:
              </p>
              <p className="mt-1.5 text-[12px] text-[#0B4B8C] underline">opusfesta.com/i/abc123</p>
            </div>

            <p className="text-[13px] text-gray-700 leading-relaxed">
              This is how the invite looks with sample names. Customise to add <strong>your</strong> names, date, venue, and colours.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={onCustomise}
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-7 py-3 text-[13px] font-extrabold uppercase tracking-[0.1em]"
              >
                Customise this design
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-[13px] font-semibold text-gray-700 underline underline-offset-4 hover:text-gray-900"
              >
                Close preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}

function CustomiseModal({
  open,
  onClose,
  product,
  palette,
}: {
  open: boolean
  onClose: () => void
  product: CatalogProduct
  palette?: import('@/components/guests/InvitationVisual').InvitationPalette
}) {
  const [names, setNames] = useState('Amani & Neema')
  const [dateISO, setDateISO] = useState('2026-08-22')
  const [venue, setVenue] = useState('Bagamoyo, Tanzania')
  const [message, setMessage] = useState('Together with their families, we invite you to celebrate our wedding.')

  const couple = useMemo(() => {
    // Convert "2026-08-22" → "22 · 08 · 2026" for the InvitationVisual rendering
    const date = dateISO ? dateISO.split('-').reverse().join(' · ') : ''
    return { names: names.replace(/&/g, '  &  '), date, venue }
  }, [names, dateISO, venue])

  return (
    <ModalShell open={open} onClose={onClose} ariaLabel="Customise your invite">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl my-8 overflow-hidden">
        <header className="sticky top-0 bg-white border-b border-gray-200 px-5 sm:px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-gray-500">Customise</p>
            <h2 className="text-[17px] font-bold text-gray-900 mt-0.5">{product.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close customiser"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </header>

        <div className="px-5 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Live preview */}
          <div className="md:sticky md:top-20 md:self-start">
            <div className="relative aspect-[3/4] bg-gray-50 rounded-md shadow-md overflow-hidden ring-1 ring-gray-200">
              <InvitationVisual treatment={product.treatment} couple={couple} palette={palette} />
            </div>
            <p className="mt-2 text-[11px] text-gray-500 text-center">Live preview — updates as you type</p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // No backend yet — close the modal and let the user know it'd send
              alert(`Your invite is ready! In the real flow we'd save and continue to the send step.\n\nNames: ${names}\nDate: ${dateISO}\nVenue: ${venue}`)
              onClose()
            }}
            className="space-y-4"
          >
            <Field label="Couple names" hint="Appears as the main name on the invite">
              <input
                type="text"
                value={names}
                onChange={(e) => setNames(e.target.value)}
                required
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:border-gray-500"
              />
            </Field>

            <Field label="Wedding date">
              <input
                type="date"
                value={dateISO}
                onChange={(e) => setDateISO(e.target.value)}
                required
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:border-gray-500"
              />
            </Field>

            <Field label="Venue / city">
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:border-gray-500"
              />
            </Field>

            <Field label="Personal message" hint="Optional — shown on the invite or RSVP page">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm leading-relaxed resize-none focus:outline-none focus:border-gray-500"
              />
            </Field>

            <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-7 py-3 text-[13px] font-extrabold uppercase tracking-[0.1em]"
              >
                Continue to send
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-[13px] font-semibold text-gray-700 underline underline-offset-4 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalShell>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[13px] font-bold text-gray-900 mb-1">{label}</label>
      {hint && <p className="text-[11px] text-gray-500 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

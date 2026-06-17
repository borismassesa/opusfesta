import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Heart, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InvitationVisual } from '@/components/guests/InvitationVisual'
import { ProductInfo, type Product } from '@/components/guests/productInfo'
import { FAQItem } from './FAQAccordion'
import type { InvitationsStyleStripContent } from '@/lib/cms/invitations-style-strip'
import type { InvitationsFeaturesContent, InvitationsFeatureCard } from '@/lib/cms/invitations-features'
import type { InvitationsFaqsContent } from '@/lib/cms/invitations-faqs'
import type {
  InvitationsEditorsPicksContent,
  InvitationsEditorsPicksPick,
  InvitationsEditorsPicksTreatment,
} from '@/lib/cms/invitations-editors-picks'

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function InvitationsLandingClient({
  styleStrip,
  features,
  faqs,
  editorsPicks,
  fromGuestPrice,
  testimonials,
}: {
  styleStrip: InvitationsStyleStripContent
  features: InvitationsFeaturesContent
  faqs: InvitationsFaqsContent
  editorsPicks: InvitationsEditorsPicksContent
  /** Lowest per-guest package price — shown as the digital "from" anchor on real products. */
  fromGuestPrice?: number
  testimonials?: React.ReactNode
}) {
  return (
    <div className="bg-white text-[#1A1A1A]">
      <SuiteHero items={styleStrip.items} />
      <EditorsPicks rows={editorsPicks.rows} fromGuestPrice={fromGuestPrice} />
      <SectionDivider />
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-7xl pt-10 sm:pt-14">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-gray-900">
              {features.heading}
            </h2>
          </div>
          <FeatureRow cards={features.cards} />
        </div>
      </section>
      <SectionDivider />
      {testimonials}
      <FAQs content={faqs} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUITE HERO — "shop by moment" heading + category circles (static, no morph)
// ─────────────────────────────────────────────────────────────────────────────

function SuiteHero({ items }: { items: InvitationsStyleStripContent['items'] }) {
  return (
    <section className="bg-white px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:pb-16 lg:pt-16">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="font-serif text-2xl font-medium text-gray-900 sm:text-3xl lg:text-4xl">
          Invitations for Every Moment
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-700 md:text-base">
          Pick one design once, and every card across your day matches your suite. No mixing fonts,
          no clashing palettes, no last-minute hunt for matching paper.
        </p>
      </div>

      {/* Single horizontal row: 3 circles in view on phones (4 on sm, 6 on lg),
          the rest reached by horizontal scroll. */}
      <div className="mx-auto mt-8 max-w-7xl sm:mt-10">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href ?? '/invitations/catalog'}
              className="group flex shrink-0 snap-start basis-[calc((100%-2rem)/3)] flex-col items-center text-center sm:basis-[calc((100%-3rem)/4)] lg:basis-[calc((100%-5rem)/6)]"
            >
              <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-full bg-white ring-1 ring-gray-200 transition-shadow group-hover:shadow-md">
                <Image
                  src={cat.img}
                  alt={cat.alt}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium leading-tight text-gray-800 group-hover:underline md:text-sm">
                {cat.label}
                <ArrowRight
                  size={14}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION SHELL + DIVIDER
// ─────────────────────────────────────────────────────────────────────────────

function SectionDivider() {
  return (
    <div className="px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="border-t border-gray-200 mt-10 sm:mt-14" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  3 PEACH FEATURE CARDS
// ─────────────────────────────────────────────────────────────────────────────

function renderFeatureVisual(card: InvitationsFeatureCard) {
  if (card.image_url) {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-md">
        <Image
          src={card.image_url}
          alt={card.title}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
      </div>
    )
  }
  if (card.visual === 'phone') return <FeatureVisualPhone />
  if (card.visual === 'envelope') return <FeatureVisualEnvelope />
  return <FeatureVisualInvitations />
}

function FeatureRow({ cards }: { cards: InvitationsFeatureCard[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {cards.map((c) => (
        <div key={c.id} className="bg-[#FCE9C2] rounded-md p-6 sm:p-7 flex flex-col items-center text-center">
          <h3 className="text-[18px] sm:text-[20px] font-extrabold tracking-tight text-[#1A1A1A]">{c.title}</h3>
          <p className="mt-3 text-[13px] text-[#1A1A1A]/75 leading-relaxed max-w-[280px]">{c.body}</p>
          <Link href={c.cta_href} className="mt-3 text-[13px] font-bold text-[#1A1A1A] underline underline-offset-2 hover:text-[var(--accent-hover)]">
            {c.cta_label}
          </Link>
          <div className="mt-7 sm:mt-9 w-full h-[180px] sm:h-[200px]">
            {renderFeatureVisual(c)}
          </div>
        </div>
      ))}
    </div>
  )
}

function FeatureVisualInvitations() {
  // Stack of 3 fanned invitation mocks
  return (
    <div className="relative h-full w-full">
      <div className="absolute left-1/2 top-[8%] -translate-x-1/2 w-[44%] aspect-[3/4] rotate-[-8deg] shadow-md">
        <div className="absolute inset-0"><InvitationVisual treatment="floral-border" /></div>
      </div>
      <div className="absolute left-1/2 top-[6%] -translate-x-1/2 w-[44%] aspect-[3/4] rotate-[3deg] shadow-md ml-[10%]">
        <div className="absolute inset-0"><InvitationVisual treatment="navy-gold" /></div>
      </div>
      <div className="absolute left-1/2 top-[4%] -translate-x-1/2 w-[44%] aspect-[3/4] rotate-[-2deg] shadow-md -ml-[8%]">
        <div className="absolute inset-0"><InvitationVisual treatment="classic-serif" /></div>
      </div>
    </div>
  )
}

function FeatureVisualPhone() {
  // CSS phone frame showing wedding website preview
  return (
    <div className="relative h-full w-full flex justify-center">
      <div className="relative w-[120px] sm:w-[130px] h-full rounded-[18px] bg-[#1A1A1A] p-[5px] shadow-lg">
        <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-white">
          <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-[40px] h-[12px] bg-[#1A1A1A] rounded-b-md z-10" />
          <div className="relative h-[55%] bg-[#A6B89A]/40">
            <Image src="/assets/images/authentic_couple.jpg" alt="" fill sizes="130px" className="object-cover" />
          </div>
          <div className="p-2.5 text-center">
            <p className="font-serif text-[11px] text-[#1A1A1A] leading-tight">Amani &amp; Neema</p>
            <p className="mt-1 text-[7px] uppercase tracking-[0.18em] text-gray-400">22 · 08 · 2026</p>
            <button className="mt-2 inline-block text-[7px] font-extrabold uppercase tracking-[0.18em] text-white bg-[#1A1A1A] rounded-full px-2.5 py-1">
              RSVP
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureVisualEnvelope() {
  // Cream envelope with handwritten-style address
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div className="relative w-[80%] aspect-[3/2] bg-[#F5EFE3] rounded-sm shadow-md overflow-hidden">
        {/* Envelope flap */}
        <div className="absolute inset-x-0 top-0 h-[55%]" style={{ background: 'linear-gradient(180deg, #FBF7F2 0%, #F5EFE3 100%)', clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
        {/* Address */}
        <div className="absolute left-[12%] bottom-[16%] right-[18%] text-left">
          <p className="font-serif italic text-[10px] sm:text-[11px] text-[#1A1A1A] leading-snug">
            The Mwakalinga Family<br />
            Plot 14, Mikocheni Road<br />
            Dar es Salaam
          </p>
        </div>
        {/* Stamp */}
        <div className="absolute top-2 right-2 w-[28px] h-[34px] bg-white border border-gray-200 rounded-sm flex items-center justify-center">
          <span className="text-[7px] font-bold text-[#7A1F2B]">TZ</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  EDITORS' PICKS — 4 editorial rows; alternating title + 3 picks per row
// ─────────────────────────────────────────────────────────────────────────────

function PickVisual({ pick }: { pick: InvitationsEditorsPicksPick }) {
  if (pick.media_url && pick.media_type === 'video') {
    return (
      <video
        src={pick.media_url}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
    )
  }
  if (pick.media_url) {
    return (
      <Image
        src={pick.media_url}
        alt={pick.name}
        fill
        sizes="(min-width: 768px) 25vw, 50vw"
        className="object-cover"
      />
    )
  }
  if (!pick.treatment) return null
  if (pick.treatment === 'flat-lay-stationery') return <FlatLayStationery />
  if (pick.treatment === 'menu-card') return <MenuCardVisual />
  const visual = (
    <InvitationVisual treatment={pick.treatment as Exclude<InvitationsEditorsPicksTreatment, 'flat-lay-stationery' | 'menu-card'>} />
  )
  if (pick.centered) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[58%] aspect-[3/4] shadow-lg">{visual}</div>
      </div>
    )
  }
  return visual
}

function pickToProduct(pick: InvitationsEditorsPicksPick): Product {
  return {
    id: pick.product_id ?? pick.id,
    category: pick.category,
    name: pick.name,
    priceWas: pick.price_was,
    priceNow: pick.price_now,
    digitalUnitPrice: pick.digital_unit_price,
    swatches: pick.swatches,
  }
}

function EditorsPicks({
  rows: cmsRows,
  fromGuestPrice,
}: {
  rows: InvitationsEditorsPicksContent['rows']
  fromGuestPrice?: number
}) {
  // Keep the first catalog section close to the page chrome now that the landing
  // hero has been removed.
  return (
    <section className="relative z-10 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl pt-4 sm:pt-6 space-y-12 sm:space-y-14 md:space-y-16">
        {cmsRows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10"
          >
            {/* Title is always first in DOM order (mobile reads top-to-bottom);
                on desktop, right-aligned rows move the title to the end via md:order-last.
                Two pick columns on phones keep the cards browsable without the
                page stretching to ~12k px of single-column squares. */}
            <div className={cn('col-span-2 md:col-span-1', row.align === 'right' && 'md:order-last')}>
              <EditorialTitleCell
                title={
                  <>
                    {row.title_line_1} <br className="hidden md:block" />
                    {row.title_line_2}
                  </>
                }
                align={row.align}
              />
            </div>
            {row.picks.map((p, i) => {
              const productHref = `/invitations/p/${p.product_id ?? p.id}`
              return (
                <Link
                  key={p.id}
                  href={productHref}
                  // Phones show a clean 2-up grid (title spans both columns, then
                  // two picks). Any 3rd+ pick is hidden on mobile to avoid a lonely
                  // half-row, and reappears at md where the row is title + 3 cards.
                  className={cn('flex flex-col group/pick', i >= 2 && 'hidden md:flex')}
                >
                  <PickCard
                    overlay={p.overlay === 'play' ? <PlayIcon /> : p.overlay === 'heart' ? <HeartIcon /> : undefined}
                    background={p.background}
                    badge={p.badge}
                  >
                    <PickVisual pick={p} />
                  </PickCard>
                  <ProductInfo product={pickToProduct(p)} href={productHref} fromGuestPrice={fromGuestPrice} />
                </Link>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

function EditorialTitleCell({
  title,
  align,
}: {
  title: React.ReactNode
  align: 'left' | 'right'
}) {
  return (
    <div
      className={cn(
        // Phones: title on the left, button on the right (one row). Desktop keeps
        // the original stacked column.
        'flex h-full flex-row items-start justify-between gap-3 md:flex-col md:items-start md:justify-center',
        align === 'left' ? 'md:pr-2' : 'md:pl-2',
      )}
    >
      <h3 className="min-w-0 font-serif text-[24px] sm:text-[30px] md:text-[34px] lg:text-[38px] leading-[1.05] text-[#1A1A1A]">
        {title}
      </h3>
      <Link
        href="/invitations/catalog"
        className="inline-flex w-fit shrink-0 items-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-4 py-2 sm:px-5 sm:py-2.5 text-[11px] sm:text-[12px] font-extrabold uppercase tracking-[0.1em] sm:tracking-[0.12em] md:mt-5"
      >
        Explore designs
      </Link>
    </div>
  )
}

function MenuCardVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="relative w-[68%] h-[90%] bg-white shadow-md rounded-sm overflow-hidden flex flex-col items-center justify-center p-3 text-[#1A1A1A] rotate-[-2deg]">
        <p className="text-[8px] uppercase tracking-[0.32em] text-[#1A1A1A]/60">Menu</p>
        <div className="my-2 h-px w-6 bg-[#A6B89A]" />
        <p className="font-serif italic text-[12px] leading-tight text-center">
          Wali wa Nazi<br />
          Kuku Choma<br />
          Mishkaki<br />
          Mandazi
        </p>
        <div className="mt-2 h-px w-4 bg-[#A6B89A]" />
        <p className="mt-2 text-[7px] uppercase tracking-[0.22em] text-[#5C6B4D]">A &amp; N · Bagamoyo</p>
      </div>
    </div>
  )
}

function PickCard({
  children,
  overlay,
  badge,
  background,
}: {
  children: React.ReactNode
  overlay?: React.ReactNode
  badge?: string
  background?: string
}) {
  return (
    <div
      className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-[#FAF7F2]"
      style={background ? { backgroundColor: background } : undefined}
    >
      {children}
      {badge && (
        <span className="absolute left-2.5 bottom-2.5 rounded-sm bg-white/95 px-2 py-1 text-[10px] font-bold tracking-wide text-[#1A1A1A] shadow-sm">
          {badge}
        </span>
      )}
      {overlay}
    </div>
  )
}

function PlayIcon() {
  return (
    <span className="absolute right-2.5 bottom-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm transition group-hover:bg-white">
      <Play className="h-3.5 w-3.5 fill-[#1A1A1A] text-[#1A1A1A]" />
    </span>
  )
}

function HeartIcon() {
  return (
    <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-sm transition group-hover:bg-white">
      <Heart className="h-3.5 w-3.5 text-[#1A1A1A]" />
    </span>
  )
}

function FlatLayStationery() {
  // CSS mock — stationery flat-lay in a neutral frame
  return (
    <div className="absolute inset-0">
      {/* Envelope */}
      <div className="absolute left-[10%] top-[14%] w-[42%] aspect-[3/2] bg-[#F5EFE3] rounded-sm shadow-md rotate-[-6deg]">
        <div
          className="absolute inset-x-0 top-0 h-[55%]"
          style={{
            background: 'linear-gradient(180deg, #FBF7F2 0%, #F5EFE3 100%)',
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          }}
        />
      </div>
      {/* Invitation card */}
      <div className="absolute right-[8%] top-[8%] w-[36%] aspect-[3/4] shadow-md rotate-[5deg]">
        <InvitationVisual treatment="classic-serif" />
      </div>
      {/* Tag */}
      <div className="absolute right-[14%] bottom-[12%] w-[22%] aspect-[3/2] bg-white rounded-sm shadow-md rotate-[-3deg] flex items-center justify-center">
        <span className="text-[7px] uppercase tracking-[0.22em] font-bold text-[#1A1A1A]">A &amp; N</span>
      </div>
      {/* Wax-seal dot */}
      <span className="absolute left-[42%] bottom-[20%] h-5 w-5 rounded-full bg-[#7A1F2B] shadow-md" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  FAQS — accordion-style frequently asked questions
// ─────────────────────────────────────────────────────────────────────────────

function FAQs({ content }: { content: InvitationsFaqsContent }) {
  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-4xl pt-10 sm:pt-14">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-gray-900 mb-4">
            {content.heading}
          </h2>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-700 leading-relaxed">
            {content.description}
          </p>
        </div>
        <div className="border-y border-gray-200">
          {content.items.map((item) => (
            <FAQItem key={item.id} q={item.question} a={item.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}


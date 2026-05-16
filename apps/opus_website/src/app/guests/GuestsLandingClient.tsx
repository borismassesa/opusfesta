'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES + INVITATION VISUAL (CSS-mocked stationery — clearly illustrative)
// ─────────────────────────────────────────────────────────────────────────────

type Treatment =
  | 'classic-serif' | 'minimal-line' | 'modern-block'  | 'floral-border'
  | 'navy-gold'     | 'blush-frame'  | 'sage-panel'    | 'cultural-red'
  | 'arch-script'   | 'photo-overlay'

type Couple = { names: string; date: string; venue: string }

const COUPLE_DEFAULT: Couple = { names: 'Amani  &  Neema', date: '22 · 08 · 2026', venue: 'Bagamoyo, Tanzania' }

function InvitationVisual({ treatment, couple = COUPLE_DEFAULT }: { treatment: Treatment; couple?: Couple }) {
  const { names, date, venue } = couple
  switch (treatment) {
    case 'classic-serif':
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F5EFE3] p-4 text-[#1A1A1A]">
          <p className="text-[8px] uppercase tracking-[0.32em] text-[#1A1A1A]/50">Save the Date</p>
          <p className="mt-3 font-serif text-[16px] leading-tight text-center">{names}</p>
          <div className="my-3 h-px w-10 bg-[#1A1A1A]/30" />
          <p className="text-[10px] tracking-[0.22em] text-[#1A1A1A]/70">{date}</p>
          <p className="mt-2 text-[8px] tracking-[0.22em] text-[#1A1A1A]/50 uppercase">{venue}</p>
        </div>
      )
    case 'minimal-line':
      return (
        <div className="absolute inset-0 flex flex-col bg-white p-4">
          <div className="h-px w-full bg-[#1A1A1A]" />
          <div className="flex flex-1 flex-col items-start justify-center">
            <p className="text-[7px] uppercase tracking-[0.3em] text-[#1A1A1A]/50">Together with their families</p>
            <p className="mt-3 font-serif text-[17px] text-[#1A1A1A] leading-tight">{names}</p>
            <p className="mt-3 text-[9px] uppercase tracking-[0.22em] text-[#1A1A1A]/60">{date}</p>
          </div>
          <div className="h-px w-full bg-[#1A1A1A]" />
        </div>
      )
    case 'modern-block':
      return (
        <div className="absolute inset-0 flex flex-col justify-end bg-white p-4">
          <div className="bg-[#1A1A1A] -mx-4 -mb-4 px-4 py-4 text-white">
            <p className="text-[7px] uppercase tracking-[0.3em] text-white/60">{date}</p>
            <p className="mt-1.5 font-sans text-[16px] font-black uppercase tracking-tight leading-[1] text-white">{names}</p>
            <p className="mt-1.5 text-[8px] uppercase tracking-[0.22em] text-white/60">{venue}</p>
          </div>
        </div>
      )
    case 'floral-border':
      return (
        <div className="absolute inset-0 bg-[#FBF7F2] p-3">
          <div className="relative h-full w-full border border-[#A6B89A]/40 p-3 flex flex-col items-center justify-center">
            <span className="absolute -top-[6px] -left-[6px] h-3 w-3 rounded-full bg-[#A6B89A]/60" />
            <span className="absolute -top-[6px] -right-[6px] h-3 w-3 rounded-full bg-[#F5DCE2]" />
            <span className="absolute -bottom-[6px] -left-[6px] h-3 w-3 rounded-full bg-[#F5DCE2]" />
            <span className="absolute -bottom-[6px] -right-[6px] h-3 w-3 rounded-full bg-[#A6B89A]/60" />
            <p className="text-[7px] uppercase tracking-[0.3em] text-[#5C6B4D]">You are invited</p>
            <p className="mt-2 font-serif italic text-[16px] text-[#1A1A1A] leading-tight text-center">{names}</p>
            <div className="my-2 h-px w-8 bg-[#A6B89A]" />
            <p className="text-[9px] tracking-[0.18em] text-[#5C6B4D]">{date}</p>
          </div>
        </div>
      )
    case 'navy-gold':
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1E2D54] p-4 text-[#E8D9A7]">
          <p className="text-[8px] uppercase tracking-[0.32em]">Save the Date</p>
          <div className="mt-3 h-px w-6 bg-[#E8D9A7]" />
          <p className="mt-3 font-serif text-[16px] leading-tight text-center text-[#F5EFE3]">{names}</p>
          <p className="mt-3 text-[9px] tracking-[0.22em]">{date}</p>
          <p className="mt-1 text-[7px] uppercase tracking-[0.22em] text-[#E8D9A7]/70">{venue}</p>
        </div>
      )
    case 'blush-frame':
      return (
        <div className="absolute inset-0 bg-[#F5DCE2] p-3">
          <div className="h-full w-full bg-white p-3 flex flex-col items-center justify-center">
            <p className="text-[7px] uppercase tracking-[0.3em] text-[#A84F66]">Save the Date</p>
            <p className="mt-3 font-serif italic text-[17px] text-[#7A1F2B] leading-tight text-center">{names}</p>
            <p className="mt-3 text-[9px] tracking-[0.22em] text-[#A84F66]">{date}</p>
          </div>
        </div>
      )
    case 'sage-panel':
      return (
        <div className="absolute inset-0 flex bg-[#A6B89A]">
          <div className="w-1/3 bg-[#A6B89A]" />
          <div className="flex-1 bg-[#FBF7F2] p-3 flex flex-col justify-center items-start">
            <p className="text-[7px] uppercase tracking-[0.3em] text-[#5C6B4D]">Wedding</p>
            <p className="mt-2 font-serif text-[15px] text-[#1A1A1A] leading-tight">{names}</p>
            <div className="my-2 h-px w-6 bg-[#5C6B4D]" />
            <p className="text-[8px] tracking-[0.22em] text-[#5C6B4D]">{date}</p>
            <p className="mt-1 text-[7px] uppercase tracking-[0.18em] text-[#5C6B4D]/70">{venue}</p>
          </div>
        </div>
      )
    case 'cultural-red':
      return (
        <div className="absolute inset-0 bg-[#7A1F2B] p-3">
          <div className="relative h-full w-full border-2 border-[#C8A35C] p-3 flex flex-col items-center justify-center">
            <p className="font-serif text-[10px] tracking-[0.3em] text-[#C8A35C]">— KARIBU —</p>
            <p className="mt-3 font-serif text-[15px] leading-tight text-center text-[#F5EFE3]">{names}</p>
            <div className="my-2 flex items-center gap-1">
              <span className="text-[#C8A35C] text-[8px]">✦</span>
              <p className="text-[9px] tracking-[0.22em] text-[#C8A35C]">{date}</p>
              <span className="text-[#C8A35C] text-[8px]">✦</span>
            </div>
            <p className="text-[7px] uppercase tracking-[0.22em] text-[#C8A35C]/80">{venue}</p>
          </div>
        </div>
      )
    case 'arch-script':
      return (
        <div className="absolute inset-0 bg-[#F5EFE3] flex flex-col items-center justify-end p-3">
          <div className="relative w-full h-full flex flex-col items-center justify-center pt-6">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[60%] rounded-t-full border-2 border-[#7A1F2B]/70" />
            <p className="relative font-serif italic text-[16px] text-[#7A1F2B] leading-tight text-center px-4">{names}</p>
            <div className="relative mt-3 h-px w-8 bg-[#7A1F2B]/60" />
            <p className="relative mt-2 text-[8px] uppercase tracking-[0.22em] text-[#7A1F2B]/80">{date}</p>
          </div>
        </div>
      )
    case 'photo-overlay':
      return (
        <div className="absolute inset-0">
          <Image
            src="/assets/images/cutesy_couple.jpg"
            alt="Couple portrait used in invitation"
            fill
            sizes="(min-width:1024px) 25vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-white">
            <p className="text-[7px] uppercase tracking-[0.32em] text-white/70">Save the Date</p>
            <p className="mt-2 font-serif text-[16px] leading-tight text-center">{names}</p>
            <div className="my-2 h-px w-8 bg-white/60" />
            <p className="text-[8px] tracking-[0.22em] text-white/80">{date}</p>
          </div>
        </div>
      )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function GuestsLandingClient() {
  return (
    <div className="bg-white text-[#1A1A1A]">
      <HeroBanner />
      <Section title="Wedding stationery made easy, from invite to seat">
        <FeatureRow />
      </Section>
      <SectionDivider />
      <Section title="Shop designs by style">
        <DesignsByStyle />
      </Section>
      <SectionDivider />
      <Section title="Shop by category">
        <ShopByCategory />
      </Section>
      <SectionDivider />
      <Section title="Check out these trending designs" bottomClass="pb-20 sm:pb-28 md:pb-32">
        <TrendingDesigns />
      </Section>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  HERO BANNER
// ─────────────────────────────────────────────────────────────────────────────

function HeroBanner() {
  return (
    <section className="px-4 sm:px-6 pt-4 sm:pt-6">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-md bg-[#F5EFE3] min-h-[260px] sm:min-h-[340px] md:min-h-[400px]">
          {/* Linen-y texture using subtle radial dots */}
          <div className="absolute inset-0 opacity-[0.18] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #B7A88E 0.6px, transparent 0)', backgroundSize: '6px 6px' }} />

          <div className="relative grid grid-cols-1 md:grid-cols-12 items-center gap-6 md:gap-10 p-6 sm:p-10 md:p-14">
            {/* Copy */}
            <div className="md:col-span-5 lg:col-span-5">
              <h1 className="text-[2rem] sm:text-[2.6rem] md:text-5xl lg:text-[3.2rem] font-black uppercase tracking-tighter leading-[1] text-[#1A1A1A]">
                Free guest list +<br />free RSVP page
              </h1>
              <p className="mt-4 sm:mt-5 text-[14px] sm:text-[15px] text-[#1A1A1A]/80 leading-relaxed max-w-sm">
                Pick your wedding invitations and we throw in a matching website, a bilingual RSVP page and an address book — at no charge — for every OpusFesta couple.
              </p>
              <Link
                href="/my/guests"
                className="mt-6 inline-flex items-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-7 py-3 text-[13px] font-extrabold uppercase tracking-[0.12em]"
              >
                Open my guest list
              </Link>
            </div>

            {/* Flat-lay-style arrangement (CSS) */}
            <div className="md:col-span-7 lg:col-span-7 relative h-[200px] sm:h-[280px] md:h-[340px]">
              {/* Pearls — decorative diagonal */}
              <div className="absolute top-0 left-0 right-0 h-2 hidden md:block">
                <div className="flex gap-[3px]">
                  {Array.from({ length: 80 }).map((_, i) => (
                    <span key={i} className="block h-2 w-2 rounded-full bg-gradient-to-br from-white to-[#E8D9A7]/60 shadow-sm" />
                  ))}
                </div>
              </div>

              {/* Couple portrait */}
              <div className="absolute right-[8%] top-[6%] w-[28%] aspect-[3/4] overflow-hidden rounded-sm shadow-md rotate-[-4deg] bg-white">
                <Image src="/assets/images/cutesy_couple.jpg" alt="" fill sizes="200px" className="object-cover" />
              </div>

              {/* Invitation: Modern block */}
              <div className="absolute left-0 top-[30%] w-[34%] aspect-[3/4] shadow-md rotate-[-3deg]">
                <div className="absolute inset-0"><InvitationVisual treatment="modern-block" /></div>
              </div>

              {/* Invitation: Floral border */}
              <div className="absolute left-[28%] top-[15%] w-[30%] aspect-[3/4] shadow-md rotate-[2deg]">
                <div className="absolute inset-0"><InvitationVisual treatment="floral-border" /></div>
              </div>

              {/* Invitation: Navy gold */}
              <div className="absolute right-[2%] top-[55%] w-[32%] aspect-[3/4] shadow-md rotate-[5deg]">
                <div className="absolute inset-0"><InvitationVisual treatment="navy-gold" /></div>
              </div>

              {/* Small stationery label sticker */}
              <div className="absolute right-[42%] bottom-[2%] hidden sm:block bg-white border border-gray-200 rounded-sm px-3 py-1 rotate-[-2deg] shadow-sm">
                <p className="text-[9px] uppercase tracking-[0.22em] font-bold text-[#1A1A1A]">Bagamoyo Modern</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION SHELL + DIVIDER
// ─────────────────────────────────────────────────────────────────────────────

function Section({ title, children, bottomClass = '' }: { title: string; children: React.ReactNode; bottomClass?: string }) {
  return (
    <section className="px-4 sm:px-6">
      <div className={cn('mx-auto max-w-7xl pt-10 sm:pt-14', bottomClass)}>
        <h2 className="text-center text-[18px] sm:text-[22px] md:text-[26px] font-extrabold tracking-tight text-[#1A1A1A] mb-7 sm:mb-9">
          {title}
        </h2>
        {children}
      </div>
    </section>
  )
}

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

function FeatureRow() {
  const cards = [
    {
      title: 'Free guest list, free RSVPs',
      body: "Track every yes, every plus-one, every dietary need. Free with every OpusFesta wedding.",
      cta: 'Open my guest list',
      href: '/my/guests',
      visual: <FeatureVisualInvitations />,
    },
    {
      title: 'Free matching website',
      body: 'Pick an invitation, get a wedding website to match — bilingual RSVP form built in, ready to share.',
      cta: 'Find your match',
      href: '/my/planning',
      visual: <FeatureVisualPhone />,
    },
    {
      title: 'Easy guest addressing',
      body: 'Save addresses against names. We pull them onto envelopes when you order — handwritten or printed.',
      cta: 'Get started',
      href: '/my/guests',
      visual: <FeatureVisualEnvelope />,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {cards.map((c) => (
        <div key={c.title} className="bg-[#FCE9C2] rounded-md p-6 sm:p-7 flex flex-col items-center text-center">
          <h3 className="text-[18px] sm:text-[20px] font-extrabold tracking-tight text-[#1A1A1A]">{c.title}</h3>
          <p className="mt-3 text-[13px] text-[#1A1A1A]/75 leading-relaxed max-w-[280px]">{c.body}</p>
          <Link href={c.href} className="mt-3 text-[13px] font-bold text-[#1A1A1A] underline underline-offset-2 hover:text-[var(--accent-hover)]">
            {c.cta}
          </Link>
          <div className="mt-7 sm:mt-9 w-full h-[180px] sm:h-[200px]">
            {c.visual}
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
//  SHOP DESIGNS BY STYLE — 4 portrait cards
// ─────────────────────────────────────────────────────────────────────────────

function DesignsByStyle() {
  const items: { label: string; treatment: Treatment }[] = [
    { label: 'Floral',   treatment: 'floral-border' },
    { label: 'Classic',  treatment: 'navy-gold' },
    { label: 'Rustic',   treatment: 'sage-panel' },
    { label: 'Vintage',  treatment: 'arch-script' },
  ]
  return (
    <div className="relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {items.map((it) => (
          <Link key={it.label} href="#" className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-white rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_16px_-8px_rgba(0,0,0,0.12)]">
              <InvitationVisual treatment={it.treatment} />
            </div>
            <p className="mt-3 text-center text-[14px] text-[#1A1A1A] group-hover:underline underline-offset-2">
              {it.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Carousel chevron — visual only */}
      <button
        aria-label="More styles"
        className="hidden md:grid absolute right-[-20px] top-[40%] -translate-y-1/2 h-9 w-9 place-items-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
      >
        <ChevronRight className="h-4 w-4 text-[#1A1A1A]" />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHOP BY CATEGORY — 4 cards
// ─────────────────────────────────────────────────────────────────────────────

function ShopByCategory() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      <CategoryCard label="Save the Dates" visual={<CatSaveDate />} />
      <CategoryCard label="Invitations"    visual={<CatInvitations />} />
      <CategoryCard label="Ceremony & Reception" visual={<CatCeremony />} />
      <CategoryCard label="Thank Yous"     visual={<CatThankYou />} />
    </div>
  )
}

function CategoryCard({ label, visual }: { label: string; visual: React.ReactNode }) {
  return (
    <Link href="#" className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#FBF7F2] rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_16px_-8px_rgba(0,0,0,0.10)]">
        {visual}
      </div>
      <p className="mt-3 text-center text-[14px] text-[#1A1A1A] group-hover:underline underline-offset-2">
        {label}
      </p>
    </Link>
  )
}

function CatSaveDate() {
  return (
    <div className="absolute inset-0 p-4 flex items-center justify-center">
      <div className="relative w-[70%] aspect-[3/4] shadow-md rotate-[-3deg]">
        <Image src="/assets/images/beautiful_bride.jpg" alt="" fill sizes="200px" className="object-cover" />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 flex flex-col items-center justify-end p-3 text-white">
          <p className="font-serif italic text-[14px] leading-tight">Save the Date</p>
          <p className="mt-1 text-[8px] tracking-[0.22em] uppercase text-white/80">22 · 08 · 2026</p>
        </div>
      </div>
    </div>
  )
}

function CatInvitations() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-3">
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute w-[55%] aspect-[3/4] rotate-[-8deg] shadow-md left-[8%] top-[15%]">
          <div className="absolute inset-0"><InvitationVisual treatment="classic-serif" /></div>
        </div>
        <div className="absolute w-[55%] aspect-[3/4] rotate-[2deg] shadow-md right-[6%] top-[12%]">
          <div className="absolute inset-0"><InvitationVisual treatment="floral-border" /></div>
        </div>
      </div>
    </div>
  )
}

function CatCeremony() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-[#F5EFE3]">
      <div className="relative w-[55%] aspect-square bg-white shadow-md rounded-sm flex flex-col items-center justify-center">
        <p className="text-[8px] uppercase tracking-[0.32em] text-[#1A1A1A]/60 font-bold">Table</p>
        <p className="mt-1 font-serif text-[44px] sm:text-[56px] leading-none text-[#1A1A1A]">16</p>
        <div className="mt-3 h-px w-8 bg-[#A6B89A]" />
        <p className="mt-2 text-[7px] tracking-[0.22em] uppercase text-[#5C6B4D]">Bagamoyo</p>
      </div>
    </div>
  )
}

function CatThankYou() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-[#FBF7F2]">
      <div className="relative w-[80%] aspect-[5/4] bg-white shadow-md rounded-sm overflow-hidden">
        {/* Botanical corner accents */}
        <span className="absolute -top-2 -left-2 h-8 w-8 rounded-full bg-[#A6B89A]/45" />
        <span className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-[#A6B89A]/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-serif italic text-[18px] text-[#1A1A1A]">thank you</p>
          <p className="mt-2 text-[8px] uppercase tracking-[0.32em] text-[#5C6B4D] font-bold">A &amp; N</p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  TRENDING DESIGNS — 4 portrait cards with full product names
// ─────────────────────────────────────────────────────────────────────────────

function TrendingDesigns() {
  const items: { name: string; treatment: Treatment }[] = [
    { name: 'Botanical Frame Wedding Invitations',           treatment: 'floral-border' },
    { name: 'Modern Block All-in-one Invitations',           treatment: 'modern-block' },
    { name: 'Heritage Crown Monogram Invitations by Bibi',   treatment: 'cultural-red' },
    { name: 'Two of Us Photo Save the Date Cards',           treatment: 'photo-overlay' },
  ]
  return (
    <div className="relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {items.map((it) => (
          <Link key={it.name} href="#" className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-white rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_16px_-8px_rgba(0,0,0,0.12)]">
              <InvitationVisual treatment={it.treatment} />
            </div>
            <p className="mt-3 text-center text-[13px] text-[#1A1A1A] group-hover:underline underline-offset-2 leading-snug px-2">
              {it.name}
            </p>
          </Link>
        ))}
      </div>

      <button
        aria-label="More designs"
        className="hidden md:grid absolute right-[-20px] top-[40%] -translate-y-1/2 h-9 w-9 place-items-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
      >
        <ChevronRight className="h-4 w-4 text-[#1A1A1A]" />
      </button>
    </div>
  )
}


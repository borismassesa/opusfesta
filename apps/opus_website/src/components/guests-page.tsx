'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  Clock3,
  Heart,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircle,
  Plus,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react'
import Reveal from '@/components/ui/Reveal'

type GuestStatus = 'Confirmed' | 'Pending' | 'Declined'
type FilterStatus = GuestStatus | 'All'

const GUEST_PREVIEW = [
  { name: 'Sarah & Daniel', side: 'Bride family', meal: 'Vegetarian', plusOne: true, status: 'Confirmed' as GuestStatus },
  { name: 'Neema Julius', side: 'College friend', meal: 'Standard', plusOne: false, status: 'Pending' as GuestStatus },
  { name: 'Asha Omari', side: 'Cousin', meal: 'Halal', plusOne: true, status: 'Confirmed' as GuestStatus },
  { name: 'Michael R.', side: 'Work', meal: 'Standard', plusOne: false, status: 'Declined' as GuestStatus },
  { name: 'Joyce & Kelvin', side: 'Groom family', meal: 'Standard', plusOne: true, status: 'Confirmed' as GuestStatus },
  { name: 'Tina Msuya', side: 'Friends', meal: 'Vegan', plusOne: false, status: 'Pending' as GuestStatus },
] as const

const FLOW_STEPS = [
  {
    step: '01',
    title: 'Import your list',
    body: 'Start with households, friends, family, and plus-ones without rebuilding everything from scratch.',
  },
  {
    step: '02',
    title: 'Send invitations',
    body: 'Share RSVP links, collect dietary notes, and keep every response tied to the right guest record.',
  },
  {
    step: '03',
    title: 'Track replies live',
    body: 'Watch headcount changes in real time, follow up with pending guests, and avoid manual status chasing.',
  },
  {
    step: '04',
    title: 'Seat with confidence',
    body: 'Move from final count to seating and table planning with fewer last-minute surprises.',
  },
] as const

const FEATURE_CARDS = [
  {
    icon: Users,
    title: 'Households, plus-ones, and tags',
    body: 'Group guests properly, track companions, and label every list segment without duplicate records.',
  },
  {
    icon: CheckCircle2,
    title: 'RSVP tracking that stays current',
    body: 'See confirmed, pending, and declined responses instantly as guests reply from their invitation link.',
  },
  {
    icon: Heart,
    title: 'Dietary notes and special needs',
    body: 'Keep meal preferences, accessibility notes, and special arrangements attached to each guest.',
  },
  {
    icon: BellRing,
    title: 'Follow-ups without the chaos',
    body: 'Send reminders at the right time instead of checking spreadsheets, messages, and screenshots.',
  },
  {
    icon: LayoutGrid,
    title: 'Ready for seating',
    body: 'Move smoothly from RSVP count to tables, zones, and final guest placement once the list settles.',
  },
  {
    icon: Sparkles,
    title: 'Built for wedding communication',
    body: 'Everything is designed around guest-facing details, not generic event admin that feels cold or clunky.',
  },
] as const

const RSVP_SUMMARY = [
  { label: 'Invited', value: '142' },
  { label: 'Confirmed', value: '96' },
  { label: 'Pending', value: '31' },
  { label: 'Declined', value: '15' },
] as const

const FILTERS: FilterStatus[] = ['All', 'Confirmed', 'Pending', 'Declined']

function statusClasses(status: GuestStatus): string {
  if (status === 'Confirmed') return 'bg-[var(--accent)] text-[var(--on-accent)]'
  if (status === 'Declined') return 'bg-[#FDEBEC] text-[#C94B63]'
  return 'bg-[#FFF2E6] text-[#C97921]'
}

function MiniDashboard() {
  const [filter, setFilter] = useState<FilterStatus>('All')

  const visibleGuests =
    filter === 'All' ? GUEST_PREVIEW.slice(0, 5) : GUEST_PREVIEW.filter((guest) => guest.status === filter).slice(0, 5)

  return (
    <div className="rounded-[28px] border border-gray-200 bg-white p-4 shadow-[0_18px_60px_rgba(0,0,0,0.08)] sm:rounded-[36px] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Guest HQ</p>
          <h3 className="mt-2 text-xl font-black tracking-tight text-[#1A1A1A] sm:text-2xl">
            Every RSVP in one view.
          </h3>
        </div>
        <span className="rounded-full bg-[#1A1A1A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RSVP_SUMMARY.map((stat) => (
          <div key={stat.label} className="rounded-[20px] bg-[#F5F4F1] px-4 py-3 text-left">
            <p className="text-xl font-black text-[#1A1A1A]">{stat.value}</p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-[11px] font-bold transition-colors ${
              filter === item ? 'bg-[#1A1A1A] text-white' : 'bg-[#F5F4F1] text-gray-500 hover:bg-gray-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-2.5">
        {visibleGuests.map((guest) => (
          <div key={guest.name} className="flex items-center gap-3 rounded-[20px] border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2F2F0] text-[11px] font-black text-[#1A1A1A]">
              {guest.name
                .split(' ')
                .slice(0, 2)
                .map((part) => part[0])
                .join('')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#1A1A1A]">{guest.name}</p>
              <p className="truncate text-[11px] font-medium text-gray-500">
                {guest.side} · {guest.meal}
                {guest.plusOne ? ' · Plus-one' : ''}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] ${statusClasses(guest.status)}`}>
              {guest.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[22px] bg-[#F9F5FB] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B63A3]">Pending follow-up</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-[#4B3E54]">
            11 guests still need a reminder before the RSVP deadline on August 12.
          </p>
        </div>
        <div className="rounded-[22px] bg-[#F4F7FB] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5E7AA1]">Seat planning ready</p>
          <p className="mt-2 text-sm font-medium leading-relaxed text-[#42546D]">
            96 confirmed guests can now be grouped into tables, sides, and VIP rows.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function GuestsPage() {
  return (
    <main className="font-sans text-[#1A1A1A] bg-[#FFFFFF] selection:bg-[var(--accent)] selection:text-[var(--on-accent)]">
      <section className="px-4 pt-14 pb-12 sm:px-6 sm:pt-18 sm:pb-16 md:pt-24 md:pb-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.02fr_0.98fr] md:gap-14">
          <Reveal direction="left" className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F5F4F1] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              Guests & RSVPs
            </span>

            <h1 className="mt-6 text-[2.8rem] font-black uppercase tracking-tighter leading-[0.98] text-[#1A1A1A] sm:text-6xl md:text-7xl lg:text-[84px]">
              Guest list chaos,
              <br />
              handled beautifully.
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-base font-medium leading-relaxed text-gray-600 sm:text-lg md:mx-0 md:text-xl">
              Invite guests, collect RSVPs, manage plus-ones, meal choices, and reminders, then move straight into seating with a list that actually stays clean.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-7 py-4 text-sm font-bold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                Start managing guests
                <ArrowRight size={16} />
              </Link>
              <Link
                href="#guest-dashboard"
                className="text-sm font-bold text-[#1A1A1A] underline underline-offset-4 transition-colors hover:text-gray-600"
              >
                See the dashboard
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 md:justify-start">
              <span>RSVP tracking</span>
              <span>Plus-ones</span>
              <span>Meal notes</span>
              <span>Seating ready</span>
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.08}>
            <MiniDashboard />
          </Reveal>
        </div>
      </section>

      <section className="border-t border-gray-200 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: 'Built around real guest records',
              body: 'Track households, tags, plus-ones, and special requests without splitting people across separate sheets.',
            },
            {
              icon: Mail,
              title: 'Invitations and replies stay connected',
              body: 'Every RSVP, follow-up, and note stays attached to the right guest instead of drifting into messages and screenshots.',
            },
            {
              icon: LayoutGrid,
              title: 'Ready for final headcount',
              body: 'Once replies settle, your list is already structured for meals, seating, and vendor coordination.',
            },
          ].map((item) => (
            <Reveal key={item.title} direction="up" className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200">
                <item.icon className="text-[#1A1A1A]" size={20} />
              </div>
              <h2 className="mt-5 text-lg font-black tracking-tight text-[#1A1A1A]">{item.title}</h2>
              <p className="mt-3 text-[15px] font-medium leading-relaxed text-gray-600">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#F7F4EF] px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up" className="mb-12 text-center">
            <span className="text-[var(--accent)] text-xs font-bold uppercase tracking-widest">From invitation to final table</span>
            <h2 className="mt-4 text-[2.5rem] font-black uppercase tracking-tighter leading-[0.95] text-[#1A1A1A] sm:text-5xl md:text-6xl lg:text-[72px]">
              A workflow that
              <br />
              keeps moving.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-gray-600 sm:text-lg">
              Guests should feel welcomed, not chased. The product flow is designed to keep responses clear, follow-ups calm, and final numbers reliable.
            </p>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {FLOW_STEPS.map((item, index) => (
              <Reveal
                key={item.step}
                direction="up"
                delay={index * 0.06}
                className="rounded-[24px] bg-white p-6 shadow-sm sm:p-7"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">{item.step}</p>
                <h3 className="mt-4 text-xl font-black tracking-tight text-[#1A1A1A]">{item.title}</h3>
                <p className="mt-3 text-[15px] font-medium leading-relaxed text-gray-600">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="guest-dashboard" className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl items-start gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
          <Reveal direction="left">
            <span className="text-[var(--accent)] text-xs font-bold uppercase tracking-widest">Dashboard preview</span>
            <h2 className="mt-4 text-[2.3rem] font-black uppercase tracking-tighter leading-[0.96] text-[#1A1A1A] sm:text-5xl md:text-6xl">
              Know who is coming,
              <br />
              what they need,
              <br />
              and what comes next.
            </h2>
            <p className="mt-5 max-w-lg text-base font-medium leading-relaxed text-gray-600 sm:text-lg">
              One screen for guest status, reminders, meal notes, and the parts of the list that still need attention before your final count goes out to vendors.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: CheckCircle2,
                  title: 'See response status instantly',
                  body: 'Confirmed, pending, and declined guests stay visible without manual color-coding.',
                },
                {
                  icon: Plus,
                  title: 'Capture details beyond yes or no',
                  body: 'Track plus-ones, meal choices, and family groupings where they belong.',
                },
                {
                  icon: BellRing,
                  title: 'Follow up at the right moment',
                  body: 'Keep reminder timing practical so you are not doing emotional admin every night.',
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F4F1]">
                    <item.icon size={18} className="text-[#1A1A1A]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-[#1A1A1A]">{item.title}</h3>
                    <p className="mt-1.5 text-sm font-medium leading-relaxed text-gray-600">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal direction="right" delay={0.08}>
            <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_70px_rgba(0,0,0,0.08)] sm:rounded-[36px]">
              <div className="border-b border-gray-200 bg-[#FCFBF8] px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">RSVP board</p>
                    <p className="mt-1 text-lg font-black text-[#1A1A1A]">Saturday ceremony guest view</p>
                  </div>
                  <div className="rounded-full bg-[#1A1A1A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    Updated 2m ago
                  </div>
                </div>
              </div>

              <div className="grid gap-0 border-b border-gray-100 sm:grid-cols-3">
                {[
                  { label: 'Reminder queue', value: '11 guests', tone: 'text-[#8B63A3] bg-[#F9F5FB]' },
                  { label: 'Dietary notes', value: '14 flagged', tone: 'text-[#5E7AA1] bg-[#F4F7FB]' },
                  { label: 'Ready for seating', value: '96 confirmed', tone: 'text-[#2C7A58] bg-[#EEF8F2]' },
                ].map((item) => (
                  <div key={item.label} className="border-b border-gray-100 px-5 py-4 sm:border-b-0 sm:border-r last:sm:border-r-0">
                    <div className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${item.tone}`}>
                      {item.label}
                    </div>
                    <p className="mt-3 text-lg font-black text-[#1A1A1A]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-[24px] bg-[#F5F4F1] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Response breakdown</p>
                      <p className="mt-1 text-base font-black text-[#1A1A1A]">Invitation health</p>
                    </div>
                    <MessageCircle size={18} className="text-gray-400" />
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      { label: 'Confirmed', value: '68%', width: 'w-[68%]', chip: 'bg-[var(--accent)] text-[var(--on-accent)]' },
                      { label: 'Pending', value: '22%', width: 'w-[22%]', chip: 'bg-[#FFF2E6] text-[#C97921]' },
                      { label: 'Declined', value: '10%', width: 'w-[10%]', chip: 'bg-[#FDEBEC] text-[#C94B63]' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
                          <span>{item.label}</span>
                          <span>{item.value}</span>
                        </div>
                        <div className="h-3 rounded-full bg-white">
                          <div className={`h-3 rounded-full ${item.width} ${item.chip}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Needs attention</p>
                      <p className="mt-1 text-base font-black text-[#1A1A1A]">Before the deadline</p>
                    </div>
                    <Clock3 size={18} className="text-gray-400" />
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      { icon: BellRing, text: 'Send second reminder to 11 pending guests' },
                      { icon: Heart, text: 'Confirm 4 dietary restrictions with caterer' },
                      { icon: MapPin, text: 'Lock head table and family priority rows' },
                      { icon: XCircle, text: 'Remove 3 duplicate placeholder records' },
                    ].map((item) => (
                      <div key={item.text} className="flex items-start gap-3 rounded-[18px] bg-[#F8F7F4] px-4 py-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                          <item.icon size={15} className="text-[#1A1A1A]" />
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-gray-600">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#F7F4EF] px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up" className="mb-12 text-center">
            <span className="text-[var(--accent)] text-xs font-bold uppercase tracking-widest">What you can run from one place</span>
            <h2 className="mt-4 text-[2.4rem] font-black uppercase tracking-tighter leading-[0.95] text-[#1A1A1A] sm:text-5xl md:text-6xl lg:text-[72px]">
              The guest side
              <br />
              of wedding planning.
            </h2>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURE_CARDS.map((card, index) => (
              <Reveal
                key={card.title}
                direction="up"
                delay={index * 0.04}
                className="rounded-[24px] bg-white p-6 shadow-sm sm:p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200">
                  <card.icon className="text-[#1A1A1A]" size={20} />
                </div>
                <h3 className="mt-5 text-xl font-black tracking-tight text-[#1A1A1A]">{card.title}</h3>
                <p className="mt-3 text-[15px] font-medium leading-relaxed text-gray-600">{card.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-20 md:py-24">
        <Reveal className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-[#1A1A1A] px-6 py-14 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:rounded-[40px] sm:px-10 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Built to feel calm under pressure</span>
          <h2 className="mx-auto mt-5 max-w-4xl text-[2.4rem] font-black uppercase tracking-tighter leading-[0.96] sm:text-5xl md:text-6xl lg:text-[76px]">
            Less chasing.
            <br />
            More clarity.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-white/75 sm:text-lg">
            Start your guest page, collect responses, and keep your final numbers ready for vendors, seating, and the weekend itself.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-7 py-4 text-sm font-bold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
            >
              Start for free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/websites"
              className="rounded-full border border-white/20 px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-white hover:text-[#1A1A1A]"
            >
              Pair it with your website
            </Link>
          </div>
          <p className="mt-4 text-xs font-medium text-white/55">
            Free to start · Designed for real guest communication
          </p>
        </Reveal>
      </section>
    </main>
  )
}

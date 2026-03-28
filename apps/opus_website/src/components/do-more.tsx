'use client'

import { useState } from 'react'
import { motion } from 'motion/react'

const CARDS = [
  {
    id: 'sj',
    url: 'sarahandjames.opusfesta.com',
    initials: 'S & J',
    name: 'Sarah & James',
    date: 'December 14, 2025',
    location: 'The Waterfront · Dar es Salaam',
    venue: 'The Waterfront',
    venueCity: 'Dar es Salaam, Tanzania',
    navBg: '#FAF7F4',
    navBorder: '#EDE8E2',
    navText: '#3D3530',
    rsvpBg: '#3D3530',
    heroBg: '#F8F3EE',
    heroText: '#3D2B1F',
    heroSub: '#9C7E5E',
    botanical: true,
  },
  {
    id: 'fk',
    url: 'fatumaandkevin.opusfesta.com',
    initials: 'F & K',
    name: 'Fatuma & Kevin',
    date: 'March 2026',
    location: 'Mwanza, Tanzania',
    venue: 'Lake Victoria Resort',
    venueCity: 'Mwanza, Tanzania',
    navBg: '#EEF2ED',
    navBorder: '#C8D9C4',
    navText: '#2A3828',
    rsvpBg: '#2A3828',
    heroGradient: 'linear-gradient(135deg, #2A3828 0%, #4A6B45 60%, #B5C9B0 100%)',
    heroText: '#ffffff',
    heroSub: 'rgba(255,255,255,0.5)',
  },
  {
    id: 'ed',
    url: 'emmadavid.opusfesta.com',
    initials: 'E & D',
    name: 'Emma & David',
    date: 'August 2025',
    location: 'Arusha, Tanzania',
    venue: 'Mount Meru Hotel',
    venueCity: 'Arusha, Tanzania',
    navBg: '#1A1A1A',
    navBorder: '#333',
    navText: '#ffffff',
    rsvpBg: '#ffffff',
    rsvpText: '#1A1A1A',
    heroGradient: 'linear-gradient(135deg, #0D0D0D 0%, #2C2C2C 100%)',
    heroText: '#ffffff',
    heroSub: 'rgba(255,255,255,0.4)',
  },
]

const POSITIONS = [
  { top: 40, x: 0, scale: 1, opacity: 1, zIndex: 30, shadow: '0 20px 60px rgba(0,0,0,0.15)' },
  { top: 20, x: 0, scale: 0.97, opacity: 0.75, zIndex: 20, shadow: '0 8px 24px rgba(0,0,0,0.08)' },
  { top: 0,  x: 0, scale: 0.94, opacity: 0.45, zIndex: 10, shadow: '0 4px 12px rgba(0,0,0,0.05)' },
]

function CardContent({ card, isFront }: { card: typeof CARDS[0], isFront: boolean }) {
  return (
    <>
      {/* Browser chrome */}
      <div className="bg-[#E8E8E8] border-b border-gray-300 px-3 py-2 flex items-center gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
          <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
          <div className="w-2 h-2 rounded-full bg-[#28C840]" />
        </div>
        <div className={`${isFront ? 'w-36' : 'flex-1'} bg-white rounded-md px-2.5 py-1 flex items-center justify-between gap-1.5 border border-gray-300`}>
          <p className="text-[7px] text-gray-400 truncate">{card.url}</p>
          <span className="text-[7px] text-gray-300 shrink-0">✕</span>
        </div>
        {isFront && (
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            <span className="text-[9px] text-gray-400">⤴</span>
            <span className="text-[9px] text-gray-400">☆</span>
            <div className="w-4 h-4 rounded-full bg-[#1A1A1A] flex items-center justify-center">
              <span className="text-[6px] font-bold text-white">{card.name[0]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Site navbar */}
      <div
        className="px-3 py-2 flex items-center justify-between border-b"
        style={{ background: card.navBg, borderColor: card.navBorder }}
      >
        <p className="text-[8px] font-black tracking-widest" style={{ color: card.navText }}>{card.initials}</p>
        <div className="flex items-center gap-2">
          {['Story', 'Details', 'Gallery'].map((item) => (
            <p key={item} className="text-[6px] font-semibold uppercase" style={{ color: card.navText + '66' }}>{item}</p>
          ))}
          <span
            className="text-[6px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: card.rsvpBg, color: card.rsvpText ?? '#ffffff' }}
          >
            RSVP
          </span>
        </div>
      </div>

      {/* Hero */}
      <div
        className="relative flex flex-col items-center justify-center py-10 gap-2.5 overflow-hidden"
        style={{ background: card.heroBg ?? card.heroGradient }}
      >
        {card.botanical && (
          <>
            <div className="absolute -top-3 -left-3 w-16 h-16 opacity-20" style={{ background: 'radial-gradient(ellipse at 30% 30%, #7BA05B, transparent)', borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%' }} />
            <div className="absolute -bottom-2 -right-2 w-14 h-14 opacity-15" style={{ background: 'radial-gradient(ellipse at 70% 70%, #7BA05B, transparent)', borderRadius: '40% 60% 30% 70% / 60% 40% 50% 50%' }} />
          </>
        )}
        <p className="text-[6px] uppercase tracking-[0.25em] z-10" style={{ color: card.heroSub }}>We&apos;re getting married</p>
        <p className="text-[16px] font-semibold z-10 leading-tight" style={{ fontFamily: 'Georgia, serif', color: card.heroText }}>{card.name}</p>
        <div className="flex items-center gap-2 z-10">
          <div className="w-6 h-px" style={{ background: card.heroSub }} />
          <span className="text-[5px]" style={{ color: card.heroSub }}>✦</span>
          <div className="w-6 h-px" style={{ background: card.heroSub }} />
        </div>
        <p className="text-[6px] uppercase tracking-widest z-10" style={{ color: card.heroSub }}>{card.date}</p>
        <p className="text-[5.5px] z-10" style={{ color: card.heroSub }}>{card.location}</p>
        <button
          className="mt-1 text-[6px] font-semibold px-4 py-1.5 rounded-full tracking-widest uppercase z-10 border"
          style={{ borderColor: card.heroText + '30', color: card.heroText }}
        >
          RSVP
        </button>
      </div>

      {isFront && (
        <>
          {/* Countdown strip */}
          <div className="bg-[#FAF7F4] border-b border-[#EDE8E2] px-4 py-2 flex items-center justify-between">
            <p className="text-[7px] text-[#3D3530]/40 uppercase tracking-widest">Days to go</p>
            <div className="flex gap-3">
              {[{ v: '142', l: 'Days' }, { v: '06', l: 'Hrs' }, { v: '24', l: 'Min' }].map((t) => (
                <div key={t.l} className="text-center">
                  <p className="text-[10px] font-black text-[#3D3530]">{t.v}</p>
                  <p className="text-[6px] text-[#3D3530]/40 uppercase tracking-wide">{t.l}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Venue + gallery row */}
          <div className="bg-white px-4 py-3 flex items-center gap-2">
            <div className="flex-1">
              <p className="text-[7px] font-black text-[#1A1A1A] uppercase tracking-widest mb-1">Venue</p>
              <p className="text-[8px] font-bold text-[#1A1A1A]">{card.venue}</p>
              <p className="text-[7px] text-gray-400">{card.venueCity}</p>
            </div>
            <div className="flex gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=80&q=80" alt="gallery" className="w-9 h-9 rounded-lg object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=80&q=80" alt="gallery" className="w-9 h-9 rounded-lg object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=80&q=80" alt="gallery" className="w-9 h-9 rounded-lg object-cover" />
            </div>
          </div>
        </>
      )}
    </>
  )
}

function WebsiteCardStack() {
  const [active, setActive] = useState(0)

  const cycle = () => setActive((a) => (a + 1) % CARDS.length)

  return (
    <div className="relative mb-8 w-72 h-[380px]">
      {CARDS.map((card, i) => {
        const pos = (i - active + CARDS.length) % CARDS.length
        const { top, scale, opacity, zIndex, shadow } = POSITIONS[pos]
        const isFront = pos === 0

        return (
          <motion.div
            key={card.id}
            className="absolute left-0 right-0 rounded-3xl overflow-hidden cursor-pointer select-none"
            style={{ boxShadow: shadow }}
            animate={{ top, scale, opacity, zIndex }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            drag={isFront ? 'x' : false}
            dragConstraints={{ left: -60, right: 60 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 50) cycle()
            }}
            onClick={!isFront ? cycle : undefined}
          >
            <CardContent card={card} isFront={isFront} />
          </motion.div>
        )
      })}

      {/* Dot indicators */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all ${i === active ? 'w-4 h-1.5 bg-[#1A1A1A]' : 'w-1.5 h-1.5 bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  )
}

const STATUSES = ['Confirmed', 'Pending', 'Declined'] as const
type Status = typeof STATUSES[number]

const ALL_GUESTS = [
  { name: 'Sarah Mwangi',      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', status: 'Confirmed' as Status },
  { name: 'Omar Al-Rashid',    image: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?auto=format&fit=crop&w=200&q=80', status: 'Confirmed' as Status },
  { name: 'Fatuma Hassan',     image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80', status: 'Pending' as Status },
  { name: 'Daniel Nkrumah',    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', status: 'Declined' as Status },
  { name: 'Aisha Kamau',       image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80', status: 'Pending' as Status },
  { name: 'Lucia Ferreira',    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80', status: 'Confirmed' as Status },
  { name: 'Michael Osei',      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', status: 'Confirmed' as Status },
  { name: 'Grace Otieno',      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80', status: 'Confirmed' as Status },
  { name: 'James Kariuki',     image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', status: 'Pending' as Status },
  { name: 'Amina Yusuf',       image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', status: 'Confirmed' as Status },
  { name: 'Peter Mensah',      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', status: 'Declined' as Status },
  { name: 'Ngozi Adeyemi',     image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80', status: 'Declined' as Status },
  { name: 'Kofi Asante',       image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=200&q=80', status: 'Declined' as Status },
  { name: 'Zara Mohammed',     image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80', status: 'Declined' as Status },
  { name: 'David Kimani',      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80', status: 'Pending' as Status },
]

function GuestListCard() {
  const [guests, setGuests] = useState(ALL_GUESTS)
  const [filter, setFilter] = useState<Status | 'All'>('All')

  const confirmedCount = guests.filter(g => g.status === 'Confirmed').length
  const pendingCount   = guests.filter(g => g.status === 'Pending').length
  const declinedCount  = guests.filter(g => g.status === 'Declined').length

  // Stats reflect full 100-guest list; visible list is a preview
  const TOTAL = 100
  const CONFIRMED_TOTAL = 70 + (confirmedCount - ALL_GUESTS.filter(g => g.status === 'Confirmed').length)
  const PENDING_TOTAL   = 25 + (pendingCount   - ALL_GUESTS.filter(g => g.status === 'Pending').length)
  const DECLINED_TOTAL  = declinedCount

  const cycleStatus = (name: string) => {
    setGuests(prev => prev.map(g => {
      if (g.name !== name) return g
      const next: Status = g.status === 'Confirmed' ? 'Pending' : g.status === 'Pending' ? 'Declined' : 'Confirmed'
      return { ...g, status: next }
    }))
  }

  const filtered = filter === 'All' ? guests : guests.filter(g => g.status === filter)
  // Show all when filtered, preview of 6 for All
  const visible = filtered.slice(0, 5)
  const hiddenCount = filtered.length - visible.length

  const statCards = [
    { label: 'Invited',   value: TOTAL,           filter: 'All' as const },
    { label: 'Confirmed', value: CONFIRMED_TOTAL, filter: 'Confirmed' as const },
    { label: 'Pending',   value: PENDING_TOTAL,   filter: 'Pending' as const },
    { label: 'Declined',  value: DECLINED_TOTAL,  filter: 'Declined' as const },
  ]

  return (
    <div className="bg-[#F2F2F0] rounded-[40px] p-6 md:p-10 flex flex-col text-left shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-2xl font-black text-[#1A1A1A]">Manage your guest list</h3>
        <span className="shrink-0 bg-[var(--accent)] text-[var(--on-accent)] text-[10px] font-bold px-3 py-1.5 rounded-full ml-4 mt-1">
          {CONFIRMED_TOTAL} / {TOTAL} RSVPs
        </span>
      </div>
      <p className="text-gray-500 font-medium mb-6">
        Invite guests, track RSVPs, send reminders, and manage plus-ones — all in one place.
      </p>

      {/* Stat cards — click to filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
        {statCards.map((s) => {
          const isActive = filter === s.filter
          return (
            <button
              key={s.label}
              onClick={() => setFilter(s.filter)}
              className={`rounded-2xl p-3 text-center shadow-sm transition-all ${isActive ? 'bg-[#1A1A1A]' : 'bg-white hover:bg-gray-50'}`}
            >
              <p className={`text-xl font-black ${isActive ? 'text-white' : 'text-[#1A1A1A]'}`}>{s.value}</p>
              <p className={`text-[9px] mt-1 uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-gray-400'}`}>{s.label}</p>
            </button>
          )
        })}
      </div>

      {/* Guest rows — click to cycle status */}
      <div className="space-y-2 mb-6">
        {visible.map((g) => (
          <motion.div
            key={g.name}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => cycleStatus(g.name)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.image} alt={g.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1A1A1A] truncate">{g.name}</p>
              <p className="text-[9px] text-gray-400">Click to update status</p>
            </div>
            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 transition-colors ${
              g.status === 'Confirmed' ? 'bg-[var(--accent)] text-[var(--on-accent)]' :
              g.status === 'Declined'  ? 'bg-red-100 text-red-500' :
              'bg-orange-100 text-orange-500'
            }`}>
              {g.status}
            </span>
          </motion.div>
        ))}
        {visible.length === 0 && (
          <div className="flex items-center justify-center h-16 text-gray-400 text-sm font-medium">
            No {filter.toLowerCase()} guests
          </div>
        )}
        {(() => {
          const totalForFilter = filter === 'All' ? TOTAL : filter === 'Confirmed' ? CONFIRMED_TOTAL : filter === 'Pending' ? PENDING_TOTAL : DECLINED_TOTAL
          const more = totalForFilter - 5
          return more > 0 ? (
            <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-center shadow-sm">
              <p className="text-xs font-bold text-gray-400">+ {more} more guests</p>
            </div>
          ) : null
        })()}
      </div>

      <button className="bg-[#1A1A1A] hover:bg-[#333] text-white px-6 py-3 rounded-full font-bold transition-colors mt-auto w-max self-center">
        Manage guests
      </button>
    </div>
  )
}

export default function DoMore() {
  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
<h2 className="text-4xl md:text-6xl lg:text-[72px] font-black tracking-tighter uppercase leading-[0.85] text-[#1A1A1A]">
            MORE THAN
            <br />
            JUST FINDING
            <br />
            VENDORS
          </h2>
        </div>
        <div className="shrink-0 flex flex-col items-start md:items-end gap-4">
          <p className="text-gray-500 font-medium max-w-xs md:text-right leading-relaxed">
            Less spreadsheets, less stress. Build your website, track RSVPs, and keep every detail in check — all in one place.
          </p>
          <button className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-8 py-4 rounded-full font-bold transition-colors">
            Get started free
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        <div className="bg-[#FFFFFF] border border-gray-100 rounded-[40px] p-6 md:p-10 flex flex-col items-center text-center shadow-sm">
          <h3 className="text-2xl font-black mb-4">Build your free website</h3>
          <p className="text-gray-600 mb-8 font-medium">
            Get a stunning, personalised wedding website live in minutes — share your story, collect RSVPs, and keep guests in the loop.
          </p>
          <WebsiteCardStack />
          <button className="border-2 border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white px-6 py-3 rounded-full font-bold transition-colors mt-10">
            Explore all templates
          </button>
        </div>

        <GuestListCard />
      </div>
    </section>
  )
}

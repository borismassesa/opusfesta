'use client'

import { useState, useEffect } from 'react'
import { Star, TrendingUp, MessageCircle, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const VENDORS = [
  {
    name: 'Osei Photography',
    category: 'Photography',
    location: 'Zanzibar',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
    stars: 4.9, reviews: 84, response: '98%',
    bookings: 38, enquiries: 124, views: '2.4k',
    upcoming: [
      { name: 'Sarah & James', date: 'Dec 14, 2025', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
      { name: 'Omar & Priya', date: 'Jan 8, 2026', image: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?auto=format&fit=crop&w=200&q=80' },
    ],
  },
  {
    name: 'Bloom & Petal Florists',
    category: 'Florals & Decor',
    location: 'Nairobi',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
    stars: 4.8, reviews: 61, response: '95%',
    bookings: 52, enquiries: 198, views: '3.1k',
    upcoming: [
      { name: 'Fatuma & Kevin', date: 'Mar 2, 2026', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80' },
      { name: 'Emma & David', date: 'Mar 18, 2026', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80' },
    ],
  },
  {
    name: 'Golden Hour Venues',
    category: 'Venue',
    location: 'Moshi',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80',
    stars: 4.7, reviews: 112, response: '92%',
    bookings: 24, enquiries: 310, views: '5.8k',
    upcoming: [
      { name: 'Daniel & Grace', date: 'Feb 21, 2026', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
      { name: 'Aisha & Tom', date: 'Apr 5, 2026', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80' },
    ],
  },
  {
    name: 'Spice Route Catering',
    category: 'Catering',
    location: 'Dar es Salaam',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80',
    stars: 4.9, reviews: 73, response: '99%',
    bookings: 67, enquiries: 241, views: '4.2k',
    upcoming: [
      { name: 'Lucia & Marco', date: 'Jan 25, 2026', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80' },
      { name: 'James & Ngozi', date: 'Feb 14, 2026', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80' },
    ],
  },
  {
    name: 'Elegant Strings Band',
    category: 'Music & Entertainment',
    location: 'Arusha',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    stars: 4.8, reviews: 49, response: '96%',
    bookings: 31, enquiries: 87, views: '1.9k',
    upcoming: [
      { name: 'Grace & Michael', date: 'Dec 28, 2025', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80' },
      { name: 'Kofi & Amina', date: 'Jan 15, 2026', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
    ],
  },
]

export default function Business() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % VENDORS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const v = VENDORS[index]

  return (
    <section className="px-4 md:px-10 max-w-6xl mx-auto mb-24">
      <div className="bg-[#1A1A1A] rounded-[40px] overflow-hidden">
        <div className="flex flex-col md:flex-row">

          {/* Left — text */}
          <div className="flex-1 py-10 px-6 md:py-20 md:px-14 flex flex-col justify-between">
            <div>
              <span className="text-[var(--accent)] text-xs font-bold uppercase tracking-widest">For vendors</span>
              <h2 className="text-4xl md:text-5xl lg:text-[64px] font-black tracking-tighter uppercase leading-[0.88] mt-4 mb-6 text-white">
                YOUR NEXT
                <br />
                CLIENT IS
                <br />
                <span className="text-[var(--accent)]">SEARCHING.</span>
              </h2>
              <p className="text-gray-400 font-medium leading-relaxed max-w-sm mb-10">
                Connect with couples actively planning their wedding. Manage bookings, communicate with clients, and grow your business — all in one place.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-10">
                {['Get discovered', 'Manage bookings', 'Get paid on time', 'Build your reputation', 'Showcase your portfolio'].map((f) => (
                  <span key={f} className="bg-white/8 text-white/70 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10">{f}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--on-accent)] px-7 py-3.5 rounded-full font-bold transition-colors">
                Join as a vendor
              </button>
              <button className="text-white border border-white/20 hover:bg-white/8 px-7 py-3.5 rounded-full font-bold transition-colors">
                See success stories
              </button>
            </div>
          </div>

          {/* Right — rotating vendor card */}
          <div className="md:w-[480px] bg-[#111] flex items-center justify-center px-14 py-10">
            <div className="w-full max-w-[300px] flex flex-col gap-3">

              <AnimatePresence mode="wait">
                <motion.div
                  key={v.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="flex flex-col gap-3"
                >
                  {/* Profile card */}
                  <div className="bg-[#1E1E1E] rounded-3xl border border-white/8 relative" style={{ overflow: 'visible' }}>
                    {/* Cover */}
                    <div className="relative h-32 rounded-t-3xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.cover} alt="cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className="bg-[var(--accent)] text-[var(--on-accent)] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">Verified</span>
                      </div>
                    </div>
                    {/* Avatar — outside cover to avoid clipping */}
                    <div className="absolute top-[100px] left-5 z-10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.avatar} alt={v.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-[#1E1E1E]" />
                    </div>

                    {/* Info */}
                    <div className="px-5 pt-9 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-black text-white leading-tight">{v.name}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">{v.location}</p>
                        </div>
                        <span className="shrink-0 text-[9px] font-bold text-white/40 bg-white/8 border border-white/10 px-2 py-1 rounded-full">{v.category}</span>
                      </div>
                    </div>

                    {/* Stars + response rate */}
                    <div className="px-5 pb-4 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={10} fill="#F5A623" className="text-[#F5A623]" />
                        ))}
                        <span className="text-[10px] text-white/40 ml-1">{v.stars} · {v.reviews} reviews</span>
                      </div>
                      <span className="text-[9px] text-white/40 font-medium">{v.response} response</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: <TrendingUp size={12} />, value: v.bookings, label: 'Bookings' },
                      { icon: <MessageCircle size={12} />, value: v.enquiries, label: 'Enquiries' },
                      { icon: <Eye size={12} />, value: v.views, label: 'Profile Views' },
                    ].map((s) => (
                      <div key={s.label} className="bg-[#1E1E1E] rounded-2xl px-3 py-3 text-center border border-white/8">
                        <div className="text-white/60 flex justify-center mb-1.5">{s.icon}</div>
                        <p className="text-sm font-black text-white">{s.value}</p>
                        <p className="text-[8px] text-white/30 uppercase tracking-wide mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Upcoming bookings */}
                  <div className="bg-[#1E1E1E] rounded-2xl overflow-hidden border border-white/8">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Upcoming</p>
                      <span className="text-[9px] text-white font-bold">{v.bookings} bookings</span>
                    </div>
                    {v.upcoming.map((b) => (
                      <div key={b.name} className="px-4 py-2.5 flex items-center gap-3 border-b border-white/5 last:border-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.image} alt={b.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-white truncate">{b.name}</p>
                          <p className="text-[9px] text-white/30">{b.date}</p>
                        </div>
                        <span className="text-[8px] font-bold bg-[var(--accent)] text-[var(--on-accent)] px-2 py-0.5 rounded-full shrink-0">Booked</span>
                      </div>
                    ))}
                  </div>

                </motion.div>
              </AnimatePresence>

              {/* Dot indicators */}
              <div className="flex justify-center gap-1.5 mt-1">
                {VENDORS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`rounded-full transition-all ${i === index ? 'w-4 h-1.5 bg-[var(--accent)]' : 'w-1.5 h-1.5 bg-white/20'}`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

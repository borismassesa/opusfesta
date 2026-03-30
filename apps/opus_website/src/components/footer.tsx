'use client'

import { useState, useRef } from 'react'
import { MapPin, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'
import { motion, useScroll, useTransform } from 'motion/react'
import Reveal from '@/components/ui/Reveal'

const CATEGORIES = ['Venues', 'Photographers', 'Videographers', 'Caterers', 'DJs & Bands', 'Florists', 'Wedding Planners', 'Hair & Makeup', 'Wedding Cakes', 'Bridal Salons', 'Photo Booths', 'Rentals', 'Transportation', 'Jewellers', 'MC & Officiants']

const cities = [
  'Dar es Salaam',
  'Zanzibar',
  'Arusha',
  'Moshi',
  'Mwanza',
  'Dodoma',
  'Tanga',
  'Morogoro',
]

export default function Footer() {
  const [activeCategory, setActiveCategory] = useState('Venues')
  const watermarkRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: watermarkRef, offset: ['start end', 'end start'] })
  // Parallax: moves up to 60px max — bounded within footer
  const y = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <footer className="bg-[#FFFFFF] pt-24 pb-12 px-6 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">

        {/* Vendor city finder */}
        <Reveal direction="up" margin="-40px">
          <h2 className="text-3xl font-black tracking-tighter mb-8 text-[#1A1A1A]">Find vendors across Tanzania</h2>

          <div className="flex gap-3 mb-10 overflow-x-auto pb-2 hide-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A] border border-gray-200 hover:bg-gray-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 mb-20">
            {cities.map((city) => (
              <a key={city} href="#" className="flex items-center gap-3 hover:underline text-sm font-medium text-gray-600">
                <MapPin size={16} className="text-[var(--accent)]" />
                {activeCategory} in {city}
              </a>
            ))}
          </div>
        </Reveal>

        {/* Links grid */}
        <Reveal direction="none" margin="-40px" className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 text-sm">
          <div>
            <h4 className="font-bold mb-4 text-[#1A1A1A]">Planning Tools</h4>
            <ul className="space-y-3 text-gray-500">
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Wedding Website</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Registry</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Guest List</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Checklist</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Budget Planner</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Vendor Manager</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#1A1A1A]">Find Vendors</h4>
            <ul className="space-y-3 text-gray-500">
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Venues</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Photographers</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Videographers</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">DJs & Bands</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Florists</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Caterers</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Wedding Planners</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Hair & Makeup</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Bridal Salons</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Wedding Cakes</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Transportation</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Photo Booths</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Jewellers</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">MC & Officiants</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#1A1A1A]">Ideas & Advice</h4>
            <ul className="space-y-3 text-gray-500">
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Real Weddings</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Dresses & Attire</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Engagement Rings</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Honeymoon Ideas</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Etiquette & Advice</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Bridal Showers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#1A1A1A]">Company</h4>
            <ul className="space-y-3 text-gray-500">
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">For Vendors</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] transition-colors">Vendor Dashboard</a></li>
            </ul>
          </div>
        </Reveal>

        {/* Watermark — parallax bounded within footer, ±30px */}
        <div ref={watermarkRef} className="mb-8 py-8 -mx-6 overflow-hidden flex justify-center">
          <motion.p
            style={{ y }}
            className="text-[15vw] sm:text-[19vw] font-black tracking-tighter uppercase leading-none text-gray-100 whitespace-nowrap select-none"
          >
            OpusFesta
          </motion.p>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-0 mt-8 pt-8 border-t border-gray-100 text-xs text-gray-400">
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#1A1A1A] transition-colors">Accessibility</a>
          </div>
          <span>© 2026 OpusFesta. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-[#1A1A1A] transition-colors"><Facebook size={16} /></a>
            <a href="#" className="text-gray-400 hover:text-[#1A1A1A] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#1A1A1A] transition-colors"><Instagram size={16} /></a>
            <a href="#" className="text-gray-400 hover:text-[#1A1A1A] transition-colors"><Youtube size={16} /></a>
            <a href="#" className="text-gray-400 hover:text-[#1A1A1A] transition-colors"><Linkedin size={16} /></a>
          </div>
        </div>

      </div>
    </footer>
  )
}

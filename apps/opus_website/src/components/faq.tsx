'use client'

import { useState } from 'react'
import Reveal from '@/components/ui/Reveal'

const FAQS = [
  {
    q: 'Is OpusFesta free to use?',
    a: 'Yes — completely free to start. Create your wedding website, manage your guest list, and browse vendors at no cost. No credit card required.',
  },
  {
    q: 'How do I find vendors in my city?',
    a: 'Search by category and location. We have verified vendors across Tanzania — Dar es Salaam, Zanzibar, Arusha, Moshi, Mwanza, and Dodoma. Every vendor is reviewed before appearing in results.',
  },
  {
    q: 'Can I message vendors directly?',
    a: 'Yes. Send enquiries, discuss packages, and confirm bookings all within OpusFesta — no hunting for WhatsApp numbers or email addresses.',
  },
  {
    q: 'How does the wedding website work?',
    a: 'Get a personalised wedding website in minutes. Share your story, collect RSVPs, and keep guests updated with a custom link like sarahandjames.opusfesta.com.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. Your personal information and guest data are encrypted and never shared with third parties. You control what you share and with whom.',
  },
  {
    q: 'Can vendors join OpusFesta?',
    a: 'Absolutely. Create a vendor profile, showcase your portfolio, manage bookings, and get discovered by couples actively planning. Join and grow your business.',
  },
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-16">

        {/* Left — sticky */}
        <Reveal direction="up" margin="-80px" className="md:w-72 shrink-0">
          <div className="md:sticky md:top-24">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.85] text-[#1A1A1A]">
              EVERY
              <br />
              ANSWER
              <br />
              YOU NEED.
            </h2>
            <div className="w-10 h-1 bg-[var(--accent)] rounded-full mt-6 mb-5" />
            <p className="text-gray-400 font-medium text-sm leading-relaxed">
              Can't find what you're looking for? Our team is happy to help.
            </p>
            <button className="mt-6 hidden md:inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#333] text-white text-sm font-bold px-5 py-3 rounded-full transition-colors">
              Talk to us
              <span className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--on-accent)] text-xs leading-none">→</span>
            </button>
          </div>
        </Reveal>

        {/* Right — questions: fade only, no rise — accordion does the motion work */}
        <Reveal direction="none" margin="-80px" delay={0.1} className="flex-1 divide-y divide-gray-100">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-start justify-between py-6 text-left gap-6 group"
              >
                <span className={`font-bold text-base md:text-lg transition-colors ${open === i ? 'text-[#1A1A1A]' : 'text-gray-500 group-hover:text-[#1A1A1A]'}`}>
                  {faq.q}
                </span>
                <span className={`shrink-0 text-2xl font-black leading-none transition-all mt-0.5 ${open === i ? 'text-[var(--accent)] rotate-45' : 'text-gray-300 group-hover:text-[#1A1A1A]'}`}>
                  +
                </span>
              </button>
              {open === i && (
                <p className="pb-6 text-gray-500 font-medium leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </Reveal>

      </div>
    </section>
  )
}

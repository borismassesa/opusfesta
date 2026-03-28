'use client'

import { useState } from 'react'
import Reveal from '@/components/ui/Reveal'

const FAQS = [
  {
    q: 'Is OpusFesta free to use?',
    a: 'Yes, completely free to start. Create your wedding website, manage your guest list, and browse vendors at no cost. No credit card required.',
  },
  {
    q: 'How do I find vendors in my city?',
    a: 'Search by category and location. We have verified vendors across Tanzania: Dar es Salaam, Zanzibar, Arusha, Moshi, Mwanza, and Dodoma. Every vendor is reviewed before appearing in results.',
  },
  {
    q: 'Can I message vendors directly?',
    a: 'Yes. Send enquiries, discuss packages, and confirm bookings all within OpusFesta. No hunting for WhatsApp numbers or email addresses.',
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
    <section className="px-4 sm:px-6 py-14 sm:py-20 md:py-24 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-10 sm:gap-14 md:gap-16">

        {/* Left */}
        <Reveal direction="up" margin="-80px" className="md:w-72 shrink-0 text-center md:text-left">
          <div className="md:sticky md:top-24">
            <span className="text-[var(--accent)] text-xs font-bold uppercase tracking-widest">Support</span>
            <h2 className="text-[2.4rem] sm:text-5xl font-black tracking-tighter uppercase leading-[1.0] sm:leading-[0.88] mt-3 mb-5 text-[#1A1A1A]">
              Every
              <br />
              answer
              <br />
              you need.
            </h2>
            <div className="w-10 h-1 bg-[var(--accent)] rounded-full mb-4 mx-auto md:mx-0" />
            <p className="text-gray-400 font-medium text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              Can&apos;t find what you&apos;re looking for? Our team is happy to help.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#333] text-white text-sm font-bold px-5 py-3 rounded-full transition-colors">
              Talk to us
              <span className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--on-accent)] text-xs leading-none">→</span>
            </button>
          </div>
        </Reveal>

        {/* Right — accordion */}
        <Reveal direction="none" margin="-80px" delay={0.1} className="flex-1 flex flex-col gap-2 sm:gap-0 sm:divide-y sm:divide-gray-100">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl sm:rounded-none transition-colors ${
                open === i
                  ? 'bg-gray-50 sm:bg-transparent'
                  : 'bg-gray-50 sm:bg-transparent hover:bg-gray-50 sm:hover:bg-transparent'
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-4 sm:px-0 py-4 sm:py-6 text-left gap-4 sm:gap-6 group"
              >
                <span className={`font-bold text-sm sm:text-base md:text-lg transition-colors leading-snug ${open === i ? 'text-[#1A1A1A]' : 'text-gray-600 group-hover:text-[#1A1A1A]'}`}>
                  {faq.q}
                </span>
                <span className={`shrink-0 w-7 h-7 sm:w-auto sm:h-auto rounded-full sm:rounded-none flex items-center justify-center text-xl sm:text-2xl font-black leading-none transition-all ${
                  open === i
                    ? 'bg-[var(--accent)] text-[var(--on-accent)] sm:bg-transparent sm:text-[var(--accent)] rotate-45'
                    : 'bg-white sm:bg-transparent text-gray-400 group-hover:text-[#1A1A1A]'
                }`}>
                  +
                </span>
              </button>
              {open === i && (
                <p className="px-4 sm:px-0 pb-4 sm:pb-6 text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
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

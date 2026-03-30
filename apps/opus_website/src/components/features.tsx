'use client'

import Reveal from '@/components/ui/Reveal'

export default function Features() {
  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 max-w-6xl mx-auto">

      {/* Section header */}
      <Reveal direction="up" className="hidden sm:block text-center mb-14 sm:mb-20 md:mb-24">
        <span className="text-(--accent) text-xs font-bold uppercase tracking-widest">Built for every part</span>
        <h2 className="text-[2.8rem] sm:text-6xl md:text-7xl lg:text-[96px] font-black tracking-tighter uppercase leading-[0.95] sm:leading-[0.88] md:leading-[0.85] mt-4 text-[#1A1A1A]">
          Beyond
          <br />
          the basics
        </h2>
        <p className="text-sm sm:text-base text-gray-500 mt-5 sm:mt-6 max-w-xs sm:max-w-sm mx-auto font-medium leading-relaxed">
          Every tool you need to plan, style, and celebrate. All in one place.
        </p>
      </Reveal>

      <div className="space-y-20 sm:space-y-28 md:space-y-32">

        {/* Attire & Rings */}
        <div className="flex flex-col md:flex-row items-center gap-10 sm:gap-14 md:gap-16">
          <Reveal direction="left" className="order-2 md:order-none flex-1 w-full grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 h-[260px] sm:h-[340px] md:h-[440px]">
            <div className="row-span-2 rounded-xl sm:rounded-2xl overflow-hidden">
              <video
                src="/assets/videos/couple_.mp4"
                autoPlay
                muted
                loop
                playsInline
                aria-hidden="true"
                className="w-full h-full object-cover object-top scale-105"
              />
            </div>
            <div className="rounded-xl sm:rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/images/couples_together.jpg" alt="Wedding couple" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-xl sm:rounded-2xl overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/images/bridering.jpg" alt="Engagement ring" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <p className="text-white/50 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Rings & Jewellery</p>
                <p className="text-white text-xs sm:text-sm font-black leading-tight">The ring that<br />ties it all.</p>
              </div>
            </div>
          </Reveal>
          <Reveal direction="right" className="order-1 md:order-none flex-1 text-center md:text-left" delay={0.1}>
            <h2 className="text-[2.2rem] sm:text-4xl md:text-6xl lg:text-[72px] font-black tracking-tighter uppercase leading-none sm:leading-[0.92] md:leading-[0.88] mb-5 sm:mb-6 text-[#1A1A1A]">
              Dress for
              <br />
              your moment.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
              Find wedding dresses, groom suits, bridesmaid styles, and engagement rings from verified local boutiques, curated to match your vision.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mb-6 sm:mb-8">
              {['Wedding dresses', 'Suits & tuxedos', 'Bridesmaid styles', 'Engagement rings'].map((f) => (
                <span key={f} className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">{f}</span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <button className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-6 py-3 rounded-full font-bold transition-colors text-sm sm:text-base">
                Explore Attire
              </button>
              <button className="text-[#1A1A1A] px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors underline text-sm sm:text-base">
                Browse rings
              </button>
            </div>
          </Reveal>
        </div>

        {/* Ideas & Advice */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-10 sm:gap-14 md:gap-16">
          <Reveal direction="right" className="order-2 md:order-none flex-1 w-full h-[260px] sm:h-[340px] md:h-[440px]">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 h-full" style={{ gridTemplateRows: '1.6fr 1fr' }}>
              <div className="col-span-2 rounded-xl sm:rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/images/coupleswithpiano.jpg" alt="Wedding inspiration" className="w-full h-full object-cover scale-105" />
              </div>
              <div className="rounded-xl sm:rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/images/cutesy_couple.jpg" alt="Wedding theme" className="w-full h-full object-cover object-bottom" />
              </div>
              <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-white relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/images/hand_rings.jpg" alt="Wedding details" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <p className="text-white/50 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Inspiration</p>
                  <p className="text-white text-xs sm:text-sm font-black leading-tight">Dream it.<br />Plan it. Live it.</p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal direction="left" className="order-1 md:order-none flex-1 text-center md:text-left" delay={0.1}>
            <h2 className="text-[2.2rem] sm:text-4xl md:text-6xl lg:text-[72px] font-black tracking-tighter uppercase leading-none sm:leading-[0.92] md:leading-[0.88] mb-5 sm:mb-6 text-[#1A1A1A]">
              Get inspired.
              <br />
              Plan better.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
              Browse thousands of real wedding stories, explore trending themes, and get expert advice matched to your style, budget, and location.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mb-6 sm:mb-8">
              {['Real weddings', 'Themes & styles', 'Expert articles', 'Budget breakdowns'].map((f) => (
                <span key={f} className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">{f}</span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <button className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-6 py-3 rounded-full font-bold transition-colors text-sm sm:text-base">
                Browse Ideas
              </button>
              <button className="text-[#1A1A1A] px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors underline text-sm sm:text-base">
                Read advice
              </button>
            </div>
          </Reveal>
        </div>

        {/* Registry */}
        <div className="flex flex-col md:flex-row items-center gap-10 sm:gap-14 md:gap-16">
          <Reveal direction="left" className="order-2 md:order-none flex-1 w-full h-[260px] sm:h-[340px] md:h-[440px]">
            <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 h-full">
              <div className="rounded-xl sm:rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/images/flowers_pinky.jpg" alt="Wedding flowers" className="w-full h-full object-cover" />
              </div>
              <div className="row-span-2 rounded-xl sm:rounded-2xl overflow-hidden">
                <video
                  src="/assets/videos/happy_couples.mov"
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-hidden="true"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="rounded-xl sm:rounded-2xl overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80"
                  alt="Gift registry"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <p className="text-white/50 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Registry</p>
                  <p className="text-white text-xs sm:text-sm font-black leading-tight">Every wish.<br />One link.</p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal direction="right" className="order-1 md:order-none flex-1 text-center md:text-left" delay={0.1}>
            <h2 className="text-[2.2rem] sm:text-4xl md:text-5xl lg:text-[52px] font-black tracking-tighter uppercase leading-none sm:leading-[0.92] md:leading-[0.88] mb-5 sm:mb-6 text-[#1A1A1A]">
              Your registry.
              <br />
              Any store.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
              Add gifts from any store worldwide, create a honeymoon cash fund, and track every thank-you note. All without the spreadsheet.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mb-6 sm:mb-8">
              {['Any store', 'Cash funds', 'Thank-you tracker', 'Group gifting'].map((f) => (
                <span key={f} className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">{f}</span>
              ))}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <button className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-6 py-3 rounded-full font-bold transition-colors text-sm sm:text-base">
                Start Registry
              </button>
              <button className="text-[#1A1A1A] px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors underline text-sm sm:text-base">
                See examples
              </button>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  )
}

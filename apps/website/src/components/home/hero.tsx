'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { HERO_SLIDES, HERO_TABS, POPULAR_TAGS } from '../../app/home-data';

const Hero = () => {
  const [activeTab, setActiveTab] = useState('venues');
  const [searchText, setSearchText] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-10 px-6 py-8 md:py-12 lg:grid-cols-2 lg:gap-16 lg:py-14">
      <div className="flex animate-fade-in flex-col items-center space-y-8 text-center lg:items-start lg:text-left">
        <h1 className="text-[40px] font-bold leading-[1.05] tracking-tight text-gray-900 dark:text-white md:text-[52px] lg:text-[56px]">
          Everything You Need to <br /> Plan Your Wedding
        </h1>
        <p className="max-w-lg text-lg leading-relaxed text-gray-500 dark:text-slate-300 md:text-xl">
          Search over 250,000 local professionals, find the perfect venue, and create your wedding website—all in one place.
        </p>

        <div className="flex w-full max-w-xl flex-col gap-6">
          <div className="inline-flex self-center rounded-full bg-gray-100/80 p-1.5 dark:bg-slate-900 lg:self-start">
            {HERO_TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-slate-800 dark:text-white dark:shadow-slate-900/50'
                    : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          <div className="group relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center">
              <Search className="text-gray-400 transition-colors group-focus-within:text-dribbble-pink dark:text-slate-400" size={20} />
            </div>
            <input
              type="text"
              value={searchText}
              onChange={event => setSearchText(event.target.value)}
              placeholder="Search vendors, venues, or ideas..."
              className="w-full rounded-full border-2 border-transparent bg-white px-14 pr-16 py-5 text-base text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.06)] placeholder-gray-400 outline-none transition-all focus:border-pink-100 focus:ring-4 focus:ring-pink-50 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400 dark:focus:border-slate-700 dark:focus:ring-slate-800 md:text-lg"
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 rounded-full bg-dribbble-pink p-2.5 text-white shadow-lg shadow-pink-200 transition-colors hover:bg-pink-600"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>

          <div className="no-scrollbar flex flex-nowrap items-center gap-3 overflow-x-auto text-sm lg:justify-start">
            <span className="shrink-0 font-medium text-gray-400 dark:text-slate-400">Trending:</span>
            {POPULAR_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                className="shrink-0 whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1 text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="relative hidden aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] bg-gray-100 shadow-2xl dark:bg-slate-900 lg:block">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'z-10 opacity-100' : 'z-0 opacity-0'
            }`}
            style={{ backgroundColor: slide.color }}
          >
            <video autoPlay muted loop playsInline poster={slide.poster} className="h-full w-full object-cover">
              <source src={slide.video} type="video/mp4" />
            </video>
          </div>
        ))}

        <div className="absolute bottom-6 right-6 z-20 flex cursor-pointer items-center gap-3 rounded-full bg-white/90 px-4 py-2 shadow-lg transition-all hover:bg-white dark:bg-[#0f1116]/80">
          <span className="text-sm font-semibold text-gray-900 transition-all duration-300 dark:text-white">
            {HERO_SLIDES[currentSlide].author}
          </span>
          <Image
            src={HERO_SLIDES[currentSlide].avatar}
            alt="Artist"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full border border-gray-200"
          />
        </div>

        <div className="absolute bottom-6 left-6 z-20 flex gap-2">
          {HERO_SLIDES.map((slide, idx) => (
            <span
              key={slide.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 w-full rounded-[22px] bg-[#f7f6fb] px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-1 ring-purple-100/70 dark:bg-slate-900/60 dark:ring-slate-800 md:col-span-2 md:px-7 lg:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-start sm:gap-5">
          <button
            type="button"
            className="beam-button group relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-xs font-mono font-semibold uppercase tracking-[0.14em] text-white"
            style={
              {
                '--shimmer-color': 'rgba(234,76,137,0.85)',
                '--bg': 'rgba(234,76,137,0.14)',
                '--icon-bg': 'rgba(234,76,137,0.18)',
                '--icon-ring': 'rgba(234,76,137,0.35)',
                '--beam-glow': 'rgba(234,76,137,0.4)',
              } as React.CSSProperties
            }
          >
            <span className="beam-border" aria-hidden />
            <span className="beam-inner" aria-hidden />
            <span className="beam-dots" aria-hidden />
            <span className="beam-glow" aria-hidden />
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles size={14} />
              Get Matched Now
            </span>
          </button>

          <p className="text-sm font-medium leading-snug text-gray-700 dark:text-slate-300">
            Tell us what you need and instantly get paired with your dream vendor team.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;

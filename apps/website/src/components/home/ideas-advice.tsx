'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    category: 'BUDGET',
    badge: 'Essential',
    badgeColor: 'bg-emerald-500 text-black',
    title: 'The 50-30-20\nBudget Rule',
    description: "Spend 50% on venue & catering, 30% on photography, florals, and music, 20% as your emergency buffer. This isn't Pinterest math—it's what actually works after planning 500+ weddings.",
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    gradientFrom: 'from-emerald-900/40',
    gradientVia: 'via-slate-900/60',
    gradientAccent: 'from-emerald-600/20',
  },
  {
    id: 2,
    category: 'TIMELINE',
    badge: 'Planning',
    badgeColor: 'bg-violet-500 text-white',
    title: '12 Months is\nMore Than Enough',
    description: "You don't need 18 months. Book your venue, lock in your photographer, find your dress, and breathe. Most planning stress comes from overthinking, not underplanning. We've done gorgeous weddings in 6 months.",
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
    gradientFrom: 'from-violet-900/40',
    gradientVia: 'via-slate-900/60',
    gradientAccent: 'from-violet-600/20',
  },
  {
    id: 3,
    category: 'VENDORS',
    badge: 'Critical',
    badgeColor: 'bg-orange-500 text-black',
    title: 'Trust Your Gut\non Chemistry',
    description: "Reviews and portfolios matter, but so does how a vendor makes you feel. If they seem rushed or dismissive during your first call, walk away. You'll be working together for months—chemistry is everything.",
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    gradientFrom: 'from-orange-900/40',
    gradientVia: 'via-slate-900/60',
    gradientAccent: 'from-orange-600/20',
  },
  {
    id: 4,
    category: 'GUESTS',
    badge: 'Real Talk',
    badgeColor: 'bg-rose-500 text-white',
    title: 'Smaller is Almost\nAlways Sweeter',
    description: 'Every planner will tell you this: 75 people who truly matter beats 200 obligatory invites. Your budget stretches further, your photos capture real moments, and you actually get to talk to everyone. Quality over quantity works.',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80',
    gradientFrom: 'from-rose-900/40',
    gradientVia: 'via-slate-900/60',
    gradientAccent: 'from-rose-600/20',
  },
  {
    id: 5,
    category: 'DAY-OF',
    badge: 'Non-Negotiable',
    badgeColor: 'bg-blue-500 text-white',
    title: 'Hire a Day-Of\nCoordinator',
    description: "Even if you DIY everything else, hire someone for the actual day. Your mom shouldn't be setting up centerpieces. Your best friend shouldn't be directing vendors. You deserve to be a guest at your own wedding.",
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?auto=format&fit=crop&w=800&q=80',
    gradientFrom: 'from-blue-900/40',
    gradientVia: 'via-slate-900/60',
    gradientAccent: 'from-blue-600/20',
  },
  {
    id: 6,
    category: 'WEATHER',
    badge: 'Backup Plan',
    badgeColor: 'bg-amber-500 text-black',
    title: 'Have a Plan B\nYou Actually Like',
    description: "Planning an outdoor ceremony? Don't just have a rain backup—have one you're genuinely excited about. We've seen too many couples stress unnecessarily because their backup felt like a compromise instead of an alternative they loved.",
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1527481138388-31827a7c94d5?auto=format&fit=crop&w=800&q=80',
    gradientFrom: 'from-amber-900/40',
    gradientVia: 'via-slate-900/60',
    gradientAccent: 'from-amber-600/20',
  },
];

const IdeasAdvice = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const slideWidth = container.querySelector('.slide-item')?.clientWidth || 0;
    const gap = 16; // gap-4 = 16px
    const scrollAmount = slideWidth + gap;

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative py-16 px-0 overflow-hidden transition-colors duration-300 bg-festa-base mb-24">
      {/* Header */}
      <div className="max-w-[1400px] mx-auto mb-12 px-6 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
            Ideas &amp; advice <span className="font-normal text-slate-400 dark:text-slate-500">for your day</span>
          </h2>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              className="group relative p-3 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-lg hover:shadow-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:-translate-x-0.5 active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="group relative p-3 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-lg hover:shadow-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:translate-x-0.5 active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
        <p className="text-base leading-relaxed text-slate-600 max-w-2xl dark:text-slate-400">
          Real wisdom from veteran event planners. These are the insights we share with every couple—practical advice that actually matters.
        </p>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="relative max-w-[1400px] mx-auto bg-festa-base">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-8 pl-6 pr-6 bg-festa-base"
        >
          {SLIDES.map((slide) => (
            <div key={slide.id} className="flex-shrink-0 w-[85vw] md:w-[380px] lg:w-[420px] snap-center slide-item">
              <div className="relative w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '3/4' }}>
                {/* Grid Pattern Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:32px_32px] z-0" />

                {/* Background Image */}
                <div className="absolute inset-0 z-10">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    sizes="(max-width: 768px) 85vw, 500px"
                    className="object-cover opacity-90"
                  />
                </div>

                {/* Gradient Overlays - Only on bottom where text is */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/85 z-20" />
                <div className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t ${slide.gradientFrom} to-transparent z-20`} />

                {/* Content */}
                <div className="absolute inset-0 z-40 flex flex-col p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-auto">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">
                      {slide.category}
                    </p>
                    <span className={`inline-block text-[10px] font-mono font-bold ${slide.badgeColor} px-2 py-1 rounded uppercase`}>
                      {slide.badge}
                    </span>
                  </div>

                  {/* Main Content */}
                  <div className="mt-auto">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight leading-tight whitespace-pre-line">
                      {slide.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                      {slide.description}
                    </p>

                    {/* Footer with Read Time and Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-xs text-white/60 font-medium">
                        {slide.readTime}
                      </span>
                      <button className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-200">
                        <span className="text-xs font-semibold text-white">Read</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform duration-200" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Swipe Indicator */}
      <div className="md:hidden flex items-center justify-center mt-6 text-slate-500 dark:text-slate-400 text-xs gap-2">
        <span className="font-mono uppercase tracking-wider">Swipe for more insights</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </section>
  );
};

export default IdeasAdvice;

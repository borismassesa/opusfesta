import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Clock,
  CreditCard,
  Facebook,
  Gem,
  Heart,
  Instagram,
  LayoutGrid,
  Lock,
  Music,
  Plus,
  Quote,
  Star,
  Store,
  TrendingUp,
  Twitter,
  Users,
  CheckCircle2,
  ListChecks,
  Calendar,
  Sparkles,
  Check,
  Mail,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import CategoryBar from '../components/home/category-bar';
import Hero from '../components/home/hero';
import Navbar from '../components/home/navbar';
import ShotGrid from '../components/home/shot-grid';
import IdeasAdvice from '../components/home/ideas-advice';

type Testimonial = {
  name: string;
  role: string;
  location: string;
  quote: string;
  avatar?: string;
  accent?: boolean;
  rating: number;
};

const testimonialsColumns: Array<{
  direction: 'up' | 'down';
  items: Testimonial[];
  visibility?: string;
}> = [
  {
    direction: 'up',
    items: [
      {
        name: 'Amina & Hassan',
        role: 'Couple',
        location: 'Dar es Salaam',
        avatar: 'https://i.pravatar.cc/150?img=32',
        quote: 'We were drowning in spreadsheets and vendor emails. TheFesta saved our sanity—the budget tracker showed us exactly where our money was going, and we stayed under budget by 15%.',
        rating: 5,
      },
      {
        name: 'Neema & David',
        role: 'Couple',
        location: 'Arusha',
        avatar: 'https://i.pravatar.cc/150?img=5',
        quote: 'Finally got our RSVP count two weeks before the wedding instead of three days. The automated reminders were a lifesaver. Only wish the mobile app had more customization options.',
        rating: 4,
      },
      {
        name: 'Juma Photography',
        role: 'Photographer',
        location: 'Zanzibar City',
        avatar: 'https://i.pravatar.cc/150?img=12',
        quote: 'Booked 8 weddings in my first month. The client inquiry system filters out tire-kickers—I only talk to couples who actually have their date and budget sorted.',
        rating: 5,
      },
    ],
  },
  {
    direction: 'down',
    visibility: 'hidden md:flex',
    items: [
      {
        name: 'Elegant Events TZ',
        role: 'Wedding Planner',
        location: 'Dar es Salaam',
        avatar: 'https://i.pravatar.cc/150?img=11',
        quote: 'Managing 12 weddings simultaneously used to mean chaos. Now everything—timelines, vendor contacts, payment schedules—lives in one place. My assistants can access what they need without constant calls to me.',
        rating: 5,
      },
      {
        name: 'TheFesta Team',
        role: 'Platform',
        location: 'Tanzania',
        quote: 'Over 10,000 Tanzanian couples trusted us with their big day. Every review, every suggestion, every feature request shapes what we build next. Thank you for growing with us.',
        avatar: 'https://i.pravatar.cc/150?img=55',
        rating: 5,
      },
      {
        name: 'Zawadi Flowers',
        role: 'Florist',
        location: 'Mwanza',
        avatar: 'https://i.pravatar.cc/150?img=9',
        quote: 'The portfolio gallery shows my arrangements beautifully. Three couples this month specifically mentioned they found me through the "Tropical Florals" search. Direct bookings, no commission fees.',
        rating: 5,
      },
    ],
  },
  {
    direction: 'up',
    visibility: 'hidden lg:flex',
    items: [
      {
        name: 'Grace Makena',
        role: 'Photographer',
        location: 'Dodoma',
        avatar: 'https://i.pravatar.cc/150?img=49',
        quote: 'Couple profiles tell me their story before we even meet—how they met, their style preferences, family dynamics. I walk into consultations actually prepared. Closing rate went from 60% to 85%.',
        rating: 5,
      },
      {
        name: 'Sarah & John',
        role: 'Couple',
        location: 'Mbeya',
        avatar: 'https://i.pravatar.cc/150?img=3',
        quote: 'Planned everything in 4 months while I was finishing my Master\'s. The checklist kept us on track, but I wish the vendor messaging was faster—sometimes took a day to hear back.',
        rating: 4,
      },
      {
        name: 'Harmony Sounds DJ',
        role: 'DJ & Entertainment',
        location: 'Dar es Salaam',
        avatar: 'https://i.pravatar.cc/150?img=68',
        quote: 'The booking calendar syncs with my Google Calendar—no more double-bookings. Couples can see my available dates instantly. Reduced back-and-forth emails by at least 70%.',
        rating: 5,
      },
    ],
  },
];

const footerLinks = [
  {
    title: 'Planning Tools',
    links: [
      { label: 'Checklist', href: '#' },
      { label: 'Budgeter', href: '#' },
      { label: 'Guest List', href: '#' },
    ],
  },
  {
    title: 'Marketplace',
    links: [
      { label: 'Venues', href: '#' },
      { label: 'Photographers', href: '#' },
      { label: 'Florists', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
    ],
  },
];

const ideaCategories = [
  'Planning Basics',
  'Wedding Ceremony',
  'Wedding Reception',
  'Wedding Services',
  'Wedding Fashion',
  'Health and Beauty',
  'Wedding Registry',
];

const featuredArticles = [
  {
    title: 'Wedding Registry 101',
    category: 'Wedding Registry',
    description: 'Start your list with confidence and cover every guest and budget.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    readTime: '8 min read',
  },
  {
    title: 'The Ultimate Wedding Registry Checklist',
    category: 'Planning',
    description: 'A comprehensive guide to gifts you will use long after the big day.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
    readTime: '10 min read',
  },
  {
    title: '25 Awesome Spring Wedding Ideas',
    category: 'Trends & Tips',
    description: 'Fresh palettes, florals, and small delights for a seasonal celebration.',
    image: 'https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=1200&q=80',
    readTime: '6 min read',
  },
];

const vendorTiles = [
  {
    title: 'Venues',
    href: '/venues',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    layout: 'lg:col-span-2 lg:row-span-2',
  },
  {
    title: 'Photo & Film',
    href: '/photography',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1400&q=80',
    layout: 'lg:col-span-2',
  },
  {
    title: 'Planning',
    href: '/planning',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    layout: 'lg:row-span-2',
  },
  {
    title: 'Florists',
    href: '/florists',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80',
    layout: 'lg:col-span-2',
  },
  {
    title: 'Invitations',
    href: '/invitations',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000&auto=format&fit=crop',
    layout: 'lg:col-span-2',
  },
  {
    title: 'Catering',
    href: '/catering',
    image: 'https://images.unsplash.com/photo-1624300603538-1207400f4116?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Entertainment',
    href: '/entertainment',
    image: 'https://images.unsplash.com/photo-1507878866276-a947ef722fee?auto=format&fit=crop&w=1200&q=80',
    layout: 'lg:row-span-2',
  },
  {
    title: 'Beauty & Attire',
    href: '/beauty',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Rentals',
    href: '/rentals',
    image: 'https://images.unsplash.com/photo-1623945037233-0761352e0719?q=80&w=1200&auto=format&fit=crop',
    layout: 'lg:col-span-2',
  },
  {
    title: 'Transport',
    href: '/transportation',
    image: 'https://images.unsplash.com/photo-1563273941-831627255776?q=80&w=800&auto=format&fit=crop',
  },
  {
    title: 'Decorations',
    href: '/decorations',
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Officiants',
    href: '/officiants',
    image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=900&auto=format&fit=crop',
  },
];

const previewVendorTiles = [
  'Venues',
  'Photo & Film',
  'Planning',
  'Entertainment',
  'Florists',
]
  .map(title => vendorTiles.find(tile => tile.title === title))
  .filter(Boolean) as typeof vendorTiles;

function TestimonialColumn({ direction, items, visibility }: (typeof testimonialsColumns)[number]) {
  const directionClass = direction === 'up' ? 'animate-marquee-up' : 'animate-marquee-down';

  return (
    <div className={`${visibility ?? 'flex'} flex-col gap-6 ${directionClass} hover:[animation-play-state:paused]`}>
      {[...Array(2)].map((_, loopIndex) =>
        items.map((item, index) => {
          const isAccent = item.accent;
          const avatarSrc = item.avatar ?? 'https://picsum.photos/seed/thefesta-avatar/80/80';
          return (
            <article
              key={`${item.name}-${loopIndex}-${index}`}
              className={`glass-card rounded-2xl border p-6 shadow-sm transition-transform duration-300 will-change-transform relative ${
                isAccent
                  ? 'border-slate-800 text-slate-900 shadow-md dark:border-slate-700 dark:text-white'
                  : 'border-slate-100 text-slate-900 dark:border-slate-800 dark:text-white'
              }`}
            >
              {/* Star Rating Badge - Top Right */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200/60 dark:border-amber-800/40 shadow-sm backdrop-blur-sm z-10"
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 transition-all ${
                        i < item.rating
                          ? 'fill-amber-400 text-amber-400 dark:fill-amber-500 dark:text-amber-500'
                          : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                  {item.rating}.0
                </span>
              </div>

              <div className="mb-4 flex items-center gap-3">
                {isAccent ? (
                  <div className="flex size-10 items-center justify-center rounded-full bg-sage-500 text-white font-sans italic text-lg font-semibold">
                    TF
                  </div>
                ) : (
                  <Image
                    src={avatarSrc}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 pr-16">
                  <div className="flex items-center gap-1 mb-2">
                    <span className={`text-sm font-medium ${isAccent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isAccent
                        ? 'bg-violet-500/20 text-violet-200 border border-violet-400/30'
                        : 'bg-violet-100 text-violet-700 border border-violet-200/60 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700/40'
                    }`}>
                      {item.role}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isAccent
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/40'
                    }`}>
                      {item.location}
                    </span>
                  </div>
                </div>
              </div>
              <p
                className={`text-sm font-light leading-relaxed ${
                  isAccent ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                &ldquo;{item.quote}&rdquo;
              </p>
            </article>
          );
        })
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative bg-festa-base text-gray-900">
      <Navbar />

      <main className="relative">
        <Hero />

        {/* Discover & Get Inspired Section */}
        <section className="mb-24 pt-8">
          <CategoryBar />
          <ShotGrid />
        </section>

        {/* Dashboard Preview */}
        <section className="animate-fade-in mx-auto mb-20 max-w-[1400px] px-6" style={{ animationDelay: '0.1s' }}>
          <div className="mb-10">
            <div className="mb-3 flex items-center justify-between gap-6">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
                Plan your <span className="font-normal text-slate-400 dark:text-slate-500">dream wedding</span>
              </h2>
              <a
                href="#"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-dribbble-pink px-5 py-2.5 text-sm font-semibold text-white shadow-festa-pink transition-all hover:-translate-y-0.5 hover:shadow-xl hover:bg-dribbble-pink/90"
              >
                Start planning free
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
              Budget tracking, vendor coordination, and timeline management. A complete toolkit<br />
              designed for couples planning their perfect celebration.
            </p>
          </div>
          <div className="glass-card overflow-hidden rounded-xl border border-slate-200/80 shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5 dark:border-slate-800 dark:shadow-slate-900/40">
            <div className="sticky top-0 z-10 flex h-10 items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-[#0f1116]/80">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-500/40 ring-1 ring-white/60 dark:ring-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-sm shadow-amber-400/30 ring-1 ring-white/60 dark:ring-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/40 ring-1 ring-white/60 dark:ring-white/10" />
              </div>
              <div className="flex items-center gap-1.5 rounded border border-slate-100 bg-slate-50/80 px-6 py-1 text-[11px] font-mono font-medium text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
                <Lock className="h-3 w-3" />
                thefesta.com/dashboard
              </div>
              <div className="w-8" />
            </div>

            <div className="flex min-h-[520px] flex-col bg-slate-50/60 font-sans dark:bg-[#0f1116] md:flex-row">
              <aside className="glass-card hidden w-64 border border-slate-200/70 bg-white/80 px-4 py-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80 md:flex md:flex-col">
                <div className="mb-8 rounded-xl border border-white/40 bg-white/30 p-3 shadow-sm backdrop-blur-sm transition-all hover:border-white/60 dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200/70 bg-white/80 text-rose-600 font-sans italic text-base font-semibold shadow-sm ring-2 ring-white/80 dark:border-rose-900/60 dark:bg-white/10 dark:text-rose-200 dark:ring-white/10">
                      S&J
                    </div>
                    <div>
                      <div className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Sarah &amp; James</div>
                      <div className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-300">June 14, 2025</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-sage-300/60 bg-white/60 px-3 py-2.5 text-xs font-semibold text-slate-800 shadow-md backdrop-blur-sm transition-all hover:-translate-x-0.5 hover:shadow-lg dark:border-sage-500/40 dark:bg-white/[0.12] dark:text-white">
                    <LayoutGrid className="h-4 w-4 text-sage-600 dark:text-sage-300" /> Overview
                  </button>
                  <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/30 bg-white/20 px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:-translate-x-0.5 hover:border-sage-200 hover:bg-white/40 hover:text-slate-900 dark:border-white/5 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-sage-500/30 dark:hover:text-white">
                    <ListChecks className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    Planning Tools
                  </button>
                  <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/30 bg-white/20 px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:-translate-x-0.5 hover:border-sage-200 hover:bg-white/40 hover:text-slate-900 dark:border-white/5 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-sage-500/30 dark:hover:text-white">
                    <Store className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    Vendors
                  </button>
                  <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/30 bg-white/20 px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:-translate-x-0.5 hover:border-sage-200 hover:bg-white/40 hover:text-slate-900 dark:border-white/5 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-sage-500/30 dark:hover:text-white">
                    <LayoutGrid className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    Wedding Website
                  </button>
                  <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/30 bg-white/20 px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:-translate-x-0.5 hover:border-sage-200 hover:bg-white/40 hover:text-slate-900 dark:border-white/5 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-sage-500/30 dark:hover:text-white">
                    <Users className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    Guests & RSVPs
                  </button>
                  <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/30 bg-white/20 px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:-translate-x-0.5 hover:border-sage-200 hover:bg-white/40 hover:text-slate-900 dark:border-white/5 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-sage-500/30 dark:hover:text-white">
                    <Gem className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    Attire & Rings
                  </button>
                  <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/30 bg-white/20 px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:-translate-x-0.5 hover:border-sage-200 hover:bg-white/40 hover:text-slate-900 dark:border-white/5 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-sage-500/30 dark:hover:text-white">
                    <Heart className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    Ideas & Advice
                  </button>
                </div>
                <div className="mt-auto pt-6">
                  <div className="relative overflow-hidden rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 shadow-lg dark:border-amber-500/30 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/30">
                    <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-amber-200/30 blur-2xl dark:bg-amber-400/20" />
                    <div className="absolute -bottom-2 -left-2 h-12 w-12 rounded-full bg-rose-200/30 blur-xl dark:bg-rose-400/20" />
                    <div className="relative">
                      <div className="mb-2 flex items-center gap-1.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                          <Star className="h-3 w-3 fill-white text-white" />
                        </div>
                        <span className="text-xs font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">Festa Pro</span>
                      </div>
                      <p className="mb-3 text-[11px] font-medium leading-relaxed text-slate-700 dark:text-slate-200">
                        Get AI-powered recommendations and smart planning tools
                      </p>
                      <button className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-amber-600 hover:to-orange-600 dark:from-amber-600 dark:to-orange-600 dark:hover:from-amber-500 dark:hover:to-orange-500">
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Welcome Header */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back, Sarah!</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your wedding planning journey</p>
                  </div>
                  <div className="glass-card rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-md dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">158</span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">days to go</span>
                        </div>
                        <div className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">June 14, 2025</div>
                      </div>
                      <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
                      <div className="flex flex-col items-center">
                        <div className="relative h-12 w-12">
                          <svg className="h-12 w-12 -rotate-90 transform">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-200 dark:text-slate-700" />
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="125.6" strokeDashoffset="40.2" className="text-emerald-500 transition-all" strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">68%</span>
                          </div>
                        </div>
                        <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Complete</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="glass-card rounded-xl border border-slate-200/80 p-3 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 relative z-20">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-[11px] font-semibold text-slate-900 dark:text-white">Budget Tracker</h3>
                      <div className="rounded-full bg-emerald-50 p-1 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-200">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="mb-2 flex items-baseline gap-1">
                      <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">$28,500</span>
                      <span className="text-xs font-medium text-slate-400">paid of $42k budget</span>
                    </div>
                    <div className="relative mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="absolute inset-y-0 left-0 w-[67.8%] rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="glass-card rounded-lg border border-slate-100 p-2 transition-colors hover:border-slate-200 dark:border-slate-800">
                        <div className="mb-0.5">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pending</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-white">$8,750</div>
                      </div>
                      <div className="glass-card rounded-lg border border-slate-100 p-2 transition-colors hover:border-slate-200 dark:border-slate-800">
                        <div className="mb-0.5">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Remaining</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-white">$4,750</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl border border-slate-200/80 p-3 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-[11px] font-semibold text-slate-900 dark:text-white">Active Vendors</h3>
                      <button className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800">
                        <Plus className="h-2.5 w-2.5" />
                        Add Vendor
                      </button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {[
                        {
                          title: 'Katie Chen Photography',
                          category: 'Photography',
                          location: 'Dar es Salaam',
                          status: 'Contracted',
                          amount: '$3,500',
                          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-900',
                          Icon: Camera,
                        },
                        {
                          title: 'Blooms & Petals',
                          category: 'Florist',
                          location: 'Dar es Salaam',
                          status: 'Deposit Paid',
                          amount: '$2,800',
                          badgeClass: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-900',
                          Icon: Music,
                        },
                      ].map(vendor => (
                        <div
                          key={vendor.title}
                          className="glass-card group flex items-center justify-between rounded-lg border border-slate-200/80 p-2 transition-all hover:border-slate-100 dark:border-slate-800 dark:hover:border-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-500 transition-all group-hover:bg-white group-hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                              <vendor.Icon className="h-3 w-3" />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-xs font-medium text-slate-900 dark:text-white">{vendor.title}</div>
                              <div className="mt-0.5 flex items-center gap-1">
                                <span className="rounded bg-slate-100 px-1 py-0.5 text-[8px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  {vendor.category}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{vendor.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-2">
                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold border ${vendor.badgeClass}`}>
                              {vendor.status}
                            </span>
                            <span className="w-12 text-right text-[10px] font-medium text-slate-600 dark:text-slate-300">{vendor.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* This Week's Schedule */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">This Week&apos;s Schedule</h2>
                    <button className="text-xs font-medium text-sage-600 hover:text-sage-700 dark:text-sage-400">View All</button>
                  </div>
                  <div className="glass-card rounded-xl border border-slate-200/80 p-3 dark:border-slate-800">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {[
                        {
                          title: 'Final Florist Meeting',
                          day: 'Today',
                          time: '2:00 PM',
                          category: 'Decor',
                          color: 'bg-emerald-500',
                          textColor: 'text-emerald-700 dark:text-emerald-300',
                          bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                        },
                        {
                          title: 'DJ Song Selection',
                          day: 'Wed',
                          time: '6:30 PM',
                          category: 'Entertainment',
                          color: 'bg-blue-500',
                          textColor: 'text-blue-700 dark:text-blue-300',
                          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                        },
                        {
                          title: 'Bridal Hair & Makeup Trial',
                          day: 'Fri',
                          time: '11:00 AM',
                          category: 'Beauty',
                          color: 'bg-purple-500',
                          textColor: 'text-purple-700 dark:text-purple-300',
                          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                        },
                        {
                          title: 'Submit Final Guest Count',
                          day: 'Sat',
                          time: 'All Day',
                          category: 'Catering',
                          color: 'bg-amber-500',
                          textColor: 'text-amber-700 dark:text-amber-300',
                          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                        },
                      ].map((event, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-2 rounded-lg border border-slate-100 p-2 transition-all hover:border-slate-200 hover:bg-slate-50/50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900/30"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-xs font-medium text-slate-900 dark:text-white">{event.title}</div>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {event.day}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">{event.time}</span>
                            </div>
                          </div>
                          <div className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${event.textColor} ${event.bgColor}`}>
                            {event.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upcoming Tasks */}
                <div className="glass-card rounded-xl border border-slate-200/80 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                      Priority Tasks
                      <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                        3
                      </span>
                    </h3>
                    <div className="flex gap-1">
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[8px] font-semibold text-rose-600 dark:bg-rose-900/30 dark:text-rose-200">
                        ACTION NEEDED
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="glass-card flex cursor-pointer flex-col gap-3 rounded-xl border border-slate-100 p-4 transition-all hover:border-slate-200 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700">
                      <div className="flex items-start justify-between">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-transparent transition-colors hover:border-emerald-500 hover:text-emerald-500 dark:border-slate-700 dark:bg-slate-900">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                          Completed
                        </span>
                      </div>
                      <div>
                        <div className="line-through text-sm font-medium text-slate-400">Order wedding favors</div>
                        <div className="mt-1 text-[11px] text-slate-400">Completed 2 days ago</div>
                      </div>
                    </div>
                    <div className="glass-card relative flex cursor-pointer flex-col gap-3 rounded-xl border border-rose-100 p-4 shadow-[0_2px_8px_rgba(244,63,94,0.05)] transition-all hover:border-rose-200 dark:border-rose-900/50">
                      <div className="absolute left-0 top-0 h-full w-1 bg-rose-500" />
                      <div className="flex items-start justify-between pl-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-slate-200 bg-white text-transparent transition-colors hover:border-emerald-500 hover:text-emerald-500 dark:border-slate-700 dark:bg-slate-900" />
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-900/30 dark:text-rose-200">
                          Due This Week
                        </span>
                      </div>
                      <div className="pl-2">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">Confirm ceremony musicians</div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-500 dark:text-rose-200">
                          <Clock className="h-3 w-3" />
                          Due Friday
                        </div>
                      </div>
                    </div>
                    <div className="glass-card flex cursor-pointer flex-col gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-800">
                      <div className="flex items-start justify-between">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-transparent transition-colors hover:border-emerald-500 hover:text-emerald-500 dark:border-slate-700 dark:bg-slate-900" />
                        <span className="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
                          Jan 8
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white">
                          Final dress fitting
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <span className="rounded bg-slate-100 px-1 py-0.5 text-[8px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            Attire
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">Bella Bridal</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wedding Website Designs Grid */}
        <section className="relative mx-auto mb-24 max-w-[1400px] px-6">
          <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
                Beautiful wedding <span className="font-normal text-slate-400 dark:text-slate-500">website designs</span>
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
                Create a stunning online presence for your celebration—choose from elegant templates, modern layouts, and
                customizable themes to match your style.
              </p>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
            >
              View all templates
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 md:gap-6 auto-rows-[minmax(140px,auto)] grid-flow-dense">
            {/* Tile 1 - Modern Minimalist */}
            <a
              href="#"
              className="relative overflow-hidden rounded-3xl border border-neutral-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-xl md:col-span-3 md:row-span-2 lg:col-span-4 lg:col-start-1"
            >
              <div className="relative w-full h-full aspect-[16/10]">
                <Image
                  src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1400&q=80"
                  alt="Modern Minimalist Wedding Website"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">WEDDING TEMPLATE</p>
                  <h3 className="text-lg font-serif text-white drop-shadow-sm">Modern Minimalist</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 backdrop-blur flex items-center justify-center text-white">
                  <span className="text-xs font-semibold">View</span>
                </div>
              </div>
            </a>

            {/* Tile 2 - Romantic Timeless (Tall Featured) */}
            <a
              href="#"
              className="relative overflow-hidden rounded-3xl border border-neutral-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-xl md:col-span-3 md:row-span-3 lg:col-span-4 lg:col-start-5 lg:row-span-3"
            >
              <div className="relative w-full h-full aspect-[3/4]">
                <Image
                  src="https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1400&q=80"
                  alt="Romantic Timeless Wedding Website"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">COUPLE&apos;S STORY</p>
                  <h3 className="text-lg font-serif text-white drop-shadow-sm">Romantic Timeless</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 backdrop-blur flex items-center justify-center text-white">
                  <span className="text-xs font-semibold">View</span>
                </div>
              </div>
            </a>

            {/* Tile 3 - Garden Celebration */}
            <a
              href="#"
              className="relative overflow-hidden rounded-3xl border border-neutral-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-xl md:col-span-3 md:row-span-2 lg:col-span-3 lg:col-start-9"
            >
              <div className="relative w-full h-full aspect-[4/3]">
                <Image
                  src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80"
                  alt="Garden Celebration Wedding Website"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">OUTDOOR VENUE</p>
                  <h3 className="text-lg font-serif text-white drop-shadow-sm">Garden Celebration</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 backdrop-blur flex items-center justify-center text-white">
                  <span className="text-xs font-semibold">View</span>
                </div>
              </div>
            </a>

            {/* Tile 4 - Coastal Elegance (Tall) */}
            <a
              href="#"
              className="relative overflow-hidden rounded-3xl border border-neutral-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-xl md:col-span-3 md:row-span-3 lg:col-span-4 lg:col-start-1"
            >
              <div className="relative w-full h-full aspect-[4/5]">
                <Image
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=80"
                  alt="Coastal Elegance Wedding Website"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">DESTINATION WEDDING</p>
                  <h3 className="text-lg font-serif text-white drop-shadow-sm">Coastal Elegance</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 backdrop-blur flex items-center justify-center text-white">
                  <span className="text-xs font-semibold">View</span>
                </div>
              </div>
            </a>

            {/* Tile 5 - Luxury Affair */}
            <a
              href="#"
              className="relative overflow-hidden rounded-3xl border border-neutral-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-xl md:col-span-3 md:row-span-2 lg:col-span-3 lg:col-start-9"
            >
              <div className="relative w-full h-full aspect-[16/9]">
                <Image
                  src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80"
                  alt="Luxury Affair Wedding Website"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">PREMIUM DESIGN</p>
                  <h3 className="text-lg font-serif text-white drop-shadow-sm">Luxury Affair</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 backdrop-blur flex items-center justify-center text-white">
                  <span className="text-xs font-semibold">View</span>
                </div>
              </div>
            </a>

            {/* Tile 6 - Vintage Charm */}
            <a
              href="#"
              className="relative overflow-hidden rounded-3xl border border-neutral-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-xl md:col-span-6 md:row-span-2 lg:col-span-4 lg:col-start-5"
            >
              <div className="relative w-full h-full aspect-[16/9]">
                <Image
                  src="https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=80"
                  alt="Vintage Charm Wedding Website"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 600px"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">CLASSIC STYLE</p>
                  <h3 className="text-lg font-serif text-white drop-shadow-sm">Vintage Charm</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 backdrop-blur flex items-center justify-center text-white">
                  <span className="text-xs font-semibold">View</span>
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* Guests & RSVPs Section */}
        <section
          id="guest-rsvp"
          className="py-24 px-6 text-neutral-900 dark:text-white relative overflow-hidden transition-colors duration-300"
        >
          <div className="max-w-[1400px] mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Content Header */}
              <div className="order-1 lg:order-2 lg:col-span-4 flex flex-col justify-center">
                <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
                  Everyone you love, <br />
                  <span className="font-normal text-slate-400 dark:text-slate-500">in one place</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  Stop chasing RSVPs via text. Get your final headcount without the stress. Track dietary needs, plus-ones, and get that number to your caterer on time.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                    <div className="p-2 rounded-full bg-neutral-200/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
                      <Check className="w-4 h-4" />
                    </div>
                    <span>Know who&apos;s coming (and who needs a nudge)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                    <div className="p-2 rounded-full bg-neutral-200/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span>Send beautiful invites guests actually open</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                    <div className="p-2 rounded-full bg-neutral-200/50 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <span>Track allergies, kids, and song requests too</span>
                  </div>
                </div>
              </div>

              {/* Guest Management UI */}
              <div className="order-2 lg:order-1 lg:col-span-8 bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-2xl border border-neutral-100 dark:border-slate-700/50 text-neutral-900 dark:text-white">
                {/* Step Indicators */}
                <div className="flex items-center gap-4 mb-8 text-xs font-bold tracking-widest uppercase text-neutral-400">
                  <span className="text-dribbble-pink">01. Invites</span>
                  <span className="w-8 h-px bg-neutral-200 dark:bg-neutral-700" />
                  <span className="">02. Headcount</span>
                  <span className="w-8 h-px bg-neutral-200 dark:bg-neutral-700" />
                  <span className="">03. Details</span>
                </div>

                {/* Guest Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <button className="text-left p-4 rounded-xl border-2 border-dribbble-pink bg-dribbble-pink/5 dark:bg-dribbble-pink/10 relative">
                    <div className="absolute top-3 right-3 text-dribbble-pink">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="block font-medium text-sm mb-1">Celebrating with you</span>
                    <span className="block text-2xl font-bold mb-1">127</span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      Ready for final headcount
                    </span>
                  </button>
                  <button className="text-left p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-dribbble-pink/50 transition-colors">
                    <span className="block font-medium text-sm mb-1">Still deciding</span>
                    <span className="block text-2xl font-bold mb-1">18</span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      Send a reminder?
                    </span>
                  </button>
                  <button className="text-left p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-dribbble-pink/50 transition-colors">
                    <span className="block font-medium text-sm mb-1">Can&apos;t make it</span>
                    <span className="block text-2xl font-bold mb-1">5</span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                      Will be missed
                    </span>
                  </button>
                </div>

                {/* RSVP Deadline & Dietary Needs */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium mb-4">Caterer deadline & what everyone&apos;s eating</h4>
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Calendar Visual */}
                    <div className="flex-1 rounded-xl p-4 bg-neutral-50/50 dark:bg-slate-900/30 border border-neutral-200/50 dark:border-neutral-700/50">
                      <div className="flex justify-between mb-4 text-sm font-medium">
                        <span>March 2024</span>
                        <div className="flex gap-2">
                          <ChevronLeft className="w-4 h-4 cursor-pointer" />
                          <ChevronRight className="w-4 h-4 cursor-pointer" />
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center text-xs text-neutral-400 mb-2">
                        <span>S</span>
                        <span>M</span>
                        <span>T</span>
                        <span>W</span>
                        <span>T</span>
                        <span>F</span>
                        <span>S</span>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium">
                        <span className="text-neutral-300">25</span>
                        <span className="text-neutral-300">26</span>
                        <span className="text-neutral-300">27</span>
                        <span className="text-neutral-300">28</span>
                        <span className="text-neutral-300">29</span>
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                        <span>6</span>
                        <span>7</span>
                        <span>8</span>
                        <span>9</span>
                        <span>10</span>
                        <span>11</span>
                        <span>12</span>
                        <span>13</span>
                        <span>14</span>
                        <span className="bg-dribbble-pink text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto shadow-lg shadow-dribbble-pink/40">
                          15
                        </span>
                        <span>16</span>
                      </div>
                      <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-3">
                        Final count due March 15
                      </p>
                    </div>

                    {/* Dietary Needs */}
                    <div className="flex-1 space-y-3">
                      <div className="p-3 rounded-lg bg-neutral-50/50 dark:bg-slate-900/30 border border-neutral-200 dark:border-neutral-700">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Beef Tenderloin</span>
                          <span className="text-xs text-neutral-500">54 guests</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                          <div className="bg-dribbble-pink h-2 rounded-full" style={{ width: '43%' }} />
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-neutral-50/50 dark:bg-slate-900/30 border border-neutral-200 dark:border-neutral-700">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Chilean Sea Bass</span>
                          <span className="text-xs text-neutral-500">41 guests</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                          <div className="bg-dribbble-pink h-2 rounded-full" style={{ width: '32%' }} />
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-neutral-50/50 dark:bg-slate-900/30 border border-neutral-200 dark:border-neutral-700">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Vegan (GF available)</span>
                          <span className="text-xs text-neutral-500">32 guests</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                          <div className="bg-dribbble-pink h-2 rounded-full" style={{ width: '25%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <button className="w-full py-4 bg-dribbble-pink text-white rounded-xl font-medium text-sm hover:bg-dribbble-pink/90 transition-colors shadow-festa-pink">
                  Send gentle reminders to the 18 pending
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Ideas & Advice - Instagram Slides Style */}
        <IdeasAdvice />

        {/* Testimonials */}
        <section className="relative mb-24 py-16 bg-festa-base">
          <div className="mx-auto max-w-[1400px] px-6">
            <div className="mb-12 flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
                  Community <span className="font-normal text-slate-400 dark:text-slate-500">Stories</span>
                </h2>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  Honest feedback from couples and vendors who&apos;ve been there. The budget wins, the timeline crunches, and who delivered when it mattered.
                </p>
              </div>
              <div className="hidden items-center gap-2 text-slate-400 sm:flex">
                <Quote className="h-4 w-4" />
                <span className="text-sm">Real feedback</span>
              </div>
            </div>

            <div className="relative h-[520px] overflow-hidden">
              <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonialsColumns.map(column => (
                  <TestimonialColumn key={column.direction + (column.visibility ?? 'all')} {...column} />
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-slate-200/60 bg-slate-900/[0.03] pb-8 pt-16 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/40">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <a href="#" className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-50 text-sage-700 dark:bg-slate-900 dark:text-sage-200">
                  <Gem className="h-4 w-4" />
                </div>
                <span className="font-display text-xl font-medium text-slate-900 dark:text-white">TheFesta</span>
              </a>
              <p className="mb-6 max-w-xs text-sm text-slate-500 dark:text-slate-300">
                The ultimate wedding planning ecosystem. Connecting couples with top-tier vendors for unforgettable
                celebrations.
              </p>
              <div className="flex gap-4 text-slate-400 dark:text-slate-500">
                <a href="#" className="transition-colors hover:text-sage-600 dark:hover:text-sage-400" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="transition-colors hover:text-sage-600 dark:hover:text-sage-400" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="transition-colors hover:text-sage-600 dark:hover:text-sage-400" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {footerLinks.map(section => (
              <div key={section.title}>
                <h4 className="mb-4 font-medium text-slate-900 dark:text-white">{section.title}</h4>
                <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-300">
                  {section.links.map(link => (
                    <li key={link.label}>
                      <a href={link.href} className="transition-colors hover:text-sage-600 dark:hover:text-sage-400">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-8 dark:border-slate-800">
            <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-400 md:flex-row">
              {/* Left - Legal Links */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:justify-start">
                <a href="#" className="text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Privacy Policy
                </a>
                <a href="#" className="text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Terms of Service
                </a>
                <a href="#" className="text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Cookie Policy
                </a>
                <a href="#" className="text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Accessibility
                </a>
                <a href="#" className="text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                  Sitemap
                </a>
              </div>

              {/* Center - Copyright */}
              <p className="whitespace-nowrap">© 2024 TheFesta Inc. All rights reserved.</p>

              {/* Right - Made with love */}
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span>Made with</span>
                <Heart className="h-3 w-3 text-rose-400" fill="currentColor" />
                <span>for couples everywhere.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

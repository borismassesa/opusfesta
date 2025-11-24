import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Camera,
  Clock,
  CreditCard,
  Facebook,
  Gem,
  Heart,
  Instagram,
  LayoutGrid,
  Lock,
  Monitor,
  Music,
  PieChart,
  Plus,
  Quote,
  Search,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Twitter,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { ThemeToggle } from '../components/theme-toggle';

type Testimonial = {
  name: string;
  subtitle: string;
  quote: string;
  avatar?: string;
  accent?: boolean;
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
        name: 'Sarah & Mike',
        subtitle: 'June 2024 • Charleston',
        avatar: 'https://i.pravatar.cc/150?img=32',
        quote: 'The budget tracker saved us. We could see exactly where every dollar went instantly.',
      },
      {
        name: 'Maya & Jen',
        subtitle: 'Oct 2024 • Seattle',
        avatar: 'https://i.pravatar.cc/150?img=5',
        quote: 'Found our photographer and florist in one afternoon. The vendor match AI is eerily accurate.',
      },
      {
        name: 'Jackson Lee',
        subtitle: 'Jan 2025 • NYC',
        avatar: 'https://i.pravatar.cc/150?img=12',
        quote: 'Simple, elegant, and powerful. Inclusive language made us feel welcome.',
      },
    ],
  },
  {
    direction: 'down',
    visibility: 'hidden md:flex',
    items: [
      {
        name: 'Elite Events Co.',
        subtitle: 'Planner Partner',
        avatar: 'https://i.pravatar.cc/150?img=11',
        quote: 'Managing client timelines has never been smoother. The collaborative dashboard is a dream.',
      },
      {
        name: 'TheFesta Team',
        subtitle: 'System Message',
        quote: 'We are proud to support over 50,000 diverse celebrations worldwide.',
        avatar: 'https://i.pravatar.cc/150?img=55',
      },
      {
        name: 'Sofia Alvarez',
        subtitle: 'Floral Designer',
        avatar: 'https://i.pravatar.cc/150?img=9',
        quote: 'The clean interface makes it easy to showcase my portfolio. Clients love the booking flow.',
      },
    ],
  },
  {
    direction: 'up',
    visibility: 'hidden lg:flex',
    items: [
      {
        name: 'Priya Singh',
        subtitle: 'Photographer',
        avatar: 'https://i.pravatar.cc/150?img=49',
        quote: "I get 3x more qualified leads here than other platforms. The couple's profiles are detailed.",
      },
      {
        name: 'Leo Martin',
        subtitle: 'Nov 2024 • Austin',
        avatar: 'https://i.pravatar.cc/150?img=3',
        quote: 'We planned a destination wedding in 3 months. The checklist tool kept us sane.',
      },
      {
        name: 'Ethan Garcia',
        subtitle: 'Groom-to-be',
        avatar: 'https://i.pravatar.cc/150?img=68',
        quote: 'Guest list management finally made sense. Tracking RSVPs and meals in real-time is essential.',
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
          return (
            <article
              key={`${item.name}-${loopIndex}-${index}`}
              className={`glass-card rounded-2xl border p-6 shadow-sm transition-transform duration-300 will-change-transform ${
                isAccent
                  ? 'border-slate-800 text-slate-900 shadow-md dark:border-slate-700 dark:text-white'
                  : 'border-slate-100 text-slate-900 dark:border-slate-800 dark:text-white'
              }`}
            >
              <div className="mb-4 flex items-center gap-3">
                {isAccent ? (
                  <div className="flex size-10 items-center justify-center rounded-full bg-sage-500 text-white font-serif italic text-lg">
                    TF
                  </div>
                ) : (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="size-10 rounded-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-medium ${isAccent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {item.name}
                    </span>
                    {!isAccent && <CheckCircle2 className="h-3.5 w-3.5 text-sage-500" aria-hidden />}
                  </div>
                  <p className={`text-xs ${isAccent ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>{item.subtitle}</p>
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
    <div className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#FAFAFA] dark:bg-[#0f1116]" />

      <nav className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-xl shadow-sm dark:border-slate-800 dark:bg-[#0f1116]/95 dark:shadow-slate-900/30">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto,1fr,auto] items-center gap-6 px-6">
          <a href="#" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-50 text-sage-700 ring-1 ring-sage-200 transition-colors group-hover:bg-sage-100 dark:bg-slate-800 dark:text-sage-200 dark:ring-slate-700 dark:group-hover:bg-slate-700">
              <Gem className="h-4 w-4" />
            </div>
            <span className="font-serif text-xl font-medium tracking-tight text-slate-900 dark:text-white">TheFesta</span>
          </a>

          <div className="hidden items-center justify-center gap-6 md:flex">
            {['Planning Tools', 'Vendors', 'Websites', 'Ideas'].map(item => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium text-slate-600 transition-colors hover:text-sage-700 dark:text-slate-300 dark:hover:text-sage-300"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center justify-end gap-4">
            <a
              href="#"
              className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Log In
            </a>
            <button
              type="button"
              className="beam-button group relative hidden items-center justify-center rounded-full px-12 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] sm:inline-flex"
            >
              <span className="beam-border" aria-hidden />
              <span className="beam-inner" aria-hidden />
              <span className="beam-dots" aria-hidden />
              <span className="beam-glow" aria-hidden />
              <span className="relative z-10 flex items-center gap-2 text-white/90 transition duration-300 group-hover:text-white">
                Sign Up
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </div>
      </nav>

      <main className="relative pt-28 lg:pt-28">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pt-20 pb-12 lg:pt-32">
          <div className="pointer-events-none absolute inset-0 bg-grid-slate [mask-image:linear-gradient(to_bottom,white,transparent)] dark:[mask-image:linear-gradient(to_bottom,#0f1116,transparent)]" />
          <div className="relative z-10 mx-auto max-w-5xl space-y-8 text-center">
            <h1 className="text-5xl font-medium tracking-tight text-slate-900 leading-[1.05] lg:text-7xl dark:text-white">
              The operating system <br />
              <span className="text-slate-400">for your </span>
              <span className="font-serif italic text-slate-900 font-light dark:text-white">perfect day.</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg font-light leading-relaxed text-slate-500 dark:text-slate-300">
              Orchestrate vendors, guests, and budgets in one unified workspace. Built for modern couples who demand
              precision.
            </p>
            <div className="mx-auto flex max-w-md flex-col gap-3">
              <div className="group relative">
                <div className="absolute -inset-1 rounded-full bg-white/30 opacity-25 blur transition duration-1000 group-hover:opacity-50 group-hover:duration-200 dark:bg-white/10" />
                <form className="shimmer-button relative flex items-center">
                  <span className="shimmer-rotate" aria-hidden />
                  <span className="shimmer-surface" aria-hidden />
                  <span className="shimmer-inner w-full gap-3 pr-3">
                    <div className="relative z-10 pl-1 text-current">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Find photographers in New York..."
                      className="z-10 w-full bg-transparent text-sm placeholder:text-inherit/70 focus:outline-none focus:ring-0"
                    />
                    <span className="shimmer-content inline-flex size-9 items-center justify-center rounded-full bg-[var(--icon-bg)] ring-1 ring-[var(--icon-ring)]">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </span>
                </form>
              </div>
              <p className="text-[11px] font-medium tracking-wide text-slate-400">TRUSTED BY 10,000+ PLANNERS & COUPLES</p>
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="animate-fade-in mx-auto mb-20 max-w-6xl px-6" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card overflow-hidden rounded-xl border border-slate-200/80 shadow-2xl shadow-slate-200/50 ring-1 ring-slate-900/5 dark:border-slate-800 dark:shadow-slate-900/40">
            <div className="sticky top-0 z-10 flex h-10 items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-[#0f1116]/80">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-500/40 ring-1 ring-white/60 dark:ring-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-sm shadow-amber-400/30 ring-1 ring-white/60 dark:ring-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/40 ring-1 ring-white/60 dark:ring-white/10" />
              </div>
              <div className="flex items-center gap-1.5 rounded border border-slate-100 bg-slate-50/80 px-6 py-1 text-[11px] font-medium text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
                <Lock className="h-3 w-3" />
                thefesta.com/dashboard
              </div>
              <div className="w-8" />
            </div>

            <div className="flex min-h-[520px] flex-col bg-slate-50/60 font-sans dark:bg-[#0f1116] md:flex-row">
              <aside className="glass-card hidden w-64 border border-slate-200/70 bg-white/80 px-4 py-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80 md:flex md:flex-col">
                <div className="mb-8 rounded-xl border border-white/40 bg-white/30 p-3 shadow-sm backdrop-blur-sm transition-all hover:border-white/60 dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200/70 bg-white/80 text-rose-600 font-serif italic text-base shadow-sm ring-2 ring-white/80 dark:border-rose-900/60 dark:bg-white/10 dark:text-rose-200 dark:ring-white/10">
                      S&J
                    </div>
                    <div>
                      <div className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Sarah &amp; James</div>
                      <div className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-300">Sept 24, 2024</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <button className="glass-card flex w-full items-center gap-3 rounded-lg border border-sage-200/70 bg-white/40 px-3 py-2.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-sage-300/40 transition-all hover:-translate-x-0.5 hover:ring-sage-400/60 dark:border-sage-500/20 dark:bg-white/5 dark:text-white dark:ring-sage-500/20">
                    <LayoutGrid className="h-4 w-4 text-sage-600 dark:text-sage-300" /> Overview
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-lg border border-white/30 bg-white/20 px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:-translate-x-0.5 hover:border-sage-200 hover:bg-white/40 hover:text-slate-900 dark:border-white/5 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-sage-500/30 dark:hover:text-white">
                    <Users className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    Guest List
                    <span className="ml-auto rounded-full border border-white/40 bg-white/30 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                      142
                    </span>
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-lg border border-white/30 bg-white/20 px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:-translate-x-0.5 hover:border-sage-200 hover:bg-white/40 hover:text-slate-900 dark:border-white/5 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-sage-500/30 dark:hover:text-white">
                    <Store className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    Vendors
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-lg border border-white/30 bg-white/20 px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:-translate-x-0.5 hover:border-sage-200 hover:bg-white/40 hover:text-slate-900 dark:border-white/5 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-sage-500/30 dark:hover:text-white">
                    <CreditCard className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    Budget
                  </button>
                </div>
                <div className="mt-auto pt-6">
                  <div className="glass-card rounded-xl border border-white/30 bg-white/20 p-3 shadow-inner dark:border-white/5 dark:bg-white/[0.04]">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/60 text-slate-800 shadow-sm dark:bg-white/10 dark:text-white">
                        <Star className="h-3.5 w-3.5" />
                      </div>
                      <button className="text-[11px] font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                        Upgrade
                      </button>
                    </div>
                    <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-300">Unlock AI planning tools with Festa Pro.</p>
                  </div>
                </div>
              </aside>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="glass-card rounded-xl border border-slate-200/80 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">Budget Pacing</h3>
                      <div className="rounded-full bg-emerald-50 p-1 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-200">
                        <TrendingUp className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="mb-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">$42,500</span>
                      <span className="text-sm font-medium text-slate-400">/ $50k</span>
                    </div>
                    <div className="relative mb-6 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="absolute inset-y-0 left-0 w-[85%] rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-card rounded-lg border border-slate-100 p-3 transition-colors hover:border-slate-200 dark:border-slate-800">
                        <div className="mb-1 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Paid</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-white">$12,250</div>
                      </div>
                      <div className="glass-card rounded-lg border border-slate-100 p-3 transition-colors hover:border-slate-200 dark:border-slate-800">
                        <div className="mb-1 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Pending</span>
                        </div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-white">$30,250</div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-xl border border-slate-200/80 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 lg:col-span-2">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Active Vendors</h3>
                      <button className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800">
                        <Plus className="h-3 w-3" />
                        Add Vendor
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {[
                        {
                          title: 'Lumina Studios',
                          subtitle: 'Photography • Brooklyn, NY',
                          status: 'Booked',
                          amount: '$4,200',
                          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-900',
                          Icon: Camera,
                        },
                        {
                          title: 'Sound Collective',
                          subtitle: 'Live Band • Queens, NY',
                          status: 'Reviewing',
                          amount: '$6,500',
                          badgeClass: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-900',
                          Icon: Music,
                        },
                      ].map(vendor => (
                        <div
                          key={vendor.title}
                          className="glass-card group flex items-center justify-between rounded-lg border border-slate-200/80 p-3 transition-all hover:border-slate-100 dark:border-slate-800 dark:hover:border-slate-700"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-500 transition-all group-hover:bg-white group-hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                              <vendor.Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">{vendor.title}</div>
                              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">{vendor.subtitle}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${vendor.badgeClass}`}>
                              {vendor.status}
                            </span>
                            <span className="w-16 text-right text-xs font-medium text-slate-600 dark:text-slate-300">{vendor.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-xl border border-slate-200/80 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 lg:col-span-3">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
                        Upcoming Tasks
                        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                          3
                        </span>
                      </h3>
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="glass-card flex cursor-pointer flex-col gap-3 rounded-xl border border-slate-100 p-4 transition-all hover:border-slate-200 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700">
                        <div className="flex items-start justify-between">
                          <div className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-transparent transition-colors hover:border-emerald-500 hover:text-emerald-500 dark:border-slate-700 dark:bg-slate-900" />
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                            Past Due
                          </span>
                        </div>
                        <div>
                          <div className="line-through text-sm font-medium text-slate-400">Finalize guest list</div>
                          <div className="mt-1 text-[11px] text-slate-400">Due Yesterday</div>
                        </div>
                      </div>
                      <div className="glass-card relative flex cursor-pointer flex-col gap-3 rounded-xl border border-rose-100 p-4 shadow-[0_2px_8px_rgba(244,63,94,0.05)] transition-all hover:border-rose-200 dark:border-rose-900/50">
                        <div className="absolute left-0 top-0 h-full w-1 bg-rose-500" />
                        <div className="flex items-start justify-between pl-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-slate-200 bg-white text-transparent transition-colors hover:border-emerald-500 hover:text-emerald-500 dark:border-slate-700 dark:bg-slate-900" />
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-900/30 dark:text-rose-200">
                            High Priority
                          </span>
                        </div>
                        <div className="pl-2">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">Send deposit to Florist</div>
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-500 dark:text-rose-200">
                            <Clock className="h-3 w-3" />
                            Due Today
                          </div>
                        </div>
                      </div>
                      <div className="glass-card flex cursor-pointer flex-col gap-3 rounded-xl border border-slate-200 p-4 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-800">
                        <div className="flex items-start justify-between">
                          <div className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-transparent transition-colors hover:border-emerald-500 hover:text-emerald-500 dark:border-slate-700 dark:bg-slate-900" />
                          <span className="rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
                            Oct 12
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white">
                            Schedule tasting
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">Catering • Main Hall</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vendor Feature Grid */}
        <section className="relative mx-auto mb-24 max-w-7xl px-6">
          <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h2 className="font-serif text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Build your <span className="italic text-slate-700 dark:text-slate-200">vendor team</span>
              </h2>
              <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-300">
                Discover venues, talent, and services tailored to your celebration—cohesive aesthetics, verified partners, and
                effortless outreach in one place.
              </p>
            </div>
            <a
              href="/vendors"
              className="glow-cta"
            >
              <span className="glow-bg" aria-hidden />
              <span className="glow-surface">
                <span className="glow-sparkles" aria-hidden>
                  <span className="sparkle" style={{ left: '12px', top: '8px', animationDelay: '0s' }} />
                  <span className="sparkle" style={{ left: '36px', top: '18px', animationDelay: '0.3s' }} />
                  <span className="sparkle" style={{ left: '72px', top: '10px', animationDelay: '0.6s' }} />
                  <span className="sparkle" style={{ right: '18px', top: '6px', animationDelay: '0.9s' }} />
                  <span className="sparkle" style={{ right: '32px', bottom: '10px', animationDelay: '1.2s' }} />
                </span>
                <span className="glow-label">View all vendors</span>
                <ArrowRight className="glow-icon h-4 w-4" />
              </span>
            </a>
          </div>

          <div className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:auto-rows-[260px] lg:grid-flow-row-dense">
            {previewVendorTiles.map(tile => (
              <a
                key={`${tile.title}-${tile.href}`}
                href={tile.href}
                className={`group relative isolate overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/70 dark:ring-slate-800 ${
                  tile.layout ?? ''
                }`}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url('${tile.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 opacity-90 transition-opacity group-hover:opacity-100 dark:from-black/75 dark:via-black/35" />

                <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-serif font-medium text-white drop-shadow-sm">{tile.title}</h3>
                      <p className="text-xs font-medium uppercase tracking-wide text-white/70">View partners</p>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur group-hover:bg-white/30">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Ideas Section */}
        <section
          id="ideas"
          className="relative mx-auto mb-24 max-w-7xl overflow-hidden bg-[#f7f6f4] px-4 py-12 animate-fade-in dark:bg-[#0f1116] sm:px-6 lg:px-10"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="relative z-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="space-y-1">
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                    Build a healthier relationship with your planning
                  </h2>
                  <p className="max-w-3xl text-sm text-slate-600 sm:text-base dark:text-slate-200/80">
                    Research-backed guides on flow, modern workflows, and using AI as a thinking partner—not just another
                    notification stream.
                  </p>
                </div>
              </div>
              <a
                href="#"
                className="glow-cta"
              >
                <span className="glow-bg" aria-hidden />
                <span className="glow-surface">
                  <span className="glow-sparkles" aria-hidden>
                    <span className="sparkle" style={{ left: '10px', top: '8px', animationDelay: '0s' }} />
                    <span className="sparkle" style={{ left: '32px', top: '20px', animationDelay: '0.35s' }} />
                    <span className="sparkle" style={{ left: '68px', top: '12px', animationDelay: '0.7s' }} />
                    <span className="sparkle" style={{ right: '14px', top: '6px', animationDelay: '1s' }} />
                    <span className="sparkle" style={{ right: '28px', bottom: '12px', animationDelay: '1.4s' }} />
                  </span>
                  <span className="glow-label">View all articles</span>
                  <ArrowUpRight className="glow-icon h-4 w-4" />
                </span>
              </a>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {featuredArticles.map(article => (
                <article
                  key={article.title}
                  className="glass-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(0,0,0,0.12)] dark:border-slate-800 dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                >
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-80" />
                  <div className="absolute left-4 bottom-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700 ring-1 ring-emerald-100 shadow-sm dark:bg-black/70 dark:text-emerald-200 dark:ring-emerald-900/40">
                    {article.category}
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between space-y-3 p-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold leading-snug text-slate-900 dark:text-white">{article.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-200/80">{article.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                    <span>{article.readTime}</span>
                    <span className="inline-flex items-center gap-1 transition group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                      Read <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative mb-24 mx-auto max-w-7xl bg-transparent px-6">
          <div className="mb-12 flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Community Stories
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Real couples and pros sharing their wins, lessons, and favorite vendors.
              </p>
            </div>
            <div className="hidden items-center gap-2 text-slate-400 sm:flex">
              <Quote className="h-4 w-4" />
              <span className="text-sm">Real couples &amp; pros</span>
            </div>
          </div>

          <div className="relative h-[520px] overflow-hidden">
            <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonialsColumns.map(column => (
                <TestimonialColumn key={column.direction + (column.visibility ?? 'all')} {...column} />
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-slate-100 bg-[#f7f6f4] pb-8 pt-16 dark:border-slate-800 dark:bg-[#0f1116]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <a href="#" className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-50 text-sage-700 dark:bg-slate-900 dark:text-sage-200">
                  <Gem className="h-4 w-4" />
                </div>
                <span className="font-serif text-xl font-medium text-slate-900 dark:text-white">TheFesta</span>
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

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="scale-90 md:scale-95">
                <ThemeToggle />
              </div>
              <p>© 2024 TheFesta Inc. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-rose-400" fill="currentColor" />
              <span>for couples everywhere.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

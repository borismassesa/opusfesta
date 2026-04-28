import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle, ArrowRight, SearchX } from 'lucide-react'
import AdviceHero from '@/components/advice-ideas/AdviceHero'
import EditorPicks from '@/components/advice-ideas/EditorPicks'
import SearchForm from '@/components/advice-ideas/SearchForm'
import Byline from '@/components/advice-ideas/Byline'
import {
  ADVICE_IDEAS_BASE_PATH,
  adviceIdeasPosts,
  adviceIdeasTopics,
  heroThumb,
  type AdviceIdeasPost,
  type AdviceIdeasTopic,
} from '@/lib/advice-ideas'

export const metadata: Metadata = {
  title: 'Ideas & Advice | OpusFesta',
  description:
    'Editor picks, planning guides, real weddings and style notes from the OpusFesta editorial team.',
}

// ─── Helpers ─────────────────────────────────────────────────────────────
function postHref(post: AdviceIdeasPost): string {
  return `${ADVICE_IDEAS_BASE_PATH}/${post.slug}`
}

function topicHref(topic: AdviceIdeasTopic): string {
  if (topic.id === 'featured-stories') {
    return `${ADVICE_IDEAS_BASE_PATH}#editor-picks`
  }
  const first = adviceIdeasPosts.find((post) => post.sectionId === topic.id)
  return first ? postHref(first) : ADVICE_IDEAS_BASE_PATH
}

// A stable fallback image cycle for any post missing a hero — kept here so
// the hub never renders a broken <Image>. The post lib already supplies
// heroMedia.src on every entry, so this is defence-in-depth.
const FALLBACK_IMAGE = '/assets/images/coupleswithpiano.jpg'

// Lightweight map from topic id → a cover image so the topic cards feel
// editorial rather than abstract. Pulled from posts in that section when
// available, otherwise falls back.
function topicImage(topic: AdviceIdeasTopic): string {
  const first = adviceIdeasPosts.find((p) => p.sectionId === topic.id)
  return first ? heroThumb(first) : FALLBACK_IMAGE
}

// Match helper — searches title, excerpt, category, and author.
function matchesQuery(post: AdviceIdeasPost, q: string): boolean {
  const needle = q.toLowerCase()
  return (
    post.title.toLowerCase().includes(needle) ||
    post.excerpt.toLowerCase().includes(needle) ||
    post.category.toLowerCase().includes(needle) ||
    post.author.toLowerCase().includes(needle)
  )
}

// ─── Page ────────────────────────────────────────────────────────────────
export default async function AdviceAndIdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const searchMode = query.length > 0
  const searchResults = searchMode
    ? adviceIdeasPosts.filter((p) => matchesQuery(p, query))
    : []

  const featured = adviceIdeasPosts.filter((p) => p.featured)
  const remaining = adviceIdeasPosts.filter((p) => !p.featured)

  const editorPicks =
    featured.length >= 5
      ? featured.slice(0, 5)
      : [...featured, ...remaining.slice(0, 5 - featured.length)]

  const trending = featured[0] ?? adviceIdeasPosts[0]

  const lovedByCouples = remaining.slice(0, 4)

  const favoritesFeatured = remaining[4] ?? remaining[0]
  const favoritesStack = remaining
    .filter((post) => post.id !== favoritesFeatured?.id)
    .slice(0, 3)

  const latest = [...adviceIdeasPosts].reverse().slice(0, 12)

  return (
    <main>
      {/* ── Topics strip + search (sticky above the hero) ─────────────── */}
      <div className="sticky top-0 z-30 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-8">
          <nav aria-label="Browse topics" className="min-w-0 md:flex-1">
            <ul className="hide-scrollbar flex gap-6 overflow-x-auto pr-6 text-sm md:pr-4">
              {adviceIdeasTopics.map((t) => (
                <li key={t.id} className="shrink-0">
                  <Link
                    href={topicHref(t)}
                    className="whitespace-nowrap font-medium text-white/80 transition-colors hover:text-[var(--accent)]"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="shrink-0">
            <Suspense fallback={null}>
              <SearchForm />
            </Suspense>
          </div>
        </div>
      </div>

      {/* ── Hero (rotating text + parallax images) ──────────────────── */}
      <AdviceHero />

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl space-y-24 px-4 py-16 md:py-20">

        {searchMode && (
          <SearchResults query={query} results={searchResults} />
        )}

        {!searchMode && (
        <>
        {/* Editor Picks — magazine-style hero + 3 stacked */}
        <EditorPicks posts={editorPicks} />

        {/* Popular Topics */}
        <Section id="popular-topics" title="Popular Topics">
          <ul className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 xl:grid-cols-4">
            {adviceIdeasTopics.map((t) => (
              <li key={t.id}>
                <TopicCard topic={t} />
              </li>
            ))}
          </ul>
        </Section>

        {/* Loved by Couples */}
        <Section
          title="Loved by Couples"
          subtitle="Expert tips, tricks, and wedding planning ideas our readers keep coming back to."
          action={
            <Link
              href={`${ADVICE_IDEAS_BASE_PATH}#latest-stories`}
              className="hidden items-center gap-1.5 text-[13px] font-semibold text-[#1A1A1A] underline-offset-4 transition-colors hover:text-[var(--accent-hover)] hover:underline md:inline-flex"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          }
        >
          {/* Featured split card — light treatment, refined copy, single label */}
          <Link
            href={postHref(trending)}
            className="group mb-12 block overflow-hidden rounded-lg lg:flex"
          >
            <div className="relative aspect-video w-full bg-slate-100 lg:aspect-auto lg:w-3/5">
              <Image
                src={heroThumb(trending)}
                alt={trending.heroMedia.alt}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
              {trending.heroMedia.type === 'video' && (
                <div className="absolute bottom-4 left-4 rounded-full bg-black/50 p-1.5 text-white">
                  <PlayCircle size={22} />
                </div>
              )}
            </div>
            <div className="flex w-full flex-col justify-center bg-[#1A1A1A] p-8 text-white md:p-10 lg:w-2/5 lg:p-12">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                {trending.category}
              </p>
              <h3 className="mb-4 text-xl font-bold leading-[1.15] tracking-tight transition-all group-hover:underline decoration-[var(--accent)] decoration-2 underline-offset-4 sm:text-2xl md:text-[28px]">
                {trending.title}
              </h3>
              <p className="mb-5 text-[15px] leading-relaxed text-slate-300">
                {trending.excerpt}
              </p>
              <Byline post={trending} tone="on-dark" withReadTime />
              <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--accent)] transition-transform group-hover:translate-x-1">
                Read story
                <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {lovedByCouples.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </Section>

        {/* Our Favorites (cream accent block) */}
        <Section
          title="Our Favorites"
          subtitle="The OpusFesta editorial team. Fashion editors, honeymoon writers, and etiquette voices share their stories of the moment."
          action={
            <Link
              href={`${ADVICE_IDEAS_BASE_PATH}#latest-stories`}
              className="hidden items-center gap-1.5 text-[13px] font-semibold text-[#1A1A1A] underline-offset-4 transition-colors hover:text-[var(--accent-hover)] hover:underline md:inline-flex"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          }
          wrap={(children) => (
            <div className="-mx-4 rounded-2xl bg-[#FAF7F2] p-6 sm:p-8 md:p-12 lg:mx-0">
              {children}
            </div>
          )}
        >
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">

            {/* Featured favorite — left half */}
            {favoritesFeatured && (
              <Link
                href={postHref(favoritesFeatured)}
                className="group block w-full lg:w-1/2"
              >
                <div className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                  <Image
                    src={heroThumb(favoritesFeatured)}
                    alt={favoritesFeatured.heroMedia.alt}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  {favoritesFeatured.heroMedia.type === 'video' && (
                    <div className="absolute bottom-4 left-4 rounded-full bg-black/50 p-1.5 text-white">
                      <PlayCircle size={22} />
                    </div>
                  )}
                </div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-hover)]">
                  {favoritesFeatured.category}
                </p>
                <h3 className="mb-3 text-xl font-bold leading-[1.15] tracking-tight text-[#1A1A1A] transition-all group-hover:underline underline-offset-4 decoration-2 sm:text-2xl md:text-[28px]">
                  {favoritesFeatured.title}
                </h3>
                <p className="mb-4 max-w-xl text-[15px] leading-relaxed text-gray-600">
                  {favoritesFeatured.excerpt}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                  <Byline post={favoritesFeatured} withReadTime />
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--accent-hover)] transition-transform group-hover:translate-x-1">
                    Read story
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            )}

            {/* Stacked favorites — right half */}
            <ul className="flex w-full flex-col gap-4 lg:w-1/2">
              {favoritesStack.map((post) => (
                <li
                  key={post.id}
                  className="rounded-xl border border-slate-200 bg-white/80 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                >
                  <Link
                    href={postHref(post)}
                    className="group grid grid-cols-[104px_1fr] items-center gap-4 p-4 sm:grid-cols-[128px_1fr] sm:gap-5 sm:p-5"
                  >
                    <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <Image
                        src={heroThumb(post)}
                        alt={post.heroMedia.alt}
                        fill
                        sizes="128px"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      {post.heroMedia.type === 'video' && (
                        <div className="absolute bottom-2 left-2 rounded-full bg-black/55 p-1 text-white">
                          <PlayCircle size={16} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-hover)]">
                        {post.category}
                      </p>
                      <h4 className="mb-2 line-clamp-3 text-[15px] font-bold leading-[1.3] text-[#1A1A1A] transition-all group-hover:underline underline-offset-2 decoration-2 sm:text-[16px]">
                        {post.title}
                      </h4>
                      <Byline post={post} compact />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Latest Stories */}
        <Section
          id="latest-stories"
          title="Latest Stories"
          subtitle="Fresh planning advice, style notes, and real wedding stories from across the OpusFesta journal."
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </Section>
        </>
        )}

      </div>
    </main>
  )
}

// ─── Search results ──────────────────────────────────────────────────────
function SearchResults({
  query,
  results,
}: {
  query: string
  results: AdviceIdeasPost[]
}) {
  return (
    <section>
      <header className="mb-8 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-hover)]">
            Search results
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl md:text-2xl">
            {results.length} {results.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
          </h2>
        </div>
        <Link
          href={ADVICE_IDEAS_BASE_PATH}
          className="text-sm font-medium text-slate-600 transition-colors hover:text-[var(--accent-hover)]"
        >
          ← Clear search
        </Link>
      </header>

      {results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <SearchX size={32} className="text-slate-400" aria-hidden />
          <h3 className="text-lg font-bold text-slate-900">No stories match &ldquo;{query}&rdquo;</h3>
          <p className="max-w-md text-sm text-slate-500">
            Try a shorter query, a different keyword, or browse topics from the nav above.
          </p>
          <Link
            href={ADVICE_IDEAS_BASE_PATH}
            className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)]"
          >
            Back to the hub
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Reusable section shell ──────────────────────────────────────────────
function Section({
  id,
  title,
  subtitle,
  action,
  children,
  wrap,
}: {
  id?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  wrap?: (inner: React.ReactNode) => React.ReactNode
}) {
  const inner = (
    <>
      <header className="mb-6 flex items-end justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl md:text-2xl">{title}</h2>
          {subtitle && (
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </>
  )
  return <section id={id} className="scroll-mt-20">{wrap ? wrap(inner) : inner}</section>
}

// ─── Article card ───────────────────────────────────────────────────────
function ArticleCard({ post }: { post: AdviceIdeasPost }) {
  const isVideo = post.heroMedia.type === 'video'
  return (
    <Link href={postHref(post)} className="group flex h-full cursor-pointer flex-col">
      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
        <Image
          src={heroThumb(post)}
          alt={post.heroMedia.alt}
          fill
          sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {isVideo && (
          <div className="absolute bottom-2 left-2 rounded-full bg-black/50 p-1 text-white">
            <PlayCircle size={22} />
          </div>
        )}
      </div>
      <div className="flex flex-grow flex-col">
        {/* Category now sits above the title in accent colour, not a white
            badge over the image — easier to scan + consistent with picks. */}
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-hover)]">
          {post.category}
        </p>
        <h3 className="mb-3 line-clamp-3 text-[15px] font-bold leading-[1.3] text-[#1A1A1A] transition-all group-hover:underline decoration-2 underline-offset-2">
          {post.title}
        </h3>
        <div className="mt-auto">
          <Byline post={post} compact />
        </div>
      </div>
    </Link>
  )
}

// ─── Topic card ─────────────────────────────────────────────────────────
function TopicCard({ topic }: { topic: AdviceIdeasTopic }) {
  return (
    <Link
      href={topicHref(topic)}
      className="group flex items-center gap-4"
    >
      <div className="relative aspect-[1.45/1] w-[9.75rem] shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-[10.5rem]">
        <Image
          src={topicImage(topic)}
          alt={topic.label}
          fill
          sizes="(min-width: 1280px) 168px, (min-width: 640px) 42vw, 156px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <span className="max-w-[10rem] text-[15px] font-bold leading-[1.3] text-[#1A1A1A] transition-all group-hover:text-[var(--accent-hover)] group-hover:underline underline-offset-2 decoration-2 sm:text-[16px]">
        {topic.label}
      </span>
    </Link>
  )
}

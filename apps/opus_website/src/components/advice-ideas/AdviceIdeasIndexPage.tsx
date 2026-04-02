import Link from 'next/link'
import Reveal from '@/components/ui/Reveal'
import StaggerReveal from '@/components/ui/StaggerReveal'
import AdviceIdeaCard from '@/components/advice-ideas/AdviceIdeaCard'
import {
  ADVICE_IDEAS_BASE_PATH,
  adviceIdeasPosts,
  adviceIdeasTopics,
  getAdviceIdeasPostsBySection,
  getAdviceIdeasHref,
} from '@/lib/advice-ideas'

const featuredPosts = adviceIdeasPosts.filter((post) => post.featured)
const latestPosts = adviceIdeasPosts.slice(0, 6)
const planningPosts = getAdviceIdeasPostsBySection('planning-guides')
const realWeddingPosts = getAdviceIdeasPostsBySection('real-weddings')
const stylePosts = getAdviceIdeasPostsBySection('themes-styles')
const etiquettePosts = getAdviceIdeasPostsBySection('etiquette-wording')
const celebrationPosts = [
  ...getAdviceIdeasPostsBySection('bridal-shower-ideas'),
  ...getAdviceIdeasPostsBySection('honeymoon-ideas'),
]
const editorialContainerClass = 'mx-auto max-w-[80rem]'
const latestEditorialPosts = adviceIdeasPosts.filter((post) => !post.featured).slice(0, 3)

export default function AdviceIdeasIndexPage() {
  const leadPost = featuredPosts[0] ?? adviceIdeasPosts[0]
  const heroSidePosts = featuredPosts.slice(1, 3)
  const realWeddingHighlights = [
    ...realWeddingPosts,
    ...latestPosts.filter((post) => post.sectionId !== 'real-weddings'),
  ].slice(0, 3)

  return (
    <main className="bg-[#FFFFFF] text-[#1A1A1A]">
      <section className="px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20 md:pb-20 md:pt-24">
        <div className={editorialContainerClass}>
          <Reveal direction="up" className="mx-auto max-w-5xl text-center">
            <span className="text-(--accent) text-xs font-black uppercase tracking-[0.3em]">Advice & Ideas</span>
            <h1 className="mx-auto mt-5 w-full max-w-[9ch] text-[1.6rem] font-black uppercase leading-[0.9] tracking-tighter sm:max-w-none sm:text-6xl sm:leading-[0.92] md:text-7xl lg:text-[92px]">
              Editorial ideas for a wedding that still feels like you.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-relaxed text-gray-600 sm:text-lg">
              Real weddings, planning notes, hosting scripts, and style stories designed with the same OpusFesta energy: bold, intentional, and easy to move through.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="#featured-stories"
                className="rounded-full bg-[#1A1A1A] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#333333]"
              >
                Browse stories
              </Link>
              <Link
                href={getAdviceIdeasHref(leadPost.slug)}
                className="rounded-full px-6 py-3 text-sm font-bold underline underline-offset-4 transition-colors hover:bg-gray-100"
              >
                Read the cover story
              </Link>
            </div>
          </Reveal>

          <div id="featured-stories" className="mt-12 grid gap-4 sm:mt-14 sm:gap-5 xl:grid-cols-[1.08fr_0.92fr] xl:items-start xl:gap-6">
            <Reveal direction="up">
              <AdviceIdeaCard post={leadPost} mediaClassName="aspect-[16/9]" />
            </Reveal>
            <div className="grid gap-4 sm:gap-5">
              {heroSidePosts.map((post, index) => (
                <Reveal key={post.slug} direction="up" delay={0.08 * (index + 1)}>
                  <AdviceIdeaCard post={post} compact mediaClassName="aspect-[16/10]" />
                </Reveal>
              ))}
            </div>
          </div>

          <StaggerReveal className="mt-5 grid gap-4 lg:grid-cols-3 sm:gap-5" delayChildren={0.08}>
            {latestEditorialPosts.map((post) => (
              <AdviceIdeaCard key={post.slug} post={post} compact mediaClassName="aspect-[16/10]" />
            ))}
          </StaggerReveal>
        </div>
      </section>

      <section className="border-y border-gray-200 bg-[#FAF7FB] px-4 py-5 sm:px-6">
        <div className={editorialContainerClass}>
          <StaggerReveal className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar" itemClassName="shrink-0">
            {adviceIdeasTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`#${topic.id}`}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold whitespace-nowrap text-[#1A1A1A] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)]"
              >
                {topic.label}
              </Link>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 md:py-20" id="planning-guides">
        <div className={editorialContainerClass}>
          <Reveal direction="up" className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-(--accent) text-xs font-black uppercase tracking-[0.24em]">Planning Guides</p>
              <h2 className="mt-3 text-[2rem] font-black uppercase tracking-tighter sm:text-5xl md:text-6xl">
                The sharp stuff.
              </h2>
            </div>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-gray-600 sm:text-base">
              Smart planning is not about more spreadsheets. It is about clearer decisions, better pacing, and knowing what deserves your energy.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.02fr_0.98fr] xl:items-start xl:gap-6">
            <Reveal direction="up">
              <AdviceIdeaCard post={planningPosts[0]} tone="dark" mediaClassName="aspect-[16/9]" />
            </Reveal>
            <div className="grid gap-4 sm:gap-5">
              <StaggerReveal className="grid gap-4 sm:gap-5" delayChildren={0.06}>
                {planningPosts.slice(1).map((post) => (
                  <AdviceIdeaCard key={post.slug} post={post} compact mediaClassName="aspect-[16/10]" />
                ))}
              </StaggerReveal>
              <Reveal direction="up" delay={0.12} className="rounded-[28px] border border-gray-200 bg-[#FAF7FB] p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent-hover)]">Start Here</p>
                <h3 className="mt-3 text-2xl font-black uppercase tracking-tighter leading-none">
                  Protect the budget, guest count, and pace first.
                </h3>
                <p className="mt-4 text-sm font-medium leading-relaxed text-gray-600">
                  The strongest planning decisions usually solve one of three things: comfort, timing, or clarity. If a choice does none of those, it probably does not need to happen now.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['Budget ceiling', 'Vendor shortlist', 'Guest flow'].map((item) => (
                    <span key={item} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-[#1A1A1A]">
                      {item}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F4E8F7] px-4 py-12 sm:px-6 sm:py-16 md:py-20" id="real-weddings">
        <div className={editorialContainerClass}>
          <Reveal direction="up" className="mb-8 flex flex-col gap-3 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[var(--on-accent)] text-xs font-black uppercase tracking-[0.24em]">Real Weddings</p>
              <h2 className="mt-3 text-[2rem] font-black uppercase tracking-tighter sm:text-5xl md:text-6xl">
                Celebrations with point of view.
              </h2>
            </div>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-gray-700 sm:text-base">
              Weddings we would actually bookmark: strong atmosphere, thoughtful styling, and details that feel specific instead of generic.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1.05fr_0.95fr] xl:items-start xl:gap-6">
            <Reveal direction="left">
              <AdviceIdeaCard post={realWeddingHighlights[0]} mediaClassName="aspect-[16/9]" />
            </Reveal>
            <StaggerReveal className="grid gap-4 sm:gap-5" delayChildren={0.06}>
              {realWeddingHighlights.slice(1).map((post) => (
                <AdviceIdeaCard key={post.slug} post={post} compact mediaClassName="aspect-[16/10]" />
              ))}
            </StaggerReveal>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 sm:py-16 md:py-20" id="themes-styles">
        <div className={editorialContainerClass}>
          <Reveal direction="up" className="mb-8">
            <p className="text-(--accent) text-xs font-black uppercase tracking-[0.24em]">Style Notes</p>
            <h2 className="mt-3 text-[2rem] font-black uppercase tracking-tighter sm:text-5xl md:text-6xl">
              Design, wording, and everything around the edges.
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:gap-5 xl:grid-cols-[1fr_1.08fr] xl:gap-6">
            <div className="space-y-4 rounded-[32px] border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-black uppercase tracking-tighter sm:text-3xl">Themes & Styles</h3>
                <Link href={`#themes-styles`} className="text-sm font-bold underline underline-offset-4">View section</Link>
              </div>
              <StaggerReveal className="grid gap-4">
                {stylePosts.map((post) => (
                  <AdviceIdeaCard key={post.slug} post={post} compact mediaClassName="aspect-[16/10]" />
                ))}
              </StaggerReveal>
            </div>
            <div className="space-y-4 rounded-[32px] bg-[#111111] p-5 text-white sm:p-6" id="etiquette-wording">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-black uppercase tracking-tighter sm:text-3xl">Etiquette & Wording</h3>
                <Link href={`#etiquette-wording`} className="text-sm font-bold underline underline-offset-4 text-white/80">View section</Link>
              </div>
              <StaggerReveal className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                {etiquettePosts.map((post) => (
                  <AdviceIdeaCard key={post.slug} post={post} compact tone="dark" mediaClassName="aspect-[16/10]" />
                ))}
              </StaggerReveal>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 sm:pb-16 md:pb-20" id="bridal-shower-ideas">
        <div className={editorialContainerClass}>
          <Reveal direction="up" className="mb-8 flex flex-col gap-3 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-(--accent) text-xs font-black uppercase tracking-[0.24em]">Celebrations & Getaways</p>
              <h2 className="mt-3 text-[2rem] font-black uppercase tracking-tighter sm:text-5xl md:text-6xl">
                Pre-wedding plans worth leaving the group chat for.
              </h2>
            </div>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-gray-600 sm:text-base">
              Showers, engagement weekends, mini-moons, and the softer stories that shape the weeks around the main event.
            </p>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_0.78fr] xl:gap-6 sm:gap-5">
            <StaggerReveal className="grid gap-4 md:grid-cols-2 sm:gap-5 xl:col-span-2" delayChildren={0.06}>
              {celebrationPosts.map((post) => (
                <AdviceIdeaCard key={post.slug} post={post} compact mediaClassName="aspect-[16/10]" />
              ))}
            </StaggerReveal>
            <Reveal direction="up" delay={0.12} className="rounded-[28px] bg-[#111111] p-5 text-white sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/55">Editor&apos;s Note</p>
              <h3 className="mt-3 text-2xl font-black uppercase tracking-tighter leading-none">
                Keep the pre-wedding plans lighter than the main event.
              </h3>
              <p className="mt-4 text-sm font-medium leading-relaxed text-white/72">
                The best showers, engagement dinners, and mini-moons feel directional but not overproduced. Give people one memorable scene and enough room to actually enjoy it.
              </p>
              <Link
                href={ADVICE_IDEAS_BASE_PATH}
                className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                Browse all ideas
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 sm:pb-18 md:pb-22" id="honeymoon-ideas">
        <div className={`${editorialContainerClass} rounded-[32px] bg-[#1A1A1A] px-6 py-8 text-white sm:px-8 sm:py-10 md:px-10 md:py-12`}>
          <Reveal direction="up" className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-white/55 text-xs font-black uppercase tracking-[0.24em]">Keep exploring</p>
              <h2 className="mt-3 text-[2rem] font-black uppercase tracking-tighter sm:text-5xl">
                More ideas, less noise.
              </h2>
              <p className="mt-4 text-sm font-medium leading-relaxed text-white/72 sm:text-base">
                Start with the editorial index, then move into the stories that actually match your pace, style, and guest experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={ADVICE_IDEAS_BASE_PATH}
                className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-bold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                All articles
              </Link>
              <Link
                href="#featured-stories"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Back to top
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}

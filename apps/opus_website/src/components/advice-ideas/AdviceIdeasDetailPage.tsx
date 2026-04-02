import Link from 'next/link'
import Reveal from '@/components/ui/Reveal'
import StaggerReveal from '@/components/ui/StaggerReveal'
import AdviceIdeaCard from '@/components/advice-ideas/AdviceIdeaCard'
import {
  ADVICE_IDEAS_BASE_PATH,
  type AdviceIdeasBlock,
  type AdviceIdeasPost,
  adviceIdeasPosts,
} from '@/lib/advice-ideas'

function renderBlock(block: AdviceIdeasBlock) {
  if (block.type === 'paragraph') {
    return <p className="text-base leading-8 text-gray-700 sm:text-lg">{block.text}</p>
  }

  if (block.type === 'list') {
    const ListTag = block.ordered ? 'ol' : 'ul'
    return (
      <ListTag className={`space-y-3 pl-5 text-base leading-8 text-gray-700 sm:text-lg ${block.ordered ? 'list-decimal' : 'list-disc'}`}>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ListTag>
    )
  }

  if (block.type === 'quote') {
    return (
      <div className="rounded-[28px] bg-[#111111] px-6 py-7 text-white sm:px-8 sm:py-9">
        <p className="text-2xl font-black uppercase tracking-tighter leading-[1.04] sm:text-3xl">
          “{block.quote}”
        </p>
        {block.attribution ? <p className="mt-4 text-sm font-semibold text-white/65">{block.attribution}</p> : null}
      </div>
    )
  }

  return (
    <div className="rounded-[24px] border border-[var(--accent)] bg-[#FAF3FC] p-5 sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent-hover)]">{block.title}</p>
      <p className="mt-3 text-base leading-7 text-gray-700 sm:text-lg">{block.text}</p>
    </div>
  )
}

export default function AdviceIdeasDetailPage({ post }: { post: AdviceIdeasPost }) {
  const relatedPosts = [
    ...adviceIdeasPosts.filter(
      (candidate) =>
        candidate.slug !== post.slug &&
        (candidate.sectionId === post.sectionId || candidate.category === post.category),
    ),
    ...adviceIdeasPosts.filter(
      (candidate) =>
        candidate.slug !== post.slug &&
        candidate.sectionId !== post.sectionId &&
        candidate.category !== post.category,
    ),
  ].slice(0, 3)

  const initials = post.author
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)

  return (
    <main className="bg-[#FFFFFF] text-[#1A1A1A]">
      <section className="px-4 pb-12 pt-16 sm:px-6 sm:pb-14 sm:pt-20 md:pb-16 md:pt-24">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up" className="max-w-4xl">
            <Link
              href={ADVICE_IDEAS_BASE_PATH}
              className="text-(--accent-hover) text-xs font-black uppercase tracking-[0.24em] transition-colors hover:text-[#1A1A1A]"
            >
              Back to all stories
            </Link>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
              <span>{post.category}</span>
              <span>/</span>
              <span>{post.date}</span>
              <span>/</span>
              <span>{post.readTime}</span>
            </div>
            <h1 className="mt-5 w-full max-w-[10ch] text-[1.75rem] font-black uppercase leading-[0.9] tracking-tighter sm:max-w-none sm:text-6xl sm:leading-[0.92] md:text-7xl">
              {post.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base font-medium leading-relaxed text-gray-600 sm:text-xl">
              {post.description}
            </p>
            <div className="mt-7 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111111] text-sm font-black uppercase text-white">
                {initials}
              </div>
              <div>
                <p className="font-bold text-[#1A1A1A]">{post.author}</p>
                <p className="text-sm font-medium text-gray-500">{post.authorRole}</p>
              </div>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.08} className="mt-10 overflow-hidden rounded-[32px] border border-gray-200 bg-gray-100 shadow-xl">
            <div className="aspect-[4/5] sm:aspect-[16/10] md:aspect-[16/8]">
              {post.heroMedia.type === 'video' ? (
                <video
                  src={post.heroMedia.src}
                  poster={post.heroMedia.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.heroMedia.src} alt={post.heroMedia.alt} className="h-full w-full object-cover" />
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 sm:pb-18 md:pb-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
          <div className="space-y-10">
            {post.body.map((section, index) => (
              <Reveal key={section.id} direction="up" delay={0.04 * index} className="space-y-5" >
                {section.label ? (
                  <p className="text-(--accent-hover) text-xs font-black uppercase tracking-[0.24em]">
                    {section.label}
                  </p>
                ) : null}
                <h2 id={section.id} className="text-[1.9rem] font-black uppercase tracking-tighter leading-[0.98] sm:text-4xl">
                  {section.heading}
                </h2>
                <div className="space-y-5">
                  {section.blocks.map((block, blockIndex) => (
                    <div key={`${section.id}-${blockIndex}`}>{renderBlock(block)}</div>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal direction="left" className="hidden lg:block">
            <div className="sticky top-24 rounded-[28px] border border-gray-200 bg-[#FAF7FB] p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--accent-hover)]">On this page</p>
              <div className="mt-4 flex flex-col gap-2">
                {post.body.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-2xl px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-white hover:text-[#1A1A1A]"
                  >
                    {section.heading}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-gray-200 px-4 py-14 sm:px-6 sm:py-18 md:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal direction="up" className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-(--accent-hover) text-xs font-black uppercase tracking-[0.24em]">Related Advice</p>
              <h2 className="mt-3 text-[2rem] font-black uppercase tracking-tighter sm:text-5xl">
                Keep reading.
              </h2>
            </div>
            <Link href={ADVICE_IDEAS_BASE_PATH} className="text-sm font-bold underline underline-offset-4">
              View all articles
            </Link>
          </Reveal>
          <StaggerReveal className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-5">
            {relatedPosts.map((relatedPost) => (
              <AdviceIdeaCard key={relatedPost.slug} post={relatedPost} compact mediaClassName="aspect-[16/10]" />
            ))}
          </StaggerReveal>
        </div>
      </section>
    </main>
  )
}

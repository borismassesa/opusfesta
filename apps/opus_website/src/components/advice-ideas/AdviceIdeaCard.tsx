import Link from 'next/link'
import type { AdviceIdeasPost } from '@/lib/advice-ideas'
import { ADVICE_IDEAS_BASE_PATH } from '@/lib/advice-ideas'

type AdviceIdeaCardProps = {
  post: AdviceIdeasPost
  tone?: 'light' | 'dark'
  compact?: boolean
  mediaClassName?: string
  className?: string
}

export default function AdviceIdeaCard({
  post,
  tone = 'light',
  compact = false,
  mediaClassName = 'aspect-[16/10]',
  className = '',
}: AdviceIdeaCardProps) {
  const dark = tone === 'dark'

  return (
    <Link
      href={`${ADVICE_IDEAS_BASE_PATH}/${post.slug}`}
      className={`group flex w-full flex-col overflow-hidden rounded-[24px] border transition-all duration-300 hover:-translate-y-1 ${dark ? 'border-black bg-[#111111] text-white hover:bg-[#1A1A1A]' : 'border-gray-200 bg-white text-[#1A1A1A] hover:border-gray-300'} ${className}`}
    >
      <div className={`relative overflow-hidden ${mediaClassName}`}>
        {post.heroMedia.type === 'video' ? (
          <video
            src={post.heroMedia.src}
            poster={post.heroMedia.poster}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.heroMedia.src}
            alt={post.heroMedia.alt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className={`flex flex-1 flex-col ${compact ? 'gap-2.5 p-4 sm:p-[18px]' : 'gap-3 p-4 sm:p-5'}`}>
        <div className={`flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] ${dark ? 'text-white/65' : 'text-gray-400'}`}>
          <span>{post.category}</span>
          <span className={dark ? 'text-white/35' : 'text-gray-300'}>/</span>
          <span>{post.readTime}</span>
        </div>
        <div className="space-y-2">
          <h3 className={`${compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'} font-black uppercase tracking-tighter leading-[1.02]`}>
            {post.title}
          </h3>
          <p className={`${compact ? 'text-[13px] sm:text-sm' : 'text-sm sm:text-[15px]'} leading-relaxed ${dark ? 'text-white/72' : 'text-gray-600'}`}>
            {post.excerpt}
          </p>
        </div>
        <div className={`mt-auto flex items-center justify-between gap-3 pt-1 text-sm font-semibold ${dark ? 'text-white/72' : 'text-gray-500'}`}>
          <span>{post.author}</span>
          <span className={dark ? 'text-white' : 'text-[#1A1A1A]'}>Read story</span>
        </div>
      </div>
    </Link>
  )
}

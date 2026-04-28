import { Clock } from 'lucide-react'
import type { AdviceIdeasPost } from '@/lib/advice-ideas'

// Shared byline used across every post card on the hub.
//
//   compact      → smaller text + just author · date (e.g. stacked picks,
//                  article grid cards)
//   withRole     → adds author title after the name (hero pick only)
//   withReadTime → adds clock icon + read-time at the end
//   tone         → 'default' (light surfaces, dark text) or 'on-dark' (for
//                  dark background cards like Loved by Couples feature)
export default function Byline({
  post,
  withRole = false,
  withReadTime = false,
  compact = false,
  tone = 'default',
}: {
  post: AdviceIdeasPost
  withRole?: boolean
  withReadTime?: boolean
  compact?: boolean
  tone?: 'default' | 'on-dark'
}) {
  const textSize = compact ? 'text-[11px]' : 'text-[12px]'
  const wrapper =
    tone === 'on-dark'
      ? `${textSize} text-slate-400`
      : `${textSize} text-gray-600`
  const nameColor = tone === 'on-dark' ? 'text-white' : 'text-[#1A1A1A]'
  const sepColor = tone === 'on-dark' ? 'text-slate-600' : 'text-slate-300'
  const iconColor = tone === 'on-dark' ? 'text-slate-400' : 'text-slate-400'

  return (
    <div className={`flex flex-wrap items-center gap-x-2.5 gap-y-0.5 ${wrapper}`}>
      <span className={`font-semibold ${nameColor}`}>{post.author}</span>
      {withRole && (
        <>
          <span className={sepColor} aria-hidden>•</span>
          <span>{post.authorRole}</span>
        </>
      )}
      <span className={sepColor} aria-hidden>•</span>
      <time>{post.date}</time>
      {withReadTime && (
        <>
          <span className={sepColor} aria-hidden>•</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={11} className={iconColor} aria-hidden />
            {post.readTime}
          </span>
        </>
      )}
    </div>
  )
}

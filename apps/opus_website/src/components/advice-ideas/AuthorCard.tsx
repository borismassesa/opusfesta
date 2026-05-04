import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import {
  ADVICE_IDEAS_BASE_PATH,
  type AdviceIdeasAuthor,
} from '@/lib/advice-ideas'

export default function AuthorCard({ author }: { author: AdviceIdeasAuthor }) {
  const firstName = author.name.split(' ')[0].replace('.', '')
  return (
    <aside className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-start sm:p-7">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FAF7F2] text-[15px] font-bold tracking-wide text-[var(--accent-hover)] sm:h-16 sm:w-16 sm:text-[16px]">
        {author.avatarUrl ? (
          <Image
            src={author.avatarUrl}
            alt={author.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <span aria-hidden>{author.initials}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
          Written by
        </p>
        <p className="mt-1 text-[18px] font-bold text-[#1A1A1A]">{author.name}</p>
        {author.role && (
          <p className="text-[13px] text-gray-600">{author.role}</p>
        )}
        {author.bio && (
          <p className="mt-3 text-[14px] leading-relaxed text-gray-700">
            {author.bio}
          </p>
        )}
        <Link
          href={`${ADVICE_IDEAS_BASE_PATH}?q=${encodeURIComponent(author.name)}`}
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--accent-hover)] underline-offset-4 hover:underline"
        >
          More from {firstName}
          <ArrowRight size={14} />
        </Link>
      </div>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useScrollCarousel } from '@/hooks/useScrollCarousel'
import type { InvitationCategoryCms } from '@/lib/cms/invitations-categories'

export function ShopByCategoryCarousel({ categories }: { categories: InvitationCategoryCms[] }) {
  const { scrollRef, progress, scrollNext, scrollPrev } = useScrollCarousel()

  return (
    <div>
      <div className="relative group">
        <div
          ref={scrollRef}
          className="flex gap-5 sm:gap-6 md:gap-8 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/invitations/${cat.slug}`}
              className="group flex flex-col items-center text-center shrink-0 snap-start w-[110px] sm:w-[130px] md:w-[calc((100%-128px)/5)]"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-full bg-white ring-1 ring-gray-200 mb-3 transition-shadow group-hover:shadow-md">
                <Image
                  src={cat.img}
                  alt={cat.alt}
                  fill
                  sizes="(min-width: 768px) 20vw, 130px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-gray-800 group-hover:underline leading-tight">
                {cat.label}
                <ArrowRight size={14} className="shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>

        {progress > 1 && (
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Scroll left"
            className="hidden md:grid absolute top-1/2 -translate-y-1/2 left-2 h-10 w-10 place-items-center rounded-full bg-[#1A1A1A]/80 shadow-lg hover:bg-[#1A1A1A] z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
        )}

        {progress < 99 && (
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Scroll right"
            className="hidden md:grid absolute top-1/2 -translate-y-1/2 right-2 h-10 w-10 place-items-center rounded-full bg-[#1A1A1A]/80 shadow-lg hover:bg-[#1A1A1A] z-10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        )}
      </div>
    </div>
  )
}

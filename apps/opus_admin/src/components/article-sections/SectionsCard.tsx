'use client'

import {
  stripLeadingHeadingNumber,
  type AdviceIdeasBodySection,
} from '@/lib/cms/advice-ideas'

// Live preview of the article's sections — what the reader will see in the
// floating right-rail TOC on the published page. Each "Heading 2" the author
// inserts in the editor body becomes one section here, numbered 1, 2, 3…
//
// Sections are always numbered — the order is the source of truth, so any
// leading "1." / "2." the author manually typed into the heading is stripped
// before display so the result is single-numbered (not "1. 1. Topic").
//
// Used in both the contributor RightRail and the admin PostEditor so writers
// always have a visible mapping between "I just added an H2" → "I just added
// section N to the TOC".
export default function SectionsCard({
  body,
}: {
  body: AdviceIdeasBodySection[]
}) {
  // Only headings count as TOC entries — bare-paragraph sections (no H2) are
  // valid in the data model but don't get a TOC entry on the live site.
  const sections = body.filter((s) => s.heading?.trim())
  const hasUnnamed = body.some((s) => !s.heading?.trim() && s.blocks.length > 0)

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3.5">
      <header className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-gray-500">
          Sections
        </p>
        <span className="text-[11px] tabular-nums text-gray-400">
          {sections.length}
        </span>
      </header>

      {sections.length === 0 ? (
        <p className="mt-3 text-[11px] leading-5 text-gray-500">
          Insert a{' '}
          <span className="font-semibold text-gray-700">Heading&nbsp;2</span>{' '}
          in the body to start a new section. Each one is numbered
          automatically and shows in the table of contents on the live article.
        </p>
      ) : (
        <ol className="mt-3 space-y-1.5">
          {sections.map((section, index) => (
            <li
              key={section.id}
              className="flex gap-2 text-[12px] leading-5 text-gray-700"
            >
              <span className="w-5 shrink-0 font-semibold tabular-nums text-gray-400">
                {index + 1}.
              </span>
              <span className="line-clamp-2 break-words">
                {stripLeadingHeadingNumber(section.heading ?? '')}
              </span>
            </li>
          ))}
        </ol>
      )}

      {hasUnnamed && (
        <p className="mt-3 border-t border-dashed border-gray-200 pt-2 text-[11px] leading-5 text-amber-700">
          Some content sits before the first Heading&nbsp;2 — it will render
          on the page but won&apos;t appear in the TOC.
        </p>
      )}
    </section>
  )
}

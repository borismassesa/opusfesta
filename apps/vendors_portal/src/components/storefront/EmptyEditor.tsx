import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function EmptyEditor({
  eyebrow,
  title,
  description,
  icon,
  children,
  cta,
}: {
  eyebrow?: string
  title: string
  description: string
  icon: ReactNode
  children?: ReactNode
  cta?: { href: string; label: string }
}) {
  return (
    <div className="px-6 lg:px-10 pt-4 lg:pt-5 pb-32">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mt-1">{title}</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">{description}</p>

        <div className="mt-8 bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#F0DFF6] text-[#7E5896] flex items-center justify-center">
            {icon}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-6">
            Editor coming soon
          </p>
          <p className="text-sm text-gray-700 mt-2 max-w-md mx-auto leading-relaxed">
            {description}
          </p>
          {cta ? (
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2 mt-6 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
            >
              {cta.label}
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : null}
        </div>

        {children}
      </div>
    </div>
  )
}

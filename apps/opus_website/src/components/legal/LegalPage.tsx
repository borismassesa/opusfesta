import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import Footer from '@/components/footer'

// Shared chrome for /terms-of-use, /privacy-policy, and the
// "Why OpusFesta messaging" explainer. Each page passes a title +
// updated-at date and renders its body as React children — letting
// legal copy be edited freely without touching layout details.
export default function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string
  updatedAt?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-[#1A1A1A] hover:text-gray-700"
          >
            OpusFesta
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1A1A1A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to OpusFesta
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {updatedAt ? (
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">
            Last updated · {updatedAt}
          </p>
        ) : null}
        <div className="legal-prose mt-10 space-y-6 text-sm leading-7 text-gray-700">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  )
}

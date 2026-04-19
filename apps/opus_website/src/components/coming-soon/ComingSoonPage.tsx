import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ParticleTextEffect } from '@/components/ui/particle-text-effect'

export interface ComingSoonPageProps {
  words: string[]
  ariaLabel: string
  wordIntervalMs?: number
}

export default function ComingSoonPage({
  words,
  ariaLabel,
  wordIntervalMs = 5500,
}: ComingSoonPageProps) {
  return (
    <main className="relative flex min-h-[calc(100svh-80px)] flex-col items-center justify-center gap-10 overflow-hidden bg-white px-6 py-16 text-[#1A1A1A] sm:px-10 lg:px-16 lg:py-20">
      <div className="w-full max-w-3xl">
        <ParticleTextEffect
          words={words}
          wordIntervalMs={wordIntervalMs}
          ariaLabel={ariaLabel}
          background="light"
          className="w-full"
        />
      </div>

      <Link
        href="/"
        className="group inline-flex items-center gap-4 text-sm font-bold uppercase tracking-[0.24em] text-[#1A1A1A] transition-colors hover:text-[var(--accent-hover)]"
      >
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#1A1A1A] transition-all duration-200 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[var(--on-accent)]">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        </span>
        Back to home
      </Link>
    </main>
  )
}

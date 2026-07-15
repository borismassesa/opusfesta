'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowRight, Loader2 } from 'lucide-react'
import ScannerVisual from '@/components/ScannerVisual'

export default function Home() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submitCode(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/access/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: trimmed }),
      })
      const data = await res.json()
      if (!data.ok) {
        setError(data.error || 'That code was not recognized')
        setLoading(false)
        return
      }
      router.push(`/event/${data.eventId}?token=${encodeURIComponent(trimmed)}`)
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center bg-white">
      {/* The two panels are centered as one fixed-gap unit (not a 50/50 grid) —
          on an ultra-wide monitor a 50/50 split leaves the text and the QR
          visual stranded near their own edges with a huge dead zone between
          them. Extra width now goes to the outer margins instead. */}
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-12 sm:px-12 lg:flex-row lg:justify-center lg:gap-20 lg:px-12 xl:gap-28 xl:px-20">
        <div className="relative flex min-w-0 flex-col items-center overflow-hidden text-center lg:items-start lg:text-left">
          <div className="pointer-events-none absolute top-0 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-[#C9A0DC]/10 blur-[120px] lg:left-0 lg:-translate-x-1/3" />

          <Image
            src="/assets/logo/OpusPass Logo.svg"
            alt="OpusPass"
            width={203}
            height={65}
            priority
            unoptimized
            className="relative h-9 w-auto lg:h-11"
          />
          <div className="relative mt-6 max-w-sm space-y-3">
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] lg:text-3xl">Door Scanner</h1>
            <div className="flex items-center gap-3 lg:justify-start">
              <div className="h-px w-8 bg-black/[0.12]" />
              <span className="text-[10px] tracking-wide text-[#8e57b3] uppercase">Digital Entry Portal</span>
              <div className="h-px w-8 bg-black/[0.12] lg:hidden" />
            </div>
            <p className="text-sm leading-relaxed text-[#1A1A1A]/60 lg:text-base">
              Open the event link the couple or OpusFesta team sent you, or enter your access code
              below if you were only given one verbally.
            </p>
          </div>

          <form onSubmit={submitCode} className="relative mt-6 flex w-full max-w-sm flex-col gap-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter access code"
              className="w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-center text-sm text-[#1A1A1A] outline-none placeholder:text-gray-500 focus:border-[#C9A0DC] focus:ring-2 focus:ring-[#C9A0DC]/30 lg:text-left"
            />
            {error ? <p className="text-xs text-[#A84F66]">{error}</p> : null}
            <button
              type="submit"
              disabled={!code.trim() || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A0DC] px-6 py-3 text-sm font-semibold whitespace-nowrap text-[#1A1A1A] transition-colors hover:bg-[#b97fd0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-3.5 w-3.5" /></>}
            </button>
          </form>
        </div>

        <div className="hidden shrink-0 lg:block lg:h-[420px] lg:w-[420px]">
          <ScannerVisual />
        </div>
      </div>
    </main>
  )
}

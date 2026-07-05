'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowRight, Loader2 } from 'lucide-react'

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
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute top-0 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-[#C9A0DC]/10 blur-[120px]" />

      <Image
        src="/assets/logo/OpusPass Logo.svg"
        alt="OpusPass"
        width={203}
        height={65}
        priority
        unoptimized
        className="relative h-9 w-auto"
      />
      <div className="relative space-y-3">
        <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">Door Scanner</h1>
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-black/[0.12]" />
          <span className="text-[10px] tracking-wide text-[#8e57b3] uppercase">Digital Entry Portal</span>
          <div className="h-px w-8 bg-black/[0.12]" />
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-[#1A1A1A]">
          Open the event link the couple or OpusFesta team sent you, or enter your access code
          below if you were only given one verbally.
        </p>
      </div>

      <form onSubmit={submitCode} className="relative flex w-full max-w-xs flex-col gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter access code"
          className="w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-center text-sm text-[#1A1A1A] outline-none placeholder:text-gray-500 focus:border-[#C9A0DC] focus:ring-2 focus:ring-[#C9A0DC]/30"
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
    </main>
  )
}

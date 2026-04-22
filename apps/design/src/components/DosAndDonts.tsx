import type { ReactNode } from 'react'
import { Check, X } from 'lucide-react'

export function DosAndDonts({ children }: { children: ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-4 my-8">{children}</div>
}

export function Do({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
      <p className="text-green-700 text-xs font-black uppercase tracking-widest flex items-center gap-2">
        <Check size={14} strokeWidth={3} />
        Do
      </p>
      <p className="mt-2 font-bold text-ink leading-snug">{children}</p>
    </div>
  )
}

export function Dont({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <p className="text-red-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
        <X size={14} strokeWidth={3} />
        Don&apos;t
      </p>
      <p className="mt-2 font-bold text-ink leading-snug">{children}</p>
    </div>
  )
}

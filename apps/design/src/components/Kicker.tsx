import type { ReactNode } from 'react'

export function Kicker({
  children,
  tone = 'accent',
}: {
  children: ReactNode
  tone?: 'accent' | 'muted'
}) {
  const color = tone === 'accent' ? 'text-[var(--accent)]' : 'text-gray-400'
  return <p className={`kicker mb-4 ${color}`}>{children}</p>
}

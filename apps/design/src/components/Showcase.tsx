import type { ReactNode } from 'react'

export function Showcase({
  children,
  label,
  dark,
  padded = true,
}: {
  children: ReactNode
  label?: string
  dark?: boolean
  padded?: boolean
}) {
  const bg = dark ? 'bg-[#1A1A1A]' : 'bg-[#FAFAF9]'
  const ring = dark ? 'ring-[#1A1A1A]' : 'ring-gray-100'
  return (
    <figure className="my-6">
      {label && <figcaption className="micro text-gray-400 mb-2">{label}</figcaption>}
      <div
        className={`${bg} ${ring} ring-1 rounded-3xl ${padded ? 'p-10' : 'p-0 overflow-hidden'} flex items-center justify-center min-h-[160px]`}
      >
        {children}
      </div>
    </figure>
  )
}

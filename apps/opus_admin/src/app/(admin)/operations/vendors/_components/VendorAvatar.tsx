'use client'

import { Building2 } from 'lucide-react'

export function VendorAvatar({
  logoUrl,
  businessName,
  size = 44,
}: {
  logoUrl: string | null
  businessName: string
  size?: number
}) {
  // Lavender-on-purple per OF-ENG-SPEC-002 §9. We render a real <img> when
  // the vendor uploaded a logo; otherwise we show the building icon as a
  // category-neutral placeholder.
  if (logoUrl) {
    return (
      <div
        className="rounded-lg overflow-hidden bg-[#EEEDFE] shrink-0"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={`${businessName} logo`}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }
  return (
    <div
      className="rounded-lg bg-[#EEEDFE] flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Building2
        className="text-[#5B2D8E]"
        style={{ width: size * 0.5, height: size * 0.5 }}
        strokeWidth={1.6}
      />
    </div>
  )
}

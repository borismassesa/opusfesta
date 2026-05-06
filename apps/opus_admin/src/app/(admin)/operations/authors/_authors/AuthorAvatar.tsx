// OF-ADM-AUTHORS-001 — circular avatar with deterministic tint when no image
// is set. Tint hash is FNV-1a over the seed so colors are stable across
// renders/sessions; avatar_url short-circuits the tint logic.

import { resolveMediaUrl } from '@/app/(admin)/cms/advice-and-ideas/_media'
import { cn } from '@/lib/utils'

const TINTS: { bg: string; text: string }[] = [
  { bg: 'bg-[#F0DFF6]', text: 'text-[#7E5896]' }, // brand lavender
  { bg: 'bg-[#FCE4DE]', text: 'text-[#A4503C]' }, // coral
  { bg: 'bg-[#FCDCEA]', text: 'text-[#9D3D6F]' }, // pink
  { bg: 'bg-[#DCEAFC]', text: 'text-[#3D6CA4]' }, // blue
  { bg: 'bg-[#D7F0E5]', text: 'text-[#2D6A4F]' }, // teal/emerald
  { bg: 'bg-[#F4E9D2]', text: 'text-[#8A6A2E]' }, // sand
]

function tintFor(seed: string): { bg: string; text: string } {
  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = (hash * 0x01000193) >>> 0
  }
  return TINTS[hash % TINTS.length]
}

function defaultInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export default function AuthorAvatar({
  name,
  initials,
  avatarUrl,
  size = 36,
  seed,
  className,
}: {
  name: string
  initials?: string | null
  avatarUrl?: string | null
  size?: number
  // Optional override for the tint key — useful for invites where the
  // canonical seed is the email rather than the (possibly empty) display name.
  seed?: string
  className?: string
}) {
  const px = `${size}px`
  if (avatarUrl) {
    return (
      <span
        className={cn('inline-block overflow-hidden rounded-full bg-gray-100', className)}
        style={{ width: px, height: px }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveMediaUrl(avatarUrl)}
          alt=""
          className="h-full w-full object-cover"
        />
      </span>
    )
  }

  const tint = tintFor(seed ?? name ?? 'unknown')
  const label = (initials || defaultInitials(name) || '?').slice(0, 2)
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full text-[11px] font-bold tracking-wider',
        tint.bg,
        tint.text,
        className
      )}
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      {label}
    </span>
  )
}

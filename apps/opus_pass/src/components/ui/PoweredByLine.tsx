import { Heart } from 'lucide-react'

/**
 * Renders a "Powered {icon} by OpusPass" style string, swapping the literal
 * `{icon}` token (from CMS/translated copy) for a lavender heart glyph.
 * Falls back to appending the heart at the end if the token is missing.
 */
export default function PoweredByLine({
  text,
  className,
  iconClassName = 'h-3 w-3 text-[#C9A0DC]',
}: {
  text: string
  className?: string
  iconClassName?: string
}) {
  const [before, after] = text.includes('{icon}') ? text.split('{icon}') : [text, '']
  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ''}`}>
      {before}
      <Heart className={iconClassName} fill="currentColor" />
      {after}
    </span>
  )
}

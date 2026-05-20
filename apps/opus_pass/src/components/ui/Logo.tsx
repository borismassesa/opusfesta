export default function Logo({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-bold tracking-tight leading-none text-2xl sm:text-3xl ${className ?? ''}`}
      aria-label="OpusPass"
      role="img"
    >
      <span className="text-[#1A1A1A]">Opus</span>
      <span className="text-[#C9A0DC]">Pass</span>
    </span>
  )
}

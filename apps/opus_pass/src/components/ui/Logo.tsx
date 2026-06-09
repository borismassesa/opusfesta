import Image from 'next/image'

export default function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/assets/logo/OpusPass Logo.svg"
      alt="OpusPass"
      width={203}
      height={65}
      priority
      // SVG is vector — no optimizer benefit, and Next's image optimizer rejects
      // SVGs in production unless dangerouslyAllowSVG is set. Serve it raw.
      unoptimized
      className={`h-7 w-auto sm:h-8 ${className ?? ''}`}
    />
  )
}

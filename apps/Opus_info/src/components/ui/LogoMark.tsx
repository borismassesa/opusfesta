export default function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Crescent moon — open, elegant C shape */}
      <path
        d="M52 45C52 65.987 41.046 83 27.5 83C13.954 83 3 65.987 3 45C3 24.013 13.954 7 27.5 7C13.954 7 3 24.013 3 45C3 65.987 13.954 83 27.5 83C41.046 83 52 65.987 52 45Z"
        stroke="url(#moon-stroke)"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Actual crescent path */}
      <path
        d="M48 45C48 63.778 38.598 79 27 79C15.402 79 6 63.778 6 45C6 26.222 15.402 11 27 11C20.373 11 15 26.222 15 45C15 63.778 20.373 79 27 79C38.598 79 48 63.778 48 45Z"
        fill="url(#moon-fill)"
        opacity="0.15"
      />

      {/* Top sparkle — 4-pointed star */}
      <path
        d="M54 12L55.8 6L57.6 12L63 13.8L57.6 15.6L55.8 21L54 15.6L48 13.8L54 12Z"
        fill="#9B6FB5"
      />
      {/* Small top-left sparkle */}
      <path
        d="M16 4L17 1L18 4L21 5L18 6L17 9L16 6L13 5L16 4Z"
        fill="#C9A0DC"
        opacity="0.6"
      />
      {/* Tiny sparkle */}
      <path
        d="M60 26L60.8 24L61.6 26L63.5 26.8L61.6 27.6L60.8 29.5L60 27.6L58 26.8L60 26Z"
        fill="#C9A0DC"
        opacity="0.4"
      />
      <defs>
        <linearGradient id="moon-stroke" x1="3" y1="7" x2="52" y2="83" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7B5A92" />
          <stop offset="1" stopColor="#C9A0DC" />
        </linearGradient>
        <linearGradient id="moon-fill" x1="6" y1="11" x2="48" y2="79" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9B6FB5" />
          <stop offset="1" stopColor="#C9A0DC" />
        </linearGradient>
      </defs>
    </svg>
  )
}

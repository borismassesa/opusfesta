'use client'

export default function SSOCallbackClient({ finishingLabel }: { finishingLabel: string }) {
  return (
    <div
      className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#C9A0DC]"
      role="status"
      aria-label={finishingLabel}
    />
  )
}

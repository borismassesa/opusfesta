import type { ReactNode } from 'react'

export function OnboardHeading({
  title,
  description,
}: {
  title: ReactNode
  description?: ReactNode
}) {
  return (
    <div className="mb-10">
      <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight leading-[1.15] text-gray-900">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-base text-gray-700 max-w-2xl leading-relaxed">{description}</p>
      ) : null}
    </div>
  )
}

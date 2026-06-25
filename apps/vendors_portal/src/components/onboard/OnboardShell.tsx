import type { ReactNode } from 'react'
import { Stepper, type StepKey } from './Stepper'
import { BackLink } from './BackLink'

export function OnboardShell({
  children,
  step,
  profileLabel,
  backHref,
  showBack = true,
  primaryAction,
  footerAside,
}: {
  children: ReactNode
  step: StepKey | null
  profileLabel: string
  backHref?: string
  showBack?: boolean
  // The page's primary control (Next / Continue / Submit). Rendered on the
  // right of the shared action row so Back-left / primary-right is identical on
  // every step and at every screen size.
  primaryAction?: ReactNode
  // Optional content shown just above the action row (e.g. a submit error).
  footerAside?: ReactNode
}) {
  const hasActions = showBack || primaryAction || footerAside

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Stepper current={step} profileLabel={profileLabel} />

      <main className="px-6 lg:px-12 py-8 lg:py-10">
        <div className="w-full max-w-2xl mx-auto pb-16">
          {children}

          {hasActions ? (
            <div className="mt-12">
              {footerAside ? <div className="mb-4">{footerAside}</div> : null}
              <div className="flex items-center justify-between gap-4">
                {showBack ? (
                  <BackLink href={backHref} variant="button" />
                ) : (
                  <span />
                )}
                {primaryAction ?? <span />}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}

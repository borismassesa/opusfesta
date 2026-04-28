import type { ReactNode } from 'react'
import { Stepper, type StepKey } from './Stepper'
import { BackLink } from './BackLink'

export function OnboardShell({
  children,
  step,
  profileLabel,
  backHref,
  showBack = true,
}: {
  children: ReactNode
  step: StepKey | null
  profileLabel: string
  backHref?: string
  showBack?: boolean
}) {
  return (
    <div className="min-h-screen bg-[#F5F4F1] text-gray-900">
      <Stepper current={step} profileLabel={profileLabel} />
      <main className="px-6 lg:px-12 py-8 lg:py-10">
        {showBack ? <BackLink href={backHref} /> : null}
        <div className="max-w-3xl mx-auto mt-6 lg:mt-10 pb-24">{children}</div>
      </main>
    </div>
  )
}

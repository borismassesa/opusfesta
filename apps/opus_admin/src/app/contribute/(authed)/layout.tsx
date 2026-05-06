import type { ReactNode } from 'react'
import { requireContributorIdentity } from '@/lib/contribute/auth'

export const dynamic = 'force-dynamic'

export default async function ContributorAuthedLayout({ children }: { children: ReactNode }) {
  try {
    await requireContributorIdentity()
  } catch {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7E5896]">
            Contributor access
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-gray-950">This area is restricted.</h1>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Sign in with a contributor account, or use an admin account for testing.
          </p>
        </div>
      </div>
    )
  }

  return <main>{children}</main>
}

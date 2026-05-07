import type { ReactNode } from 'react'
import { requireContributorIdentity } from '@/lib/contribute/auth'
import { isSupabaseAdminConfigError } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function ContributorAuthedLayout({ children }: { children: ReactNode }) {
  try {
    await requireContributorIdentity()
  } catch (error) {
    if (isSupabaseAdminConfigError(error)) {
      return <ContributorSetupRequired />
    }

    const message = error instanceof Error ? error.message : ''
    if (!message.includes('Sign in') && !message.includes('Contributor access')) {
      throw error
    }

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

function ContributorSetupRequired() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
      <div className="max-w-xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7E5896]">
          Contributor setup
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-gray-950">Supabase is not configured.</h1>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Contributor invites and drafts are stored in Supabase. Add
          {' '}<span className="font-mono text-gray-800">NEXT_PUBLIC_SUPABASE_URL</span> and
          {' '}<span className="font-mono text-gray-800">SUPABASE_SERVICE_ROLE_KEY</span> to
          {' '}<span className="font-mono text-gray-800">apps/opus_admin/.env.local</span>, then restart
          the dev server.
        </p>
      </div>
    </div>
  )
}

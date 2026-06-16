import Link from 'next/link'
import type { ReactNode } from 'react'
import Logo from '@/components/ui/Logo'
import { resolveContributorAccess } from '@/lib/contribute/auth'
import { isSupabaseAdminConfigError } from '@/lib/supabase'
import { ContributorUserButton } from './ContributorUserButton'

export const dynamic = 'force-dynamic'

export default async function ContributorLayout({ children }: { children: ReactNode }) {
  // Resolve access once for the header so the pill matches reality, and the
  // result is cached for the inner (authed) layout via React.cache. A
  // Supabase outage shouldn't blank the whole shell — fall back to no pill.
  let status: Awaited<ReturnType<typeof resolveContributorAccess>> | null = null
  try {
    status = await resolveContributorAccess()
  } catch (error) {
    if (!isSupabaseAdminConfigError(error)) {
      console.error('[contribute layout] resolveContributorAccess failed', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link href="/contribute" aria-label="OpusFesta contributor workspace">
            <Logo className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <AccessPill status={status} />
            {status?.kind === 'signed_out' ? (
              <Link
                href="/sign-in?redirect_url=%2Fcontribute"
                className="inline-flex items-center rounded-lg bg-[#C9A0DC] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#b97fd0]"
              >
                Sign in
              </Link>
            ) : (
              <ContributorUserButton />
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}

function AccessPill({
  status,
}: {
  status: Awaited<ReturnType<typeof resolveContributorAccess>> | null
}) {
  if (!status || status.kind !== 'granted') return null
  const label = status.identity.isAdmin ? 'Editorial' : 'Contributor'
  return (
    <span className="hidden rounded-full bg-[#F0DFF6] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-black sm:inline">
      {label}
    </span>
  )
}

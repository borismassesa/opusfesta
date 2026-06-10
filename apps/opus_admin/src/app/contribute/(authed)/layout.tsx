import Link from 'next/link'
import type { ReactNode } from 'react'
import { Mail } from 'lucide-react'
import { resolveContributorAccess } from '@/lib/contribute/auth'
import SwitchAccountButton from './SwitchAccountButton'
import { isSupabaseAdminConfigError } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function ContributorAuthedLayout({ children }: { children: ReactNode }) {
  let status: Awaited<ReturnType<typeof resolveContributorAccess>>
  try {
    status = await resolveContributorAccess()
  } catch (error) {
    if (isSupabaseAdminConfigError(error)) {
      return <ContributorSetupRequired />
    }
    throw error
  }

  if (status.kind === 'granted') return <main>{children}</main>

  return <RestrictedNotice status={status} />
}

function RestrictedNotice({
  status,
}: {
  status:
    | { kind: 'signed_out' }
    | { kind: 'no_access'; identity: { email: string; name: string | null } }
}) {
  const signedIn = status.kind === 'no_access'
  const currentEmail = signedIn ? status.identity.email : null

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[640px] flex-col px-6 pb-24 pt-16 sm:pt-24">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7E5896]">
        Contributor workspace
      </p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-gray-950">
        {signedIn ? 'You don’t have access yet.' : 'Sign in to keep going.'}
      </h1>
      <p className="mt-3 max-w-[520px] text-[15px] leading-7 text-gray-600">
        {signedIn
          ? 'The contributor space is invite-only. If you’re expecting access, check that you’re signed in with the email the editorial team used.'
          : 'The contributor space is invite-only. Sign in with the email the editorial team used, or follow the link from your invite.'}
      </p>

      {currentEmail ? (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-700">
          You’re signed in as{' '}
          <span className="font-semibold text-gray-950">{currentEmail}</span>.
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {signedIn ? (
          <SwitchAccountButton />
        ) : (
          <Link
            href="/sign-in?redirect_url=%2Fcontribute"
            className="inline-flex items-center gap-2 rounded-lg bg-[#C9A0DC] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#b97fd0]"
          >
            Sign in
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:border-gray-300"
        >
          Back to OpusFesta
        </Link>
      </div>

      <div className="mt-10 border-t border-gray-100 pt-6 text-sm leading-7 text-gray-600">
        <p className="flex items-center gap-2 text-gray-700">
          <Mail className="h-4 w-4 text-[#7E5896]" />
          <span>Expecting an invite or want to write for us?</span>
        </p>
        <p className="mt-1">
          Reach the editorial team at{' '}
          <a
            className="font-semibold text-[#7E5896] underline underline-offset-4"
            href="mailto:editorial@opusfesta.com"
          >
            editorial@opusfesta.com
          </a>
          .
        </p>
      </div>
    </div>
  )
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

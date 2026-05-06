import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getInvitationPreview } from '@/lib/advice-submission-actions'
import AcceptInviteButton from './AcceptInviteButton'
import SwitchAccountButton from './SwitchAccountButton'

export const dynamic = 'force-dynamic'

function normalizeEmail(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

function firstName(full: string | null | undefined): string | null {
  const trimmed = (full ?? '').trim()
  if (!trimmed) return null
  return trimmed.split(/\s+/)[0]
}

export default async function ContributorInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Each external call is wrapped so a transient Clerk or Supabase blip during
  // sign-up redirects renders the public invite state instead of a 500 page.
  let invite: Awaited<ReturnType<typeof getInvitationPreview>> | null = null
  try {
    invite = await getInvitationPreview(token)
  } catch (lookupError) {
    console.error('[invite page] getInvitationPreview failed', lookupError)
  }

  let userId: string | null = null
  try {
    const a = await auth()
    userId = a.userId ?? null
  } catch (authError) {
    console.error('[invite page] auth() failed', authError)
  }

  const expired = invite ? new Date(invite.expires_at).getTime() < Date.now() : false

  let user: Awaited<ReturnType<typeof currentUser>> | null = null
  if (userId) {
    try {
      user = await currentUser()
    } catch (userError) {
      console.error('[invite page] currentUser() failed', userError)
      // Keep userId so we know there's an in-flight session, but treat the
      // user record as unavailable. The mismatch / accept UI will gracefully
      // fall back to the sign-in path.
      userId = null
    }
  }

  const currentEmail = normalizeEmail(
    user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress
  )
  const inviteEmail = normalizeEmail(invite?.email)
  const emailMatches = !!userId && !!inviteEmail && currentEmail === inviteEmail

  if (!invite) {
    return (
      <Letter>
        <p>This link doesn&rsquo;t resolve to an invite.</p>
        <p>
          It may have been mistyped, or retired by the editorial team. If
          that&rsquo;s a surprise, write to{' '}
          <a className="text-[#7E5896] underline underline-offset-4" href="mailto:editorial@opusfesta.com">
            editorial@opusfesta.com
          </a>{' '}
          and we&rsquo;ll send a new one.
        </p>
      </Letter>
    )
  }

  if (expired || invite.status === 'expired') {
    return (
      <Letter>
        <p>This link has expired.</p>
        <p>
          Contributor invites last fourteen days. Reply to whoever sent yours and
          we&rsquo;ll reissue. The article slot is still yours.
        </p>
      </Letter>
    )
  }

  if (invite.status === 'revoked') {
    return (
      <Letter>
        <p>This link was retired.</p>
        <p>
          The editorial team has pulled it back. Reach the person who invited
          you, or write to{' '}
          <a className="text-[#7E5896] underline underline-offset-4" href="mailto:editorial@opusfesta.com">
            editorial@opusfesta.com
          </a>
          .
        </p>
      </Letter>
    )
  }

  const name = firstName(invite.full_name)
  const articleTitle = invite.article_title?.trim()

  return (
    <Letter>
      <p>{name ? `Dear ${name},` : 'Hello,'}</p>
      <p>
        Your name came up when we were lining up the next pieces for{' '}
        <em className="not-italic font-medium text-gray-950">Ideas &amp; Advice</em>.{' '}
        {articleTitle
          ? `We’re putting together one called “${articleTitle}” and we’d like you to write it.`
          : 'The angle is yours to pick.'}
      </p>
      <p>
        Accept and you&rsquo;ll get a writing space on our admin. Drafts stay
        yours until you submit. The editorial team handles publishing, scheduling,
        and the rest of the platform, so you only have what&rsquo;s on the page to
        think about.
      </p>
      <p className="pt-2 font-sans text-sm text-gray-500">
        Yours,
        <br />
        <span className="text-gray-800">OpusFesta editorial</span>
      </p>

      <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 font-sans text-xs text-gray-500">
        {!userId ? (
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(`/contribute/invite/${token}`)}`}
            className="inline-flex items-center rounded-lg bg-[#C9A0DC] px-5 py-3 text-sm font-semibold text-white hover:bg-[#b97fd0]"
          >
            Sign in to accept
          </Link>
        ) : emailMatches ? (
          <AcceptInviteButton token={token} />
        ) : null}
        <span>
          Sent to <span className="text-gray-800">{invite.email}</span>
        </span>
      </div>

      {userId && !emailMatches && (
        <AccountMismatchPanel
          token={token}
          currentEmail={currentEmail}
          inviteEmail={invite.email}
        />
      )}
    </Letter>
  )
}

function Letter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[620px] px-6 pb-24 pt-20 sm:pt-24">
      <div
        className="space-y-6 font-serif text-[18px] leading-[1.7] text-gray-800"
        style={{ fontFamily: 'ui-serif, Georgia, "Times New Roman", serif' }}
      >
        {children}
      </div>
    </div>
  )
}

function AccountMismatchPanel({
  token,
  currentEmail,
  inviteEmail,
}: {
  token: string
  currentEmail: string
  inviteEmail: string
}) {
  return (
    <div className="mt-10 border-l-2 border-amber-400 pl-4 font-sans text-sm leading-7 text-gray-700">
      <p>
        You&rsquo;re signed in as{' '}
        <span className="font-semibold text-gray-950">{currentEmail || 'an unknown account'}</span>.
        This invite is addressed to{' '}
        <span className="font-semibold text-gray-950">{inviteEmail}</span>. Switch
        accounts to accept it.
      </p>
      <div className="mt-3">
        <SwitchAccountButton token={token} />
      </div>
    </div>
  )
}

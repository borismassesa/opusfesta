import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { AlertCircle, Mail } from 'lucide-react'
import { getInvitationPreview } from '@/lib/advice-submission-actions'
import AcceptInviteButton from './AcceptInviteButton'

export const dynamic = 'force-dynamic'

export default async function ContributorInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const invite = await getInvitationPreview(token)
  const { userId } = await auth()
  const expired = invite ? new Date(invite.expires_at).getTime() < Date.now() : false

  return (
    <div className="mx-auto max-w-[880px] px-6 py-16">
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        {!invite ? (
          <InviteState
            title="Invite not found"
            body="This contributor link is invalid. Ask the OpusFesta team for a fresh invite."
          />
        ) : expired || invite.status === 'expired' ? (
          <InviteState
            title="Invite expired"
            body="This contributor link has expired. Ask the OpusFesta team for a fresh invite."
          />
        ) : invite.status === 'revoked' ? (
          <InviteState
            title="Invite revoked"
            body="This contributor link is no longer active."
          />
        ) : (
          <>
            <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F0DFF6] text-[#7E5896]">
              <Mail className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
              Write for OpusFesta Ideas &amp; Advice
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
              This invite is scoped to {invite.email}. You will be able to draft
              and submit an article without access to the admin panel.
            </p>

            <dl className="mt-6 grid gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm md:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                  Contributor
                </dt>
                <dd className="mt-1 font-semibold text-gray-900">
                  {invite.full_name || invite.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                  Article
                </dt>
                <dd className="mt-1 font-semibold text-gray-900">
                  {invite.article_title || 'Untitled article'}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              {userId ? (
                <AcceptInviteButton token={token} />
              ) : (
                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent(`/contribute/invite/${token}`)}`}
                  className="inline-flex items-center rounded-lg bg-[#C9A0DC] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b97fd0]"
                >
                  Sign in to accept
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function InviteState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-rose-600" />
      <div>
        <h1 className="text-xl font-semibold text-gray-950">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{body}</p>
      </div>
    </div>
  )
}

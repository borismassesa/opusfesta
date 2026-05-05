'use client'

import { useState, useTransition } from 'react'
import { Copy, Link2, MailPlus, ShieldCheck } from 'lucide-react'
import { createContributorInvitation } from '@/lib/advice-submission-actions'

type AuthorAccessRow = {
  id: string
  email: string
  full_name: string | null
  article_title: string | null
  status: string
  expires_at: string
  accepted_submission_id: string | null
}

export default function AuthorAccessForm({
  authors,
}: {
  authors: AuthorAccessRow[]
}) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [articleTitle, setArticleTitle] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function submit() {
    setMessage(null)
    setInviteLink(null)
    startTransition(async () => {
      try {
        const result = await createContributorInvitation({
          email,
          fullName,
          articleTitle,
        })
        setEmail('')
        setFullName('')
        setArticleTitle('')
        setInviteLink(result.link)
        setMessage('Contributor invite created.')
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not create invite.')
      }
    })
  }

  async function copyInviteLink() {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
    setMessage('Invite link copied.')
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-gray-900">
            <ShieldCheck className="h-4 w-4 text-[#7E5896]" />
            Contributor invite link
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Share a scoped link with an article writer. They can write and
            submit Advice &amp; Ideas drafts without access to the admin panel.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="author@example.com"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
        />
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Display name"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
        />
        <input
          type="text"
          value={articleTitle}
          onChange={(e) => setArticleTitle(e.target.value)}
          placeholder="Article title"
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
        />
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C9A0DC] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b97fd0] disabled:opacity-50"
        >
          <MailPlus className="h-4 w-4" />
          Create invite
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}

      {inviteLink && (
        <div className="mt-4 rounded-xl border border-[#E7D5EE] bg-[#F8F0FB] p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#7E5896]">
            <Link2 className="h-3.5 w-3.5" />
            Share this link
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={inviteLink}
              className="min-w-0 flex-1 rounded-lg border border-[#E7D5EE] bg-white px-3 py-2 text-sm text-gray-700"
            />
            <button
              type="button"
              onClick={copyInviteLink}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>
        </div>
      )}

      {authors.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
            Recent contributor invites
          </p>
          <ul className="grid gap-2 md:grid-cols-2">
            {authors.map((author) => (
              <li
                key={author.id}
                className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
              >
                <p className="font-semibold text-gray-900">
                  {author.article_title || author.full_name || author.email}
                </p>
                <p className="text-xs text-gray-500">
                  {author.email} · {author.status}
                  {author.accepted_submission_id ? ' · accepted' : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { ShieldCheck, UserPlus } from 'lucide-react'
import { grantAdviceAuthorAccess } from './actions'

type AuthorAccessRow = {
  email: string
  full_name: string | null
  is_active: boolean | null
  last_login: string | null
}

export default function AuthorAccessForm({
  authors,
}: {
  authors: AuthorAccessRow[]
}) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function submit() {
    setMessage(null)
    startTransition(async () => {
      try {
        await grantAdviceAuthorAccess({ email, full_name: fullName })
        setEmail('')
        setFullName('')
        setMessage('Author access granted.')
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not grant access.')
      }
    })
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold text-gray-900">
            <ShieldCheck className="h-4 w-4 text-[#7E5896]" />
            Author admin access
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Grant an article writer access to the admin panel. They can create,
            edit, upload media, and publish Advice & Ideas articles.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
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
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C9A0DC] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b97fd0] disabled:opacity-50"
        >
          <UserPlus className="h-4 w-4" />
          Grant access
        </button>
      </div>

      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}

      {authors.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
            Active article authors
          </p>
          <ul className="grid gap-2 md:grid-cols-2">
            {authors.map((author) => (
              <li
                key={author.email}
                className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
              >
                <p className="font-semibold text-gray-900">
                  {author.full_name || author.email}
                </p>
                <p className="text-xs text-gray-500">{author.email}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

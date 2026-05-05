import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { AdviceIdeasAuthorRow } from '@/lib/cms/advice-ideas'
import { resolveMediaUrl } from '@/app/(admin)/cms/advice-and-ideas/_media'
import {
  ADVICE_SUBMISSION_MISSING_TABLE_HINT,
  isMissingAdviceSubmissionTable,
} from '@/lib/advice-submissions'
import AuthorAccessForm from './AuthorAccessForm'
import AuthorsRowActions from './AuthorsRowActions'

export const dynamic = 'force-dynamic'

export default async function AuthorsListPage() {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_ideas_authors')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error

  const authors = (data ?? []) as AdviceIdeasAuthorRow[]
  const { data: accessRows, error: accessError } = await supabase
    .from('advice_article_invitations')
    .select('id, email, full_name, article_title, status, expires_at, accepted_submission_id')
    .order('created_at', { ascending: false })
    .limit(8)
  if (accessError) {
    if (isMissingAdviceSubmissionTable(accessError)) {
      console.warn(`[authors] ${accessError.code} — ${ADVICE_SUBMISSION_MISSING_TABLE_HINT}`)
    } else {
      throw accessError
    }
  }
  const tableMissing = !!accessError && isMissingAdviceSubmissionTable(accessError)

  return (
    <div className="px-8 pt-8 pb-12">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {tableMissing && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">Contributor workflow migration not applied yet</p>
            <p className="mt-1">
              Apply <code className="rounded bg-amber-100 px-1">supabase/migrations/20260505000001_advice_article_contributor_workflow.sql</code> on the connected Supabase project before creating contributor invites.
            </p>
          </div>
        )}
        <AuthorAccessForm
          authors={(accessRows ?? []) as Array<{
            id: string
            email: string
            full_name: string | null
            article_title: string | null
            status: string
            expires_at: string
            accepted_submission_id: string | null
          }>}
        />

        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Authors</h2>
            <p className="text-sm text-gray-500 mt-2 max-w-2xl">
              {authors.length} author{authors.length === 1 ? '' : 's'} — their bio and avatar appear in the Author
              Card at the bottom of every matching article.
            </p>
          </div>
          <Link
            href="/operations/authors/new"
            className="flex items-center gap-2 text-sm font-semibold text-white bg-[#C9A0DC] hover:bg-[#b97fd0] px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New author
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/60 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3.5">Author</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Key</th>
                <th className="px-5 py-3.5">Order</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {authors.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-[11px] font-bold text-gray-500">
                        {a.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={resolveMediaUrl(a.avatar_url)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          a.initials || a.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/operations/authors/${a.id}`}
                          className="font-semibold text-gray-900 hover:text-[#7E5896] truncate"
                        >
                          {a.name}
                        </Link>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{a.bio}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-700">{a.role || '—'}</td>
                  <td className="px-5 py-4 text-gray-500 font-mono text-xs">{a.key}</td>
                  <td className="px-5 py-4 text-gray-500 tabular-nums">{a.sort_order}</td>
                  <td className="px-5 py-4">
                    <AuthorsRowActions id={a.id} />
                  </td>
                </tr>
              ))}
              {authors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                    No authors yet. Click “New author” to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { AdviceIdeasAuthorRow } from '@/lib/cms/advice-ideas'
import { resolveMediaUrl } from '../_media'
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">Authors</h3>
          <p className="text-sm text-gray-500 mt-1">
            {authors.length} author{authors.length === 1 ? '' : 's'} — their bio and avatar appear in the Author
            Card at the bottom of every matching article.
          </p>
        </div>
        <Link
          href="/cms/advice-and-ideas/authors/new"
          className="flex items-center gap-2 text-sm font-semibold text-white bg-[#C9A0DC] hover:bg-[#b97fd0] px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New author
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/60 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {authors.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
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
                        href={`/cms/advice-and-ideas/authors/${a.id}`}
                        className="font-semibold text-gray-900 hover:text-[#7E5896] truncate"
                      >
                        {a.name}
                      </Link>
                      <p className="text-xs text-gray-500 line-clamp-1">{a.bio}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{a.role || '—'}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{a.key}</td>
                <td className="px-4 py-3 text-gray-500 tabular-nums">{a.sort_order}</td>
                <td className="px-4 py-3">
                  <AuthorsRowActions id={a.id} />
                </td>
              </tr>
            ))}
            {authors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                  No authors yet. Click “New author” to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

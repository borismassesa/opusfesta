import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  ATTIRE_BLOG_FALLBACK,
  type AttireBlogContent,
  type AttireBlogRow,
} from '@/lib/cms/attire-blog'
import BlogEditor from './BlogEditor'

export const dynamic = 'force-dynamic'

const EMPTY: AttireBlogContent = { heading: '', articles: [] }

export default async function AttireBlogEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'attire-and-rings')
    .eq('section_key', 'blog')
    .maybeSingle<AttireBlogRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<AttireBlogContent> | null
  const initial: AttireBlogContent = stored ? { ...EMPTY, ...stored } : ATTIRE_BLOG_FALLBACK
  return <BlogEditor initial={initial} hasDraft={!!row?.draft_content} />
}

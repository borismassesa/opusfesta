import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  TESTIMONIALS_FALLBACK,
  type TestimonialsContent,
  type TestimonialsRow,
} from '@/lib/cms/testimonials'
import TestimonialsEditor from './TestimonialsEditor'

export const dynamic = 'force-dynamic'

export default async function TestimonialsEditorPage() {
  const supabase = createSupabaseAdminClient()
  const { data: row } = await supabase
    .from('website_page_sections')
    .select('*')
    .eq('page_key', 'vendors_home')
    .eq('section_key', 'testimonials')
    .maybeSingle<TestimonialsRow>()
  const stored = (row?.draft_content ?? row?.content) as Partial<TestimonialsContent> | null
  const initial: TestimonialsContent = stored
    ? {
        ...TESTIMONIALS_FALLBACK,
        ...stored,
        items:
          Array.isArray(stored.items) && stored.items.length > 0
            ? stored.items
            : TESTIMONIALS_FALLBACK.items,
      }
    : TESTIMONIALS_FALLBACK
  const hasDraft = !!row?.draft_content
  return <TestimonialsEditor initial={initial} hasDraft={hasDraft} />
}

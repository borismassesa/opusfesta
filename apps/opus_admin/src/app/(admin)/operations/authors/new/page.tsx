import { EMPTY_AUTHOR_DRAFT } from '@/lib/cms/advice-ideas'
import AuthorEditor from '../AuthorEditor'

export const dynamic = 'force-dynamic'

export default function NewAuthorPage() {
  return <AuthorEditor mode="create" initial={EMPTY_AUTHOR_DRAFT()} />
}

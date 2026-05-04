import { EMPTY_POST_DRAFT } from '@/lib/cms/advice-ideas'
import PostEditor from '../PostEditor'

export const dynamic = 'force-dynamic'

export default function NewAdvicePostPage() {
  return <PostEditor mode="create" initial={EMPTY_POST_DRAFT()} />
}

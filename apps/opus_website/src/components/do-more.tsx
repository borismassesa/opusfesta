import { loadDoMoreContent } from '@/lib/cms/do-more'
import DoMoreClient from './do-more-client'

export default async function DoMore() {
  const content = await loadDoMoreContent()
  return <DoMoreClient content={content} />
}

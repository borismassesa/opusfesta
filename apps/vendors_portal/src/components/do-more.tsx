import { loadDoMoreContent } from '@/lib/cms/do-more'
import { getLocale } from '@/lib/cms/locale'
import DoMoreClient from './do-more-client'

export default async function DoMore() {
  const locale = await getLocale()
  const content = await loadDoMoreContent(locale)
  return <DoMoreClient content={content} />
}

import { loadFaqContent } from '@/lib/cms/faq'
import { getLocale } from '@/lib/cms/locale'
import FaqClient from './faq-client'

export default async function Faq() {
  const locale = await getLocale()
  const content = await loadFaqContent(locale)
  return <FaqClient content={content} />
}

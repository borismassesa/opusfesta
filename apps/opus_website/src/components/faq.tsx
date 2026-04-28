import { loadFaqContent } from '@/lib/cms/faq'
import FaqClient from './faq-client'

export default async function Faq() {
  const content = await loadFaqContent()
  return <FaqClient content={content} />
}

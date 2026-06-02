import { loadFaqContent } from '@/lib/cms/faq'
import FaqClient from './faq-client'
import JsonLd from './JsonLd'

export default async function Faq() {
  const content = await loadFaqContent()

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <>
      <JsonLd data={faqSchema} />
      <FaqClient content={content} />
    </>
  )
}

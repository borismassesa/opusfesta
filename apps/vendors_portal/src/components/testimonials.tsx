import { loadTestimonialsContent } from '@/lib/cms/testimonials'
import { getLocale } from '@/lib/cms/locale'
import TestimonialsClient from './testimonials-client'

export default async function Testimonials() {
  const locale = await getLocale()
  const content = await loadTestimonialsContent(locale)
  return <TestimonialsClient content={content} />
}

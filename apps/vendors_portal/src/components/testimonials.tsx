import { loadTestimonialsContent } from '@/lib/cms/testimonials'
import TestimonialsClient from './testimonials-client'

export default async function Testimonials() {
  const content = await loadTestimonialsContent()
  return <TestimonialsClient content={content} />
}

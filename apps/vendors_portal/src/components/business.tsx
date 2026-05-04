import { loadBusinessContent } from '@/lib/cms/business'
import BusinessClient from './business-client'

export default async function Business() {
  const content = await loadBusinessContent()
  return <BusinessClient content={content} />
}

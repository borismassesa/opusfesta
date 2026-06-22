import { loadBusinessContent } from '@/lib/cms/business'
import { getLocale } from '@/lib/cms/locale'
import BusinessClient from './business-client'

export default async function Business() {
  const locale = await getLocale()
  const content = await loadBusinessContent(locale)
  return <BusinessClient content={content} />
}

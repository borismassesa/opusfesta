import { loadCtaContent } from '@/lib/cms/cta'
import { getLocale } from '@/lib/cms/locale'
import CtaClient from './cta-client'

export default async function Cta() {
  const locale = await getLocale()
  const content = await loadCtaContent(locale)
  return <CtaClient content={content} />
}

import { loadCtaContent } from '@/lib/cms/cta'
import CtaClient from './cta-client'

export default async function Cta() {
  const content = await loadCtaContent()
  return <CtaClient content={content} />
}

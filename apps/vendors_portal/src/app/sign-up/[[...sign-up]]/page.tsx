import { getLocale } from '@/lib/cms/locale'
import { loadPortalUiStrings } from '@/lib/cms/portal-ui'
import { PortalUIStringsProvider } from '@/components/providers/PortalUIStringsProvider'
import SignUpClient from './SignUpClient'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string | string[] }>
}) {
  const { redirect_url } = await searchParams
  const locale = await getLocale()
  const authStrings = await loadPortalUiStrings('auth', locale)
  return (
    <PortalUIStringsProvider bundles={{ auth: authStrings }}>
      <SignUpClient
        redirectUrl={Array.isArray(redirect_url) ? redirect_url[0] : redirect_url}
      />
    </PortalUIStringsProvider>
  )
}

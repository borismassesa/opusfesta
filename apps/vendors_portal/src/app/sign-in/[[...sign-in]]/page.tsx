import { getLocale } from '@/lib/cms/locale'
import { loadPortalUiStrings } from '@/lib/cms/portal-ui'
import { PortalUIStringsProvider } from '@/components/providers/PortalUIStringsProvider'
import SignInClient from './SignInClient'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string | string[]; email?: string | string[] }>
}) {
  const { redirect_url, email } = await searchParams
  const locale = await getLocale()
  const authStrings = await loadPortalUiStrings('auth', locale)
  return (
    <PortalUIStringsProvider bundles={{ auth: authStrings }}>
      <SignInClient
        redirectUrl={Array.isArray(redirect_url) ? redirect_url[0] : redirect_url}
        initialEmail={Array.isArray(email) ? email[0] : email}
      />
    </PortalUIStringsProvider>
  )
}

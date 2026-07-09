import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { getLocale } from '@/lib/cms/locale'
import { loadPortalUiStrings } from '@/lib/cms/portal-ui'
import SSOCallbackClient from './SSOCallbackClient'

// Landing route for headless OAuth (Google). Clerk redirects the provider
// hand-off back here; this component finishes the transfer and then lets
// Clerk use the redirectUrlComplete value from the initiating auth request.
export default async function SSOCallbackPage() {
  const locale = await getLocale()
  const authStrings = await loadPortalUiStrings('auth', locale)
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <SSOCallbackClient finishingLabel={authStrings.sso_finishing_label} />
      <AuthenticateWithRedirectCallback
        signUpFallbackRedirectUrl="/onboard"
        signInFallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}

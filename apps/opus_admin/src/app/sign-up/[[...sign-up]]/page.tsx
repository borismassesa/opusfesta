import { SignUp } from '@clerk/nextjs'

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function safeLocalRedirect(value: string | null): string | undefined {
  if (!value) return undefined
  if (!value.startsWith('/') || value.startsWith('//')) return undefined
  return value
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const redirectUrl = safeLocalRedirect(
    firstParam(params?.redirect_url) || firstParam(params?.redirectUrl)
  )

  const callbackUrl = redirectUrl
    ? `/auth-callback?next=${encodeURIComponent(redirectUrl)}`
    : '/auth-callback'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-4">
      <SignUp
        forceRedirectUrl={callbackUrl}
        fallbackRedirectUrl="/auth-callback"
        signInForceRedirectUrl={callbackUrl}
        signInFallbackRedirectUrl="/auth-callback"
      />
    </div>
  )
}

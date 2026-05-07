import { SignIn } from '@clerk/nextjs'

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function safeLocalRedirect(value: string | null): string | undefined {
  if (!value) return undefined
  if (!value.startsWith('/') || value.startsWith('//')) return undefined
  return value
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const redirectUrl = safeLocalRedirect(
    firstParam(params?.redirect_url) || firstParam(params?.redirectUrl)
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-4">
      <SignIn
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl="/"
        signUpForceRedirectUrl={redirectUrl}
        signUpFallbackRedirectUrl="/"
        appearance={{
          elements: {
            formButtonPrimary: 'bg-[#C9A0DC] hover:bg-[#b97fd0] text-[#1A1A1A]',
            // Hide Clerk's footer (dev-mode branding + "Secured by Clerk").
            // The sign-in <-> sign-up cross-link still works via direct URLs.
            footer: 'hidden',
          },
        }}
      />
    </div>
  )
}

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

// Sign-up route mirrors /sign-in. Without this page the Clerk widget's
// "Sign up" affordance (and any direct /sign-up link from a contributor
// invite email) 404s — the middleware whitelisted the path but the Next
// route was missing.
export default async function SignUpPage({
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
      <SignUp
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl="/"
        signInForceRedirectUrl={redirectUrl}
        signInFallbackRedirectUrl="/"
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

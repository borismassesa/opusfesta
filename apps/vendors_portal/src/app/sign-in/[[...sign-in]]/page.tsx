import SignInClient from './SignInClient'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string | string[] }>
}) {
  const { redirect_url } = await searchParams
  return (
    <SignInClient
      redirectUrl={Array.isArray(redirect_url) ? redirect_url[0] : redirect_url}
    />
  )
}

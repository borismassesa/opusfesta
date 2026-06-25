import SignUpClient from './SignUpClient'

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string | string[] }>
}) {
  const { redirect_url } = await searchParams
  return (
    <SignUpClient
      redirectUrl={Array.isArray(redirect_url) ? redirect_url[0] : redirect_url}
    />
  )
}

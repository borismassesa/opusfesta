import SignInClient from './SignInClient'

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>
}) {
  const { redirect_url } = await searchParams
  return <SignInClient redirectUrl={redirect_url} />
}

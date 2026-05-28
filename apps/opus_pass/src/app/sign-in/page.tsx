import SignInForm from './SignInForm'

export const metadata = { title: 'Sign in — OpusPass' }

interface PageProps {
  searchParams: Promise<{ return_to?: string; seed?: string; sent?: string }>
}

export default async function SignInPage({ searchParams }: PageProps) {
  const { return_to, seed, sent } = await searchParams
  return <SignInForm returnTo={return_to ?? '/my/dashboard'} seed={seed === '1'} sentEmail={sent ?? null} />
}

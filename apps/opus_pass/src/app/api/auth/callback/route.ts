import { NextResponse } from 'next/server'
import { createSupabaseAuthClient } from '@/lib/supabase-server'

// Magic-link landing. Supabase redirects here with ?code=… after the user taps
// the link. We exchange it for a session cookie, then forward them to return_to
// (default /my/dashboard). The optional ?seed=1 flag is preserved so the
// dashboard page can provision a starter event on first arrival.
//
// Errors are mapped to short codes so the sign-in screen can render a friendly
// message instead of leaking Supabase's verbose internal text into the URL.

type SignInErrorCode = 'missing_code' | 'wrong_browser' | 'expired_link' | 'unknown'

function classifyError(message: string): SignInErrorCode {
  const m = message.toLowerCase()
  if (m.includes('pkce') || m.includes('code verifier')) return 'wrong_browser'
  if (m.includes('expired') || m.includes('invalid')) return 'expired_link'
  return 'unknown'
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const returnTo = url.searchParams.get('return_to') ?? '/my/dashboard'
  const seed = url.searchParams.get('seed')

  if (!code) {
    return NextResponse.redirect(new URL('/sign-in?error=missing_code', url.origin))
  }

  const supabase = await createSupabaseAuthClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    const errorCode = classifyError(error.message)
    return NextResponse.redirect(new URL(`/sign-in?error=${errorCode}`, url.origin))
  }

  const dest = new URL(returnTo, url.origin)
  if (seed === '1') dest.searchParams.set('seed', '1')
  return NextResponse.redirect(dest)
}

'use server'

const ALLOWED_REDIRECTS = new Set(['/', '/invitations', '/guests', '/websites'])

export async function getOpusPassInvitationsPreviewUrl(
  redirectPath: string = '/invitations',
): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_OPUS_PASS_URL ?? 'http://localhost:3008'
  const token = process.env.OPUS_PASS_PREVIEW_TOKEN
  if (!token) return null
  const safePath = ALLOWED_REDIRECTS.has(redirectPath) ? redirectPath : '/invitations'
  return `${url}/api/preview/enable?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(safePath)}`
}

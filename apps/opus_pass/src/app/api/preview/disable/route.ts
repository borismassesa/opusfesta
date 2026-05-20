import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET() {
  const draft = await draftMode()
  draft.disable()
  redirect('/')
}

export async function POST() {
  const draft = await draftMode()
  draft.disable()
  return new Response(null, { status: 204 })
}

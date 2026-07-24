import { getConversation, getMessagesAfter } from '@/lib/opus/support'

// Polling endpoint for the widget's human mode: returns the conversation status
// plus any messages newer than `after` (so the customer sees agent replies).

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const conversationId = url.searchParams.get('conversationId')
  const after = url.searchParams.get('after')
  if (!conversationId) {
    return Response.json({ error: 'Missing conversationId.' }, { status: 400 })
  }

  const conversation = await getConversation(conversationId)
  if (!conversation) {
    return Response.json({ error: 'Conversation not found.' }, { status: 404 })
  }

  const messages = await getMessagesAfter(conversationId, after)
  return Response.json(
    {
      status: conversation.status,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
      })),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

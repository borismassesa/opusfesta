import { notFound, redirect } from 'next/navigation'
import { getAdminAccessRole, isAdminDashboardRole, hasPermission } from '@/lib/admin-auth'
import { getConversationDetail } from '../queries'
import { replyToConversation, assignToMe, setConversationStatus } from '../actions'
import DetailHeading from './DetailHeading'

export const dynamic = 'force-dynamic'

function fmt(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const role = await getAdminAccessRole()
  if (!isAdminDashboardRole(role)) redirect('/contribute')
  if (!(await hasPermission('support.read'))) redirect('/')

  const { conversationId } = await params
  const convo = await getConversationDetail(conversationId)
  if (!convo) notFound()

  const canWrite = await hasPermission('support.write')
  const subject = convo.subject || 'Support conversation'

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <DetailHeading subject={subject.length > 60 ? `${subject.slice(0, 60)}...` : subject} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Thread + reply */}
        <div className="space-y-4">
          <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            {convo.messages.map((m) => {
              const isUser = m.role === 'user'
              const isAgent = m.role === 'agent'
              if (m.role === 'system') {
                return (
                  <p key={m.id} className="text-center text-[11px] text-gray-400">
                    {m.content}
                  </p>
                )
              }
              return (
                <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? 'rounded-br-md bg-[#1A1A1A] text-white'
                      : isAgent
                        ? 'rounded-bl-md bg-[#F0DFF6] text-[#3f2b49]'
                        : 'rounded-bl-md bg-gray-100 text-[#1A1A1A]'
                  }`}>
                    <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide opacity-60">
                      {isUser ? 'Customer' : isAgent ? m.agent_name || 'Support' : 'Opus'} · {fmt(m.created_at)}
                    </div>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {canWrite && convo.status !== 'resolved' && (
            <form action={replyToConversation} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <input type="hidden" name="conversationId" value={convo.id} />
              <textarea
                name="body"
                required
                rows={3}
                placeholder="Reply to the customer..."
                className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-[#C9A0DC]"
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {convo.contact_email
                    ? `Also emailed to ${convo.contact_email}`
                    : 'No email on file; the reply shows in their chat widget.'}
                </p>
                <button type="submit" className="rounded-full bg-[#7E5896] px-5 py-2 text-sm font-bold text-white hover:bg-[#6d4a83]">
                  Send reply
                </button>
              </div>
            </form>
          )}
          {convo.status === 'resolved' && (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 py-3 text-center text-sm font-medium text-emerald-700">
              This conversation is resolved.
            </p>
          )}
        </div>

        {/* Context + controls */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Details</p>
            <dl className="space-y-2 text-sm">
              <Row label="Status" value={convo.status.replace('_', ' ')} />
              {convo.topic && <Row label="Topic" value={convo.topic} />}
              {convo.escalation_reason && <Row label="Reason" value={convo.escalation_reason} />}
              {convo.assignee_name && <Row label="Assigned to" value={convo.assignee_name} />}
              <Row label="Contact" value={convo.contact_name || 'Anonymous'} />
              {convo.contact_email && <Row label="Email" value={convo.contact_email} />}
              {convo.contact_phone && <Row label="Phone" value={convo.contact_phone} />}
              {convo.page_url && <Row label="From page" value={convo.page_url} />}
              <Row label="Started" value={fmt(convo.created_at)} />
            </dl>
          </div>

          {canWrite && (
            <div className="space-y-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">Actions</p>
              <form action={assignToMe}>
                <input type="hidden" name="conversationId" value={convo.id} />
                <button type="submit" className="w-full rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Assign to me
                </button>
              </form>
              {convo.status !== 'resolved' ? (
                <form action={setConversationStatus}>
                  <input type="hidden" name="conversationId" value={convo.id} />
                  <input type="hidden" name="status" value="resolved" />
                  <button type="submit" className="w-full rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                    Mark resolved
                  </button>
                </form>
              ) : (
                <form action={setConversationStatus}>
                  <input type="hidden" name="conversationId" value={convo.id} />
                  <input type="hidden" name="status" value="assigned" />
                  <button type="submit" className="w-full rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    Reopen
                  </button>
                </form>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-gray-400">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium text-[#1A1A1A]">{value}</dd>
    </div>
  )
}

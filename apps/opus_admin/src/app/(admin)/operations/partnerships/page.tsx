import { hasPermission, requirePermission } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import PartnershipsPageHeading from './PartnershipsPageHeading'
import StatusCell from './StatusCell'

export const dynamic = 'force-dynamic'

// Partnership leads list view. Anyone with vendor.read can see the
// pipeline; vendor.moderate unlocks the "New lead" CTA in the header
// and the inline status dropdown. Assignment, follow-up reminders,
// and an inbound web form are still to come.

type LeadRow = {
  id: string
  contact_name: string
  contact_email: string
  contact_phone: string | null
  company_name: string | null
  lead_type: 'Brand' | 'Agency' | 'Vendor' | 'Influencer' | 'Other'
  status: 'New' | 'Contacted' | 'Negotiating' | 'Closed Won' | 'Closed Lost'
  source: string
  last_activity_at: string
  follow_up_due_at: string | null
  notes: string | null
  created_at: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function PartnershipLeadsPage() {
  await requirePermission('vendor.read')
  const canEdit = await hasPermission('vendor.moderate')
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('partnership_leads')
    .select('id, contact_name, contact_email, contact_phone, company_name, lead_type, status, source, last_activity_at, follow_up_due_at, notes, created_at')
    .order('last_activity_at', { ascending: false })
    .limit(200)
  if (error) throw error
  const rows = (data ?? []) as LeadRow[]

  const open = rows.filter((r) => !r.status.startsWith('Closed'))
  const closed = rows.filter((r) => r.status.startsWith('Closed'))

  return (
    <div className="pb-12">
      <PartnershipsPageHeading
        title="Partnership leads"
        subtitle={`${open.length} open · ${closed.length} closed (last 200)`}
        canEdit={canEdit}
      />
      <div className="mx-auto max-w-[1200px] px-8 pt-8">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          {rows.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-gray-500">
              No partnership leads yet. Click <span className="font-semibold">New lead</span>{' '}
              in the header to add the first one.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3">Company / Contact</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Last activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-900">
                        {row.company_name?.trim() || row.contact_name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {row.contact_name} · {row.contact_email}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-700">{row.lead_type}</td>
                    <td className="px-5 py-3">
                      <StatusCell leadId={row.id} status={row.status} canEdit={canEdit} />
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-600">{row.source}</td>
                    <td className="px-5 py-3 text-xs tabular-nums text-gray-500">
                      {formatDate(row.last_activity_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

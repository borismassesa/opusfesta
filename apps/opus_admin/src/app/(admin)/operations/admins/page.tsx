import { redirect } from 'next/navigation'
import { getAdminAccessRole, getCallerEmail } from '@/lib/admin-auth'
import { listAdmins } from './actions'
import AdminsHeading from './_components/AdminsHeading'
import AdminsTable from './_components/AdminsTable'

export const dynamic = 'force-dynamic'

export default async function AdminsPage() {
  const role = await getAdminAccessRole()
  if (role !== 'owner' && role !== 'admin') {
    redirect('/')
  }

  const [admins, callerEmail] = await Promise.all([listAdmins(), getCallerEmail()])
  const callerIsOwner = role === 'owner'
  const ownerCount = admins.filter((a) => a.role === 'owner' && a.is_active).length
  const activeCount = admins.filter((a) => a.is_active).length
  const subtitle = `${activeCount} active · ${ownerCount} owner${ownerCount === 1 ? '' : 's'} · only owners can edit this list`

  return (
    <div className="mx-auto max-w-[1200px] px-8 py-10">
      <AdminsHeading subtitle={subtitle} />
      <AdminsTable
        admins={admins}
        callerEmail={callerEmail}
        callerIsOwner={callerIsOwner}
      />
    </div>
  )
}

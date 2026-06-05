import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { PageHeadingProvider } from '@/components/PageHeading'
import { PageSearchProvider } from '@/components/PageSearch'
import {
  callerMustResetPassword,
  getAdminAccessRole,
  getCallerPermissions,
  isAdminDashboardRole,
} from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const role = await getAdminAccessRole()
  if (!isAdminDashboardRole(role)) redirect('/contribute')

  // Accounts provisioned with a temporary password must set their own
  // before using the dashboard. No-op for everyone who never had one.
  if (await callerMustResetPassword()) redirect('/set-password')

  // Resolve the caller's full permission set once on the layout and
  // pass it into the Sidebar so each NavItem can declare a required
  // permission (and items the caller can't see drop out of the menu).
  const permissions = Array.from(await getCallerPermissions())

  return (
    <PageHeadingProvider>
      <PageSearchProvider>
        <div className="flex h-screen bg-[#FDFDFD] font-sans antialiased text-gray-900">
          <Sidebar permissions={permissions} />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </PageSearchProvider>
    </PageHeadingProvider>
  )
}

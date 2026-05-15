import { permanentRedirect } from 'next/navigation'

// The Admin Team is now merged into Workforce → Roles & Permissions, where
// it lives alongside the workforce role catalog. Permanent redirect so
// bookmarks, emails and any other inbound link keep working.
export default function LegacyOperationsAdminsPage() {
  permanentRedirect('/workforce/roles')
}

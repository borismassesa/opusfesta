import { permanentRedirect } from 'next/navigation'

// Payroll moved under Finance — it's a finance function rooted in the
// workforce data model. Permanent redirect so bookmarks keep working.
export default function LegacyWorkforcePayrollPage() {
  permanentRedirect('/finance/payroll')
}

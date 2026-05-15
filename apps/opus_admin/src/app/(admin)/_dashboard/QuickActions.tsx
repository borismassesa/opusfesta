import Link from 'next/link'
import {
  ArrowRight,
  Briefcase,
  Newspaper,
  ShieldCheck,
  Store,
  UserPlus,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

// Permission-aware shortcuts to the actions an admin reaches for the
// most. Renders only what the caller can actually do — keeps the
// dashboard from feeling like a jumble of dead links.

type Action = {
  permission: string
  label: string
  hint: string
  href: string
  icon: LucideIcon
}

const ACTIONS: Action[] = [
  {
    permission: 'workforce.write',
    label: 'Add an employee',
    hint: 'Onboard a new teammate',
    href: '/workforce/employees',
    icon: UserPlus,
  },
  {
    permission: 'platform.admin',
    label: 'Manage admin team',
    hint: 'Grant or revoke dashboard access',
    href: '/workforce/roles',
    icon: ShieldCheck,
  },
  {
    permission: 'vendor.moderate',
    label: 'Review vendor applications',
    hint: 'Approve, request changes, or suspend',
    href: '/operations/vendors',
    icon: Store,
  },
  {
    permission: 'cms.publish',
    label: 'Read article submissions',
    hint: 'Move drafts through the editorial pipeline',
    href: '/operations/articles/submissions',
    icon: Newspaper,
  },
  {
    permission: 'workforce.payroll',
    label: 'Run payroll',
    hint: 'Approve and release the monthly run',
    href: '/workforce/payroll',
    icon: Wallet,
  },
  {
    permission: 'workforce.write',
    label: 'Open recruitment pipeline',
    hint: 'Track candidates and roles',
    href: '/workforce/recruitment',
    icon: Briefcase,
  },
]

export default function QuickActions({ granted }: { granted: Set<string> }) {
  const visible = ACTIONS.filter((a) => granted.has(a.permission))
  if (visible.length === 0) return null

  return (
    <section aria-labelledby="quick-actions-heading" className="space-y-3">
      <h2
        id="quick-actions-heading"
        className="text-[11px] font-bold uppercase tracking-wider text-gray-500"
      >
        Quick actions
      </h2>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <ul className="divide-y divide-gray-100">
          {visible.map((a) => {
            const Icon = a.icon
            return (
              <li key={a.label}>
                <Link
                  href={a.href}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">{a.label}</p>
                    <p className="text-xs text-gray-500">{a.hint}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-900" />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

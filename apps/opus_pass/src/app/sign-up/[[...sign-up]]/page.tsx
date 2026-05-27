import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export const metadata = { title: 'Accounts coming soon — OpusPass' }

// Clerk auth temporarily removed — placeholder until sign-up is re-introduced.
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#F3E9FA] via-[#FBF7F2] to-white px-4 py-12 text-center">
      <Logo className="mb-6 text-3xl" />
      <h1 className="text-xl font-bold text-[#1A1A1A]">Accounts are coming soon</h1>
      <p className="mt-2 max-w-sm text-sm text-[#1A1A1A]/60">
        Creating an account isn&apos;t available just yet. You can browse and customise invitations without one.
      </p>
      <Link
        href="/invitations"
        className="mt-6 rounded-full bg-(--accent) px-6 py-3 text-sm font-bold text-(--on-accent) transition-colors hover:bg-(--accent-hover)"
      >
        Browse invitations
      </Link>
    </div>
  )
}

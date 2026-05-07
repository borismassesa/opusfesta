import Link from 'next/link'
import type { ReactNode } from 'react'
import { UserButton } from '@clerk/nextjs'
import { UserCircle } from 'lucide-react'
import Logo from '@/components/ui/Logo'

export const dynamic = 'force-dynamic'

export default function ContributorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link href="/contribute" aria-label="OpusFesta contributor workspace">
            <Logo className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-[#F0DFF6] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-black sm:inline">
              Contributor
            </span>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-9 w-9',
                  // Hide Clerk's popover footer — the "Secured by Clerk"
                  // line + the orange "Development mode" badge that show
                  // beneath Manage account / Sign out.
                  userButtonPopoverFooter: 'hidden',
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Profile"
                  labelIcon={<UserCircle className="h-4 w-4" />}
                  href="/contribute/profile"
                />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}

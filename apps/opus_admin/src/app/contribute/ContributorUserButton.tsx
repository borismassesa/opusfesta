'use client'

import { UserButton } from '@clerk/nextjs'
import { UserCircle } from 'lucide-react'

// Clerk's <UserButton> with compound <UserButton.MenuItems>/<UserButton.Link>
// children must live in a client component — rendering it from the async server
// layout makes Clerk ignore the children and log a "<UserProfile/> can only
// accept …" error. Keep it isolated here so the layout stays a server component.
export function ContributorUserButton() {
  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: 'h-9 w-9',
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
  )
}

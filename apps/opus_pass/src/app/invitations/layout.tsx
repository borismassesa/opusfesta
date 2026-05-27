import type { ReactNode } from 'react'
import InvitationsChrome from '@/components/invitations-chrome'

export default function InvitationsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="font-sans bg-[#FAFAF8] text-[#1A1A1A] selection:bg-(--accent) selection:text-(--on-accent) min-h-screen flex flex-col">
      <InvitationsChrome>{children}</InvitationsChrome>
    </div>
  )
}

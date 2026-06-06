import type { ReactNode } from 'react'
import Logo from '@/components/ui/Logo'

// Two-pane auth layout shared by OpusPass sign-in and sign-up — mirrors the
// OpusFesta Admin / Vendors Portal auth screens (form on white left, dark
// feature panel right). Layout only: the heading + Clerk <SignIn>/<SignUp>
// (restyled flush via auth-appearance.ts) are passed in as `children` and
// render on the left pane under the logo.

const PANEL_IMAGE =
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80'

export default function AuthShell({
  panelTitle,
  panelSubtitle,
  children,
}: {
  panelTitle: string
  panelSubtitle: string
  children: ReactNode
}) {
  return (
    <div className="grid h-screen overflow-hidden lg:grid-cols-2">
      {/* ── Left: headless form on white ── */}
      <div className="flex h-full flex-col overflow-y-auto bg-white">
        <div className="px-8 pt-8 sm:px-12 lg:px-20">
          <Logo className="text-2xl" />
        </div>
        <div className="flex flex-1 flex-col justify-center px-8 py-6 sm:px-12 lg:px-20">
          <div className="mx-auto w-full max-w-[440px]">{children}</div>
        </div>

        <div className="px-8 pb-6 sm:px-12 lg:px-20">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
            <span>© OpusFesta. All rights reserved.</span>
            <span className="flex items-center gap-5">
              <a
                href="https://opusfesta.com/privacy-policy"
                className="hover:text-gray-600"
              >
                Privacy Policy
              </a>
              <a
                href="https://opusfesta.com/terms-of-use"
                className="hover:text-gray-600"
              >
                Terms &amp; Conditions
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* ── Right: dark feature panel (hidden on small screens) ── */}
      <div className="relative hidden overflow-hidden bg-[#0E0E10] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PANEL_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white xl:text-[40px] xl:leading-[1.1]">
            {panelTitle}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
            {panelSubtitle}
          </p>
          <div className="mt-8 flex gap-2" aria-hidden="true">
            <span className="h-1.5 w-6 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  )
}

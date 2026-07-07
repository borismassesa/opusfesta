'use client'

import type { ReactNode } from 'react'
import Logo from '@/components/ui/Logo'
import { usePortalT } from '@/components/providers/PortalUIStringsProvider'

// Two-pane auth layout shared by sign-in and sign-up — mirrors the OpusFesta
// Admin sign-in (form left on white, dark feature panel right). Layout only:
// our custom headless forms (SignInClient / SignUpClient, both useSignIn/
// useSignUp — no Clerk UI) are passed as `children` and render flush on the
// left pane under the logo. No Clerk <SignIn>/<SignUp> component is involved.

// Self-hosted in public/ so the panel can't break on a third-party hotlink.
const PANEL_IMAGE = '/auth-panel.jpg'

export default function AuthShell({
  panelTitle,
  panelSubtitle,
  children,
}: {
  panelTitle: string
  panelSubtitle: string
  children: ReactNode
}) {
  const t = usePortalT('auth')
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left: Clerk form on white ── */}
      <div className="flex min-h-screen flex-col bg-white">
        <div className="px-8 pt-8 sm:px-12 lg:px-20">
          <Logo className="h-8 w-auto" />
        </div>
        <div className="flex flex-1 flex-col justify-center px-8 py-6 sm:px-12 lg:px-20">
          <div className="mx-auto w-full max-w-[440px]">{children}</div>
        </div>

        <div className="px-8 pb-6 sm:px-12 lg:px-20">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
            <span>{t('footer_copyright')}</span>
            <span className="flex items-center gap-5">
              <a
                href="https://opusfesta.com/privacy-policy"
                className="hover:text-gray-600"
              >
                {t('footer_privacy_policy')}
              </a>
              <a
                href="https://opusfesta.com/terms-of-use"
                className="hover:text-gray-600"
              >
                {t('footer_terms')}
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

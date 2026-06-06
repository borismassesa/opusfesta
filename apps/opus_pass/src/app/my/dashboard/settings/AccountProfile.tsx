'use client'

import Link from 'next/link'
import { useClerk } from '@clerk/nextjs'
import { ShieldCheck, Settings, ChevronRight, LogOut } from 'lucide-react'

type Account = { name: string; email: string; imageUrl: string | null }

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.slice(0, 2).map((p) => p[0]).join('')
  return (letters || 'U').toUpperCase()
}

export default function AccountProfile({ account }: { account: Account }) {
  const { openUserProfile, signOut } = useClerk()

  return (
    <div className="mx-auto max-w-3xl space-y-7 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Account profile</h1>
        <p className="mt-1 text-sm text-[#1A1A1A]/55">Your account details and sign-in.</p>
      </div>

      {/* ── Profile header ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-r from-[#7E5896] via-[#C9A0DC] to-[#F3E9FA]" />
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#1A1A1A] text-2xl font-bold text-white shadow-sm">
                {account.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={account.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span>{initialsOf(account.name)}</span>
                )}
              </div>
              <div className="pb-1">
                <h2 className="text-lg font-bold leading-tight text-[#1A1A1A]">{account.name}</h2>
                {account.email ? (
                  <p className="text-sm text-[#1A1A1A]/55">{account.email}</p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => openUserProfile()}
              className="shrink-0 self-start rounded-full bg-[#1A1A1A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black sm:self-auto"
            >
              Manage account
            </button>
          </div>
        </div>
      </div>

      {/* ── Action rows ── */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => openUserProfile()}
          className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-[#C9A0DC]/60 sm:p-6"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C9A0DC]/15 text-[#7E5896]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold text-[#1A1A1A]">Sign-in &amp; security</span>
            <span className="block text-sm text-[#1A1A1A]/55">
              Email, password &amp; connected accounts
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
        </button>

        <Link
          href="/my/dashboard/wedding-settings"
          className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-[#C9A0DC]/60 sm:p-6"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C9A0DC]/15 text-[#7E5896]">
            <Settings className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold text-[#1A1A1A]">Wedding settings</span>
            <span className="block text-sm text-[#1A1A1A]/55">
              Couple details, pledge collection &amp; how guests see your celebration
            </span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
        </Link>
      </div>

      {/* ── Sign out ── */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: '/opuspass/sign-in' })}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import { hasTempAdminAccess, isTempAdminEnabled } from '@/lib/temp-admin'
import { submitTempAccess } from './actions'

export const dynamic = 'force-dynamic'

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function safeLocalRedirect(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'
  return value
}

export default async function TempAccessPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const error = firstParam(params?.error)
  const next = safeLocalRedirect(
    firstParam(params?.redirect_url) || firstParam(params?.redirect),
  )

  // Already holding a valid temp-access cookie → straight to the dashboard.
  if (await hasTempAdminAccess()) redirect(next)

  const enabled = isTempAdminEnabled()

  const message =
    error === 'disabled' || !enabled
      ? 'Temporary access is currently disabled.'
      : error
        ? 'Incorrect access code. Try again.'
        : null

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left: access form ── */}
      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-20">
          <div className="mx-auto w-full max-w-[400px]">
            <Logo className="h-8 w-auto" />

            <h1 className="mt-12 text-[28px] font-bold leading-tight tracking-tight text-[#1A1A1A]">
              Team access
            </h1>
            <p className="mt-2 text-[15px] text-gray-500">
              Enter the shared access code to open the admin dashboard.
            </p>

            <div className="mt-9">
              {message && (
                <p
                  className="mb-5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
                  role="alert"
                >
                  {message}
                </p>
              )}

              {enabled && (
                <form action={submitTempAccess} className="space-y-5">
                  <input type="hidden" name="redirect" value={next} />
                  <div>
                    <label
                      htmlFor="code"
                      className="mb-2 block text-sm font-medium text-[#1A1A1A]"
                    >
                      Access code
                    </label>
                    <input
                      id="code"
                      name="code"
                      type="password"
                      autoComplete="off"
                      autoFocus
                      required
                      placeholder="Enter the shared code"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[15px] text-[#1A1A1A] outline-none transition focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10 placeholder:text-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-lg bg-[#1A1A1A] py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
                  >
                    Continue
                  </button>
                </form>
              )}

              <p className="mt-8 text-center text-xs leading-relaxed text-gray-400">
                Temporary shared access. Grants full admin control — for internal
                team use only.
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 sm:px-12 lg:px-20">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
            <span>© OpusFesta. All rights reserved.</span>
            <a href="/sign-in" className="hover:text-gray-600">
              Use a personal account instead
            </a>
          </div>
        </div>
      </div>

      {/* ── Right: dark feature panel (hidden on small screens) ── */}
      <div className="relative hidden overflow-hidden bg-[#0E0E10] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/auth-panel.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white xl:text-[40px] xl:leading-[1.1]">
            Run every celebration from one place
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
            Manage content, vendors, reviews, and operations across the OpusFesta
            platform — all from one console.
          </p>
        </div>
      </div>
    </div>
  )
}

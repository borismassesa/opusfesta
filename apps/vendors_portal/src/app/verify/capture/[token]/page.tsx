import { ShieldCheck } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { verifyCaptureToken } from '@/lib/capture-token'
import MobileCaptureClient from './MobileCaptureClient'

export const dynamic = 'force-dynamic'

export default async function CapturePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const vendorId = verifyCaptureToken(token)

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <header className="px-5 py-4 border-b border-gray-100">
        <Logo className="h-7 w-auto" />
      </header>

      <main className="flex-1 px-5 py-8">
        <div className="mx-auto w-full max-w-md">
          {!vendorId ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
              <ShieldCheck className="mx-auto h-8 w-8 text-amber-600" />
              <h1 className="mt-3 text-lg font-semibold text-amber-900">
                This link has expired
              </h1>
              <p className="mt-1 text-sm text-amber-800">
                Capture links last 15 minutes. Go back to your computer and scan
                the QR code again to get a fresh link.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold tracking-tight">
                Capture your National ID
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Take a clear photo of the front and back of your Tanzania
                National ID. Make sure all text is readable.
              </p>
              <div className="mt-6">
                <MobileCaptureClient token={token} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

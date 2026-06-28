import { ShieldCheck } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { createSupabaseAdminClient } from '@/lib/supabase'
import UploadRequestClient from './UploadRequestClient'

export const dynamic = 'force-dynamic'

type RequestRow = {
  title: string
  details: string | null
  status: 'pending' | 'submitted' | 'completed' | 'cancelled'
  expires_at: string
}

function ClosedNotice({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
      <ShieldCheck className="mx-auto h-8 w-8 text-amber-600" />
      <h1 className="mt-3 text-lg font-semibold text-amber-900">{heading}</h1>
      <p className="mt-1 text-sm text-amber-800">{body}</p>
    </div>
  )
}

export default async function UploadPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const admin = createSupabaseAdminClient()
  const { data: req } = await admin
    .from('vendor_document_requests')
    .select('title, details, status, expires_at')
    .eq('token', token)
    .maybeSingle<RequestRow>()

  const expired = !!req && new Date(req.expires_at) < new Date()
  const closed = !!req && (req.status === 'completed' || req.status === 'cancelled')

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <header className="px-5 py-4 border-b border-gray-100">
        <Logo className="h-7 w-auto" />
      </header>

      <main className="flex-1 px-5 py-8">
        <div className="mx-auto w-full max-w-md">
          {!req ? (
            <ClosedNotice
              heading="This link is not valid"
              body="Double-check the link from your email, or ask your OpusFesta contact to send a fresh one."
            />
          ) : closed ? (
            <ClosedNotice
              heading="This request is closed"
              body="No upload is needed here anymore. If you think this is a mistake, reply to the email you received."
            />
          ) : expired ? (
            <ClosedNotice
              heading="This link has expired"
              body="Upload links are valid for a limited time. Reply to your email and we'll send a fresh one."
            />
          ) : (
            <>
              <h1 className="text-xl font-bold tracking-tight">{req.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {req.details ||
                  'Upload the requested document below. Accepted: PDF, JPG, PNG or WEBP, up to 25MB.'}
              </p>
              <div className="mt-6">
                <UploadRequestClient
                  token={token}
                  alreadySubmitted={req.status === 'submitted'}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

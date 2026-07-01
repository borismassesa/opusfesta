import { redirect } from 'next/navigation'

// The couple dashboard is unified on OpusPass. opusfesta.com no longer renders
// its own couple dashboard — it hands off to the OpusPass dashboard, which is
// the same Clerk account and the same Supabase data (one ecosystem). The
// `/opuspass/*` path 308-redirects to the OpusPass subdomain via
// NEXT_PUBLIC_OPUS_PASS_URL (see next.config.ts). Vendor-inquiry tracking is
// marketplace-specific and stays on opusfesta at /my/inquiries; the OpusPass
// dashboard links back to it.
export default function DashboardPage() {
  redirect('/opuspass/my/dashboard')
}

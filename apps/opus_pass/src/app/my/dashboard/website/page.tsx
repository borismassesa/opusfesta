import Link from 'next/link'
import { Globe, Palette, ArrowRight } from 'lucide-react'
import { Card, EmptyState } from '@/components/dashboard/primitives'
import { Button } from '@/components/dashboard/controls'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { loadDashboardHero } from '@/lib/cms/dashboard-hero'

export const dynamic = 'force-dynamic'

export default async function WebsitePage() {
  const hero = await loadDashboardHero('website')

  return (
    <div className="space-y-6">
      <DashboardHero
        content={hero}
        actions={
          <Link
            href="/websites"
            className="inline-flex items-center gap-2 rounded-full bg-black/[0.05] px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-black/[0.08]"
          >
            <Palette className="h-3.5 w-3.5" /> Browse designs
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold tracking-tight text-[#1A1A1A]">
            Build your wedding website
          </h2>
          <p className="mt-1 text-sm text-[#1A1A1A]/60">
            Pick a design, drop in your story and event details, and share one link with every
            guest. Bilingual, mobile-first and connected to your RSVPs automatically.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/websites">
              <Button>
                <Palette className="h-4 w-4" /> Browse designs <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/my/dashboard/events">
              <Button variant="secondary">Add an event first</Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold tracking-tight text-[#1A1A1A]">What you get</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#1A1A1A]/70">
            <li>· Story, schedule, travel and gifts</li>
            <li>· Live RSVP from your guest list</li>
            <li>· Custom cover photo or short video</li>
            <li>· Shareable on WhatsApp & SMS</li>
          </ul>
        </Card>
      </div>

      <EmptyState
        icon={<Globe className="h-7 w-7" />}
        title="Site builder coming soon"
        description="In the meantime, set your cover above so it's ready the moment the builder lands."
      />
    </div>
  )
}

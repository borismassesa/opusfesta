'use client'

import Link from 'next/link'
import {
  Calendar, ChevronRight, Heart, ListTodo,
  MapPin, MessageCircle, Sparkles, Users, Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Constants ─────────────────────────────────────────────────────────────────

const BUDGET_LABELS: Record<string, string> = {
  under_5m:    'Under TZS 5M',
  '5m_15m':    'TZS 5–15M',
  '15m_30m':   'TZS 15–30M',
  '30m_50m':   'TZS 30–50M',
  over_50m:    'Over TZS 50M',
  undisclosed: 'Not disclosed',
}

const STATUS_LABEL: Record<string, string> = {
  pending:   'Pending reply',
  responded: 'Replied',
  accepted:  'Accepted',
  declined:  'Declined',
  closed:    'Closed',
}

const STATUS_DOT: Record<string, string> = {
  pending:   'bg-amber-400',
  responded: 'bg-blue-400',
  accepted:  'bg-emerald-400',
  declined:  'bg-red-400',
  closed:    'bg-gray-300',
}

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700',
  responded: 'bg-blue-50 text-blue-700',
  accepted:  'bg-emerald-50 text-emerald-700',
  declined:  'bg-red-50 text-red-600',
  closed:    'bg-gray-100 text-gray-500',
}

// ── Types ─────────────────────────────────────────────────────────────────────

type CoupleProfile = {
  partner1_name: string | null
  partner2_name: string | null
  wedding_date: string | null
  date_undecided: boolean | null
  city: string | null
  region: string | null
  guest_count: number | null
  budget_range: string | null
  preferred_categories: string[] | null
}

type InquirySummary = {
  total: number
  pending: number
  responded: number
  accepted: number
  declined: number
  closed: number
}

type RecentInquiry = {
  id: string
  vendor_name: string | null
  vendor_slug: string | null
  status: string | null
  created_at: string
  event_date: string | null
  location: string | null
}

type Props = {
  clerkUserId: string
  clerkName: string | null
  clerkEmail: string | null
  profile: CoupleProfile | null
  inquirySummary: InquirySummary
  recentInquiries: RecentInquiry[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatLong(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatShort(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, sub, accent, compact,
}: {
  label: string; value: string; icon: React.ElementType
  sub?: string; accent?: boolean; compact?: boolean
}) {
  return (
    <div className={cn(
      'rounded-xl border p-4 flex flex-col gap-0.5',
      accent ? 'bg-(--accent)/8 border-(--accent)/20' : 'bg-white border-gray-100',
    )}>
      <Icon className={cn('w-4 h-4 mb-1.5', accent ? 'text-(--accent)' : 'text-gray-400')} />
      <p className={cn(
        'font-extrabold leading-tight',
        compact ? 'text-sm' : 'text-2xl tabular-nums',
        accent ? 'text-(--accent)' : 'text-[#1A1A1A]',
      )}>
        {value}
      </p>
      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{sub}</p>
    </div>
  )
}

function QuickAction({
  href, icon: Icon, label, sub, accent,
}: {
  href: string; icon: React.ElementType; label: string; sub: string; accent?: boolean
}) {
  return (
    <Link href={href} className={cn(
      'flex flex-col gap-1.5 p-4 rounded-xl border transition-all hover:shadow-sm group',
      accent
        ? 'bg-(--accent)/8 border-(--accent)/20 hover:bg-(--accent)/12'
        : 'bg-white border-gray-100 hover:border-gray-200',
    )}>
      <Icon className={cn(
        'w-5 h-5 transition-colors',
        accent ? 'text-(--accent)' : 'text-gray-400 group-hover:text-[#1A1A1A]',
      )} />
      <p className="text-sm font-bold text-[#1A1A1A] leading-tight">{label}</p>
      <p className="text-xs text-gray-400 leading-snug">{sub}</p>
    </Link>
  )
}

function PipelineCard({ dotClass, label, count }: { dotClass: string; label: string; count: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className={cn('w-2 h-2 rounded-full mb-3', dotClass)} />
      <p className="text-2xl font-extrabold text-[#1A1A1A] tabular-nums">{count}</p>
      <p className="text-[11px] text-gray-400 font-medium mt-0.5 leading-tight">{label}</p>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function DashboardClient({
  clerkName, clerkEmail, profile, inquirySummary, recentInquiries,
}: Props) {
  const coupleName = profile
    ? [profile.partner1_name, profile.partner2_name].filter(Boolean).join(' & ')
    : clerkName

  const hasWeddingDate = profile && !profile.date_undecided && profile.wedding_date
  const days = hasWeddingDate ? daysUntil(profile.wedding_date!) : null
  const profileComplete = !!(profile?.partner1_name && profile?.city)

  // Nudges for missing profile fields
  const nudges: string[] = []
  if (profile && !profile.wedding_date && !profile.date_undecided) nudges.push('Add your wedding date')
  if (profile && !profile.budget_range) nudges.push('Set a budget range')
  if (profile && !profile.guest_count) nudges.push('Estimate your guest count')

  if (!profile) {
    return (
      <div className="px-4 py-10 sm:px-8 sm:py-16 max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-(--accent)/10 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-8 h-8 text-(--accent)" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Welcome{clerkName ? `, ${clerkName.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
            Complete your wedding profile to unlock your personalised event management dashboard — countdown, vendor tracking, planning checklist, and more.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 bg-(--accent) text-(--on-accent) hover:bg-(--accent-hover) px-6 py-3 rounded-full font-bold text-sm transition-colors"
          >
            Set up my profile
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-8 space-y-6 max-w-4xl">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-[#1A1A1A] text-white p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <div className="relative">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/30 mb-2">Your Wedding</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 leading-none">
            {coupleName ?? 'Your Wedding'}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-white/50">
            {hasWeddingDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/40" />
                {formatLong(profile.wedding_date!)}
              </span>
            )}
            {(profile.city || profile.region) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/40" />
                {[profile.city, profile.region].filter(Boolean).join(', ')}
              </span>
            )}
            {profile.date_undecided && (
              <span className="italic text-white/30">Date to be decided</span>
            )}
          </div>

          {days !== null && (
            <div className="mt-6 flex items-end gap-3">
              <span className="text-7xl sm:text-8xl font-black leading-none tabular-nums">
                {Math.max(days, 0)}
              </span>
              <div className="pb-2 text-white/50 leading-tight">
                <p className="text-base font-semibold text-white/80">
                  {days > 0 ? 'days to go' : days === 0 ? '🎉 Today!' : 'days since your wedding'}
                </p>
                {days > 0 && <p className="text-xs mt-0.5">Your big day is approaching</p>}
              </div>
            </div>
          )}

          {!hasWeddingDate && !profile.date_undecided && (
            <Link
              href="/my/profile"
              className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-white/50 hover:text-white transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Add your wedding date →
            </Link>
          )}
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Guests"
          value={profile.guest_count != null ? profile.guest_count.toLocaleString() : '—'}
          icon={Users}
          sub="expected guests"
        />
        <StatCard
          label="Budget"
          value={profile.budget_range ? BUDGET_LABELS[profile.budget_range] : '—'}
          icon={Wallet}
          sub="estimated budget"
          compact
        />
        <StatCard
          label="Inquiries"
          value={String(inquirySummary.total)}
          icon={MessageCircle}
          sub={
            inquirySummary.accepted > 0
              ? `${inquirySummary.accepted} vendor${inquirySummary.accepted > 1 ? 's' : ''} confirmed`
              : 'total sent'
          }
          accent={inquirySummary.accepted > 0}
        />
      </div>

      {/* ── Profile nudges ──────────────────────────────────────────────────── */}
      {profileComplete && nudges.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 mb-1.5">Complete your profile</p>
            <ul className="space-y-1">
              {nudges.map(n => (
                <li key={n} className="text-xs text-amber-700 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                  {n}
                </li>
              ))}
            </ul>
          </div>
          <Link href="/my/profile" className="shrink-0 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors whitespace-nowrap">
            Edit →
          </Link>
        </div>
      )}

      {/* ── Vendor Pipeline ─────────────────────────────────────────────────── */}
      {inquirySummary.total > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.1em] text-gray-400">Vendor Pipeline</h2>
            <Link
              href="/my/inquiries"
              className="text-xs font-semibold text-(--accent) hover:text-(--accent-hover) transition-colors flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <PipelineCard dotClass="bg-amber-400"   label="Pending reply" count={inquirySummary.pending} />
            <PipelineCard dotClass="bg-blue-400"    label="Replied"       count={inquirySummary.responded} />
            <PipelineCard dotClass="bg-emerald-400" label="Accepted"      count={inquirySummary.accepted} />
            <PipelineCard dotClass="bg-gray-300"    label="Closed"        count={inquirySummary.closed + inquirySummary.declined} />
          </div>
        </section>
      )}

      {/* ── Recent Inquiries ────────────────────────────────────────────────── */}
      {recentInquiries.length > 0 && (
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-[0.1em] text-gray-400 mb-3">Recent Inquiries</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {recentInquiries.map(inq => {
              const status = inq.status ?? 'pending'
              return (
                <Link
                  key={inq.id}
                  href={`/my/inquiries/${inq.id}`}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', STATUS_DOT[status])} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                      {inq.vendor_name ?? inq.vendor_slug ?? 'Unknown vendor'}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', STATUS_BADGE[status])}>
                        {STATUS_LABEL[status]}
                      </span>
                      {inq.event_date && (
                        <span className="text-xs text-gray-400">{formatShort(inq.event_date)}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Quick Actions ───────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-extrabold uppercase tracking-[0.1em] text-gray-400 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction
            href="/vendors"
            icon={Heart}
            label="Browse Vendors"
            sub="Find photographers, caterers, venues & more"
          />
          <QuickAction
            href="/my/planning"
            icon={ListTodo}
            label="Planning Checklist"
            sub="Track every task before the big day"
            accent
          />
          <QuickAction
            href="/my/inquiries"
            icon={MessageCircle}
            label="My Inquiries"
            sub={
              inquirySummary.total > 0
                ? `${inquirySummary.total} conversation${inquirySummary.total > 1 ? 's' : ''} with vendors`
                : 'No quote requests yet'
            }
          />
          <QuickAction
            href="/my/profile"
            icon={Users}
            label="Edit Profile"
            sub="Update your wedding details"
          />
        </div>
      </section>

    </div>
  )
}

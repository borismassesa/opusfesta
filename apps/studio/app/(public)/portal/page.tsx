'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BsCalendar3, BsPlusLg, BsArrowRight } from 'react-icons/bs';
import PortalLoader from '@/components/portal/PortalLoader';
import { useClientAuth } from '@/components/portal/ClientAuthProvider';
import BookingCard from '@/components/portal/BookingCard';
import DashboardStats from '@/components/portal/DashboardStats';
import PendingActionBanner from '@/components/portal/PendingActionBanner';
import UpcomingEventCard from '@/components/portal/UpcomingEventCard';

interface Booking {
  id: string;
  event_type: string;
  event_date: string | null;
  event_time_slot: string | null;
  service: string | null;
  lifecycle_status: string;
  created_at: string;
}

interface DashboardData {
  stats: {
    activeBookings: number;
    totalBookings: number;
    unreadMessages: number;
    outstandingBalance: number;
    totalSpent: number;
  };
  nextEvent: {
    id: string;
    event_type: string;
    event_date: string;
    event_time_slot: string | null;
    service: string | null;
    lifecycle_status: string;
  } | null;
  pendingActions: {
    id: string;
    event_type: string;
    lifecycle_status: string;
    event_date: string | null;
  }[];
}

export default function PortalDashboard() {
  const { client, loading: clientLoading } = useClientAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (retries = 2) => {
    try {
      const [bookingsRes, dashboardRes] = await Promise.all([
        fetch('/api/portal/bookings'),
        fetch('/api/portal/dashboard'),
      ]);

      if (bookingsRes.ok && dashboardRes.ok) {
        const [bookingsData, dashboardData] = await Promise.all([
          bookingsRes.json(),
          dashboardRes.json(),
        ]);
        setBookings(bookingsData.bookings || []);
        setDashboard(dashboardData);
        setLoading(false);
        return;
      }

      // Session expired — redirect to login
      if (bookingsRes.status === 401 || dashboardRes.status === 401) {
        window.location.href = '/portal/login';
        return;
      }

      setLoading(false);
    } catch {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 1000));
        return fetchData(retries - 1);
      }
      setLoading(false);
    }
  }, []);

  // Wait for client profile to be ready before fetching
  useEffect(() => {
    if (clientLoading) return;
    if (!client) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [client, clientLoading, fetchData]);

  if (clientLoading) {
    return <PortalLoader />;
  }

  const displayName = client?.name || 'Client';
  const activeBookings = bookings.filter(
    (b) => !['completed', 'cancelled'].includes(b.lifecycle_status)
  );

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-mono font-bold text-brand-accent uppercase tracking-[0.3em] mb-1">
            Welcome back
          </p>
          <h1 className="text-lg sm:text-2xl font-bold text-brand-dark font-mono uppercase tracking-wider truncate">
            {displayName}
          </h1>
        </div>
        <Link
          href="/portal/book"
          className="flex items-center gap-1.5 sm:gap-2 border-3 border-brand-border bg-brand-dark text-white px-3 sm:px-4 py-2 sm:py-2.5 font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal shrink-0"
        >
          <BsPlusLg className="w-3 h-3" />
          <span className="hidden sm:inline">New Booking</span>
          <span className="sm:hidden">Book</span>
        </Link>
      </div>

      {/* Dashboard content */}
      {loading ? (
        <div className="space-y-4">
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border-3 border-brand-border/30 bg-white p-3 sm:p-4 animate-pulse"
              >
                <div className="h-3 w-16 sm:w-20 bg-brand-bg mb-2 sm:mb-3" />
                <div className="h-4 sm:h-5 w-12 sm:w-16 bg-brand-bg mb-1" />
                <div className="h-2 w-10 sm:w-12 bg-brand-bg" />
              </div>
            ))}
          </div>
          {/* Cards skeleton */}
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border-3 border-brand-border/30 bg-white p-6 animate-pulse"
            >
              <div className="h-4 w-48 bg-brand-bg mb-3" />
              <div className="h-3 w-32 bg-brand-bg" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="border-3 border-brand-border bg-white p-8 sm:p-12 text-center shadow-brutal">
          <BsCalendar3 className="w-8 h-8 sm:w-10 sm:h-10 text-brand-border mx-auto mb-3 sm:mb-4" />
          <h2 className="text-base sm:text-lg font-bold text-brand-dark font-mono uppercase mb-2">
            No Bookings Yet
          </h2>
          <p className="text-brand-muted text-xs sm:text-sm mb-4 sm:mb-6">
            Start by booking a session with our studio.
          </p>
          <Link
            href="/portal/book"
            className="inline-flex items-center gap-2 border-3 border-brand-border bg-brand-dark text-white px-4 sm:px-6 py-2.5 sm:py-3 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal"
          >
            <BsPlusLg className="w-3 h-3" />
            Book a Session
          </Link>
        </div>
      ) : (
        <>
          {/* Stats row */}
          {dashboard && (
            <DashboardStats
              activeBookings={dashboard.stats.activeBookings}
              totalBookings={dashboard.stats.totalBookings}
              unreadMessages={dashboard.stats.unreadMessages}
              outstandingBalance={dashboard.stats.outstandingBalance}
              totalSpent={dashboard.stats.totalSpent}
            />
          )}

          {/* Pending actions banner */}
          {dashboard && dashboard.pendingActions.length > 0 && (
            <PendingActionBanner actions={dashboard.pendingActions} />
          )}

          {/* Upcoming event + quick actions */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
            {/* Upcoming event card */}
            {dashboard?.nextEvent && (
              <UpcomingEventCard event={dashboard.nextEvent} />
            )}

            {/* Quick actions — hidden on mobile since bottom nav covers these */}
            <div className="hidden sm:block border-3 border-brand-border bg-white shadow-brutal p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold text-brand-muted uppercase tracking-wider">
                  Quick Actions
                </span>
              </div>
              <div className="space-y-2">
                <Link
                  href="/portal/bookings"
                  className="flex items-center justify-between p-2.5 sm:p-3 border-2 border-brand-border/50 hover:border-brand-accent transition-colors group"
                >
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-brand-dark uppercase tracking-wider">
                    All Bookings
                  </span>
                  <BsArrowRight className="w-3 h-3 text-brand-muted group-hover:text-brand-accent transition-colors" />
                </Link>
                <Link
                  href="/portal/messages"
                  className="flex items-center justify-between p-2.5 sm:p-3 border-2 border-brand-border/50 hover:border-brand-accent transition-colors group"
                >
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-brand-dark uppercase tracking-wider">
                    Messages
                    {dashboard && dashboard.stats.unreadMessages > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-brand-accent text-white text-[9px] font-bold">
                        {dashboard.stats.unreadMessages}
                      </span>
                    )}
                  </span>
                  <BsArrowRight className="w-3 h-3 text-brand-muted group-hover:text-brand-accent transition-colors" />
                </Link>
                <Link
                  href="/portal/settings"
                  className="flex items-center justify-between p-2.5 sm:p-3 border-2 border-brand-border/50 hover:border-brand-accent transition-colors group"
                >
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-brand-dark uppercase tracking-wider">
                    Account Settings
                  </span>
                  <BsArrowRight className="w-3 h-3 text-brand-muted group-hover:text-brand-accent transition-colors" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent active bookings */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-mono font-bold text-brand-muted uppercase tracking-wider">
                {activeBookings.length > 0
                  ? `Active Bookings (${activeBookings.length})`
                  : `Recent Bookings (${bookings.length})`}
              </h2>
              <Link
                href="/portal/bookings"
                className="flex items-center gap-1 text-xs font-mono font-bold text-brand-accent hover:text-brand-dark transition-colors uppercase tracking-wider"
              >
                View All <BsArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {(activeBookings.length > 0 ? activeBookings : bookings)
                .slice(0, 3)
                .map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
            </div>
            {bookings.length > 3 && (
              <Link
                href="/portal/bookings"
                className="block mt-4 text-center text-sm font-mono font-bold text-brand-accent hover:text-brand-dark transition-colors"
              >
                View all {bookings.length} bookings →
              </Link>
            )}
          </section>
        </>
      )}
    </div>
  );
}

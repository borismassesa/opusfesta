'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { BsCalendar3, BsPlusLg, BsArrowRight } from 'react-icons/bs';
import PortalLoader from '@/components/portal/PortalLoader';
import { useUser } from '@clerk/nextjs';
import { useClientAuth } from '@/components/portal/ClientAuthProvider';
import BookingCard from '@/components/portal/BookingCard';

interface Booking {
  id: string;
  event_type: string;
  event_date: string | null;
  event_time_slot: string | null;
  service: string | null;
  lifecycle_status: string;
  created_at: string;
}

export default function PortalDashboard() {
  const { user, isLoaded } = useUser();
  const { client, loading: clientLoading } = useClientAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async (retries = 2) => {
    try {
      const res = await fetch('/api/portal/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setLoading(false);
        return;
      }

      // If 401, auth might not be ready yet — retry after a short delay
      if (res.status === 401 && retries > 0) {
        await new Promise(r => setTimeout(r, 1000));
        return fetchBookings(retries - 1);
      }

      setLoading(false);
    } catch {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 1000));
        return fetchBookings(retries - 1);
      }
      setLoading(false);
    }
  }, []);

  // Wait for BOTH Clerk user AND client profile to be ready before fetching bookings
  useEffect(() => {
    if (!isLoaded || !user || clientLoading) return;
    if (!client) {
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [isLoaded, user, client, clientLoading, fetchBookings]);

  if (!isLoaded || clientLoading) {
    return <PortalLoader />;
  }

  const displayName = client?.name || user?.fullName || user?.firstName || 'Client';
  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.lifecycle_status));

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-mono font-bold text-brand-accent uppercase tracking-[0.3em] mb-1">
            Welcome back
          </p>
          <h1 className="text-2xl font-bold text-brand-dark font-mono uppercase tracking-wider">
            {displayName}
          </h1>
        </div>
        <Link
          href="/portal/book"
          className="flex items-center gap-2 border-3 border-brand-border bg-brand-dark text-white px-4 py-2.5 font-mono font-bold text-xs uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal"
        >
          <BsPlusLg className="w-3 h-3" />
          New Booking
        </Link>
      </div>

      {/* Bookings preview */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="border-3 border-brand-border/30 bg-white p-6 animate-pulse">
              <div className="h-4 w-48 bg-brand-bg mb-3" />
              <div className="h-3 w-32 bg-brand-bg" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="border-3 border-brand-border bg-white p-12 text-center shadow-brutal">
          <BsCalendar3 className="w-10 h-10 text-brand-border mx-auto mb-4" />
          <h2 className="text-lg font-bold text-brand-dark font-mono uppercase mb-2">No Bookings Yet</h2>
          <p className="text-brand-muted text-sm mb-6">
            Start by booking a session with our studio.
          </p>
          <Link
            href="/portal/book"
            className="inline-flex items-center gap-2 border-3 border-brand-border bg-brand-dark text-white px-6 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal"
          >
            <BsPlusLg className="w-3 h-3" />
            Book a Session
          </Link>
        </div>
      ) : (
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
            {(activeBookings.length > 0 ? activeBookings : bookings).slice(0, 3).map(b => (
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
      )}
    </div>
  );
}

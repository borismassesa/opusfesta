'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { BsCalendar3, BsPlusLg } from 'react-icons/bs';
import PortalLoader from '@/components/portal/PortalLoader';
import { useUser } from '@clerk/nextjs';
import { useClientAuth } from '@/components/portal/ClientAuthProvider';
import BookingCard from '@/components/portal/BookingCard';
import BookingFilters from '@/components/portal/BookingFilters';

interface Booking {
  id: string;
  event_type: string;
  event_date: string | null;
  event_time_slot: string | null;
  service: string | null;
  lifecycle_status: string;
  created_at: string;
}

export default function PortalBookingsPage() {
  const { user, isLoaded } = useUser();
  const { client, loading: clientLoading } = useClientAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBookings = useCallback(async (retries = 2) => {
    try {
      const res = await fetch('/api/portal/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setLoading(false);
        return;
      }

      if (res.status === 401 && retries > 0) {
        await new Promise((r) => setTimeout(r, 1000));
        return fetchBookings(retries - 1);
      }

      setLoading(false);
    } catch {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 1000));
        return fetchBookings(retries - 1);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !user || clientLoading) return;
    if (!client) {
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [isLoaded, user, client, clientLoading, fetchBookings]);

  const activeBookings = useMemo(
    () => bookings.filter((b) => !['completed', 'cancelled'].includes(b.lifecycle_status)),
    [bookings]
  );
  const pastBookings = useMemo(
    () => bookings.filter((b) => ['completed', 'cancelled'].includes(b.lifecycle_status)),
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    let list = bookings;
    if (activeTab === 'active') list = activeBookings;
    if (activeTab === 'past') list = pastBookings;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.event_type.toLowerCase().includes(q) ||
          (b.service && b.service.toLowerCase().includes(q)) ||
          b.lifecycle_status.toLowerCase().includes(q) ||
          (b.event_date && b.event_date.includes(q))
      );
    }

    return list;
  }, [bookings, activeBookings, pastBookings, activeTab, searchQuery]);

  if (!isLoaded || clientLoading) {
    return <PortalLoader message="Loading bookings" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-mono font-bold text-brand-accent uppercase tracking-[0.3em] mb-1">
            Client Portal
          </p>
          <h1 className="text-lg sm:text-2xl font-bold text-brand-dark font-mono uppercase tracking-wider">
            My Bookings
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

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
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
        <div className="border-3 border-brand-border bg-white p-12 text-center shadow-brutal">
          <BsCalendar3 className="w-10 h-10 text-brand-border mx-auto mb-4" />
          <h2 className="text-lg font-bold text-brand-dark font-mono uppercase mb-2">
            No Bookings Yet
          </h2>
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
        <>
          {/* Filters */}
          <BookingFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            counts={{
              all: bookings.length,
              active: activeBookings.length,
              past: pastBookings.length,
            }}
          />

          {/* Results */}
          {filteredBookings.length === 0 ? (
            <div className="border-3 border-brand-border bg-white p-8 text-center">
              <p className="text-sm text-brand-muted font-mono">
                {searchQuery
                  ? 'No bookings match your search.'
                  : 'No bookings in this category.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

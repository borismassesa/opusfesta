'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Sparkles, FolderOpen, Wrench } from 'lucide-react';
import AdminCard from '@/components/admin/ui/AdminCard';
import AdminTable from '@/components/admin/ui/AdminTable';
import AdminBadge from '@/components/admin/ui/AdminBadge';
import AdminToast from '@/components/admin/ui/AdminToast';
import type { StudioBooking, StudioBookingStatus } from '@/lib/studio-types';

interface DashboardData {
  stats: { totalBookings: number; newBookings: number; publishedProjects: number; totalProjects: number; publishedArticles: number; totalArticles: number; activeServices: number };
  recentBookings: StudioBooking[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/dashboard').then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="bg-white border border-gray-200 p-5 h-24 animate-pulse" />)}
        </div>
        <div className="bg-white border border-gray-200 h-64 animate-pulse" />
      </div>
    );
  }

  if (!data) return <p className="text-gray-500">Failed to load dashboard.</p>;

  const { stats, recentBookings } = data;

  return (
    <div className="space-y-6">
      <AdminToast />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard title="Total Bookings" value={stats.totalBookings} subtitle={`${stats.newBookings} new`} icon={<CalendarCheck className="w-5 h-5" />} />
        <AdminCard title="New Enquiries" value={stats.newBookings} icon={<Sparkles className="w-5 h-5" />} />
        <AdminCard title="Projects" value={stats.publishedProjects} subtitle={`${stats.totalProjects} total`} icon={<FolderOpen className="w-5 h-5" />} />
        <AdminCard title="Active Services" value={stats.activeServices} icon={<Wrench className="w-5 h-5" />} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Bookings</h2>
        <AdminTable
          data={recentBookings}
          keyField="id"
          emptyMessage="No bookings yet."
          onRowClick={(b) => router.push(`/admin/bookings/${b.id}`)}
          columns={[
            { key: 'name', header: 'Name', render: (b) => <span className="font-medium text-gray-900">{b.name}</span> },
            { key: 'event_type', header: 'Event', render: (b) => b.event_type },
            { key: 'service', header: 'Service', render: (b) => b.service || '—' },
            { key: 'status', header: 'Status', render: (b) => <AdminBadge status={b.status as StudioBookingStatus} /> },
            { key: 'created_at', header: 'Date', render: (b) => new Date(b.created_at).toLocaleDateString() },
          ]}
        />
      </div>
    </div>
  );
}

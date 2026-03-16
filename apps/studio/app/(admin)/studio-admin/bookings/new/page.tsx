'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BsArrowLeft } from 'react-icons/bs';
import AdminButton from '@/components/admin/ui/AdminButton';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
import BookingForm, { type BookingFormData } from '@/components/admin/forms/BookingForm';

export default function NewBookingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: BookingFormData) => {
    setError(null);
    const res = await fetch('/api/admin/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error || 'Failed to create booking');
      return;
    }

    router.push(`/admin/bookings/${result.booking.id}`);
  };

  return (
    <div className="space-y-6">
      <AdminButton
        variant="ghost"
        onClick={() => router.push('/studio-admin/bookings')}
        icon={<BsArrowLeft className="w-4 h-4" />}
      >
        Back to Bookings
      </AdminButton>

      <AdminPageHeader
        title="New Booking"
        description="Create a booking on behalf of a client who called, walked in, or reached out via WhatsApp. The booking enters the lifecycle so you can send quotes, contracts, and track payments."
        tips={[
          'By default, the booking starts at "Qualified" — ready for you to send a quote.',
          'Choose "New Intake" if you want the booking to go through the review step first.',
          'The source field helps you track how clients find your studio.',
          'After creating, you\'ll be taken to the booking detail page to continue the workflow.',
        ]}
      />

      {error && (
        <div className="border border-[var(--admin-destructive)] bg-red-50 p-4 rounded-[var(--admin-radius)]">
          <p className="text-sm font-medium text-[var(--admin-destructive)]">{error}</p>
        </div>
      )}

      <BookingForm onSubmit={handleSubmit} />
    </div>
  );
}

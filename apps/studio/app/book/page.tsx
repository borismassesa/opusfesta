import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import BookingWidget from '@/components/BookingWidget';

export const metadata: Metadata = {
  title: 'Book a Session | OpusStudio',
  description: 'Reserve a session with the OpusStudio team. Pick a time, share your project, confirm.',
};

export default function BookPage() {
  return (
    <PageLayout>
      <section className="py-20 lg:py-24 bg-brand-bg border-b-4 border-brand-border">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-5 block">
            Bookings
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.9]">
            BOOK A<br />
            <span className="text-stroke">SESSION.</span>
          </h1>
          <p className="mt-6 max-w-[640px] text-base text-brand-dark/70">
            Pick a time that works for you. We&apos;ll confirm within a day and follow up with the details.
          </p>
        </div>
      </section>
      <section className="py-16 lg:py-20 bg-brand-bg">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <BookingWidget />
        </div>
      </section>
    </PageLayout>
  );
}

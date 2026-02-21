import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';

export const metadata: Metadata = {
  title: 'Terms of Service | OpusFesta Studio',
  description: 'Terms and conditions for using OpusFesta Studio services.',
};

export default function TermsPage() {
  return (
    <PageLayout>
      <section className="py-24 bg-brand-bg">
        <div className="max-w-[900px] mx-auto px-6 lg:px-12">
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
            Legal
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-brand-dark leading-[0.9] mb-12">
            TERMS OF<br />
            <span className="text-stroke">SERVICE.</span>
          </h1>

          <div className="space-y-8 text-neutral-600 font-light leading-relaxed">
            <div>
              <h2 className="text-lg font-bold text-brand-dark tracking-tight mb-3">1. Services</h2>
              <p>OpusFesta Studio provides professional photography, videography, and visual content creation services. All services are subject to availability and confirmed upon receipt of a signed agreement and deposit payment.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-dark tracking-tight mb-3">2. Bookings & Deposits</h2>
              <p>A non-refundable deposit of 30% is required to secure your booking date. The remaining balance is due 14 days before the event date. All prices quoted are exclusive of travel and accommodation costs unless otherwise stated.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-dark tracking-tight mb-3">3. Cancellations</h2>
              <p>Cancellations made more than 60 days before the event date will forfeit the deposit only. Cancellations within 60 days of the event date will incur the full project fee. We reserve the right to cancel in the event of force majeure, in which case a full refund will be provided.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-dark tracking-tight mb-3">4. Deliverables</h2>
              <p>Estimated delivery timelines are provided at the time of booking. While we make every effort to meet stated timelines, delivery dates are estimates and not guarantees. Raw, unedited footage and photographs are not included in any package unless explicitly agreed.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-dark tracking-tight mb-3">5. Copyright & Usage</h2>
              <p>OpusFesta Studio retains copyright of all produced content. Clients receive a perpetual, non-exclusive licence to use delivered materials for personal or agreed commercial purposes. We reserve the right to use completed work in our portfolio and marketing materials unless a confidentiality agreement is in place.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-dark tracking-tight mb-3">6. Liability</h2>
              <p>Our total liability is limited to the fees paid for the specific project. We are not liable for circumstances beyond our reasonable control, including but not limited to venue restrictions, weather conditions, or equipment failure due to extreme conditions.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-brand-dark tracking-tight mb-3">7. Contact</h2>
              <p>For questions about these terms, please contact us at <a href="mailto:studio@opusfesta.com" className="text-brand-accent hover:underline">studio@opusfesta.com</a>.</p>
            </div>

            <p className="text-sm text-neutral-400 font-mono pt-4 border-t-2 border-brand-border">
              Last updated: February 2026
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

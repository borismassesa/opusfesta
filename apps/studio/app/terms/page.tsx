import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms | OpusFesta Studio",
  description: "Terms and conditions for OpusFesta Studio services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-brand-bg">
      <section className="pt-28 pb-16 border-b-4 border-brand-border">
        <div className="max-w-[900px] mx-auto px-6 lg:px-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-brand-dark mb-8">Terms &amp; Conditions</h1>
          <div className="space-y-5 text-neutral-600 leading-relaxed font-light">
            <p>Project bookings are confirmed after written acceptance and deposit terms agreed by both parties.</p>
            <p>Delivery timelines vary by scope and are confirmed in your proposal before production starts.</p>
            <p>Usage rights, revisions, and cancellation terms are outlined in each signed project agreement.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

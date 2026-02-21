import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | OpusFesta Studio",
  description: "Privacy policy for OpusFesta Studio website and enquiries.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-brand-bg">
      <section className="pt-28 pb-16 border-b-4 border-brand-border">
        <div className="max-w-[900px] mx-auto px-6 lg:px-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-brand-dark mb-8">Privacy Policy</h1>
          <div className="space-y-5 text-neutral-600 leading-relaxed font-light">
            <p>We collect only the information needed to respond to enquiries and deliver studio services.</p>
            <p>Booking submissions include contact and event details and are used only for project communication.</p>
            <p>We do not sell personal data. If you need data removal or updates, email studio@opusfesta.com.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

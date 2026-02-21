import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal | OpusFesta Studio",
  description: "Insights, process notes, and behind-the-scenes stories from OpusFesta Studio.",
};

export default function JournalPage() {
  return (
    <main className="min-h-screen bg-brand-bg">
      <section className="pt-28 pb-16 border-b-4 border-brand-border">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
            Studio Journal
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-brand-dark leading-[0.9] mb-6">
            INSIGHTS
            <br />
            IN PROGRESS.
          </h1>
          <p className="text-neutral-600 text-base sm:text-lg font-light leading-relaxed max-w-3xl">
            We are preparing the full journal archive. For now, reach out through booking to request our latest case
            studies and process notes.
          </p>
        </div>
      </section>
    </main>
  );
}

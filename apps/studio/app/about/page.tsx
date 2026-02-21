import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | OpusFesta Studio",
  description: "Meet the OpusFesta Studio team and our creative approach to wedding and event storytelling.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-brand-bg">
      <section className="pt-28 pb-16 border-b-4 border-brand-border">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
            Our Story
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-brand-dark leading-[0.9] mb-8">
            WE CRAFT
            <br />
            VISUAL STORIES.
          </h1>
          <p className="text-neutral-600 text-base sm:text-lg font-light leading-relaxed max-w-3xl">
            OpusFesta Studio is a collective of filmmakers, photographers, and producers focused on timeless stories.
            We blend documentary sensitivity with high-end production detail to create visuals that feel honest, sharp,
            and cinematic.
          </p>
        </div>
      </section>
    </main>
  );
}

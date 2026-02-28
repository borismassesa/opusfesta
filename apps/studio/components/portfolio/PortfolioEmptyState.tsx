export default function PortfolioEmptyState() {
  return (
    <div className="border-4 border-brand-border bg-brand-bg px-6 py-20 text-center">
      <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-brand-accent">Portfolio</p>
      <h2 className="mb-3 text-3xl font-bold uppercase tracking-tight text-brand-dark">No Items Yet</h2>
      <p className="mx-auto max-w-xl text-sm leading-relaxed text-neutral-600">
        We are preparing the next set of visual stories. Please check back soon for fresh work in image and motion.
      </p>
    </div>
  );
}

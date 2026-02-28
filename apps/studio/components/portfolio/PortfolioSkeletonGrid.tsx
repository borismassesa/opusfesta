export default function PortfolioSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden border-4 border-brand-border bg-brand-bg"
          aria-hidden="true"
        >
          <div className="aspect-video animate-pulse bg-brand-dark/10" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-1/2 animate-pulse bg-brand-dark/10" />
            <div className="h-6 w-3/4 animate-pulse bg-brand-dark/15" />
            <div className="h-3 w-full animate-pulse bg-brand-dark/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

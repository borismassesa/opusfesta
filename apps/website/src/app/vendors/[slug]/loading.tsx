export default function VendorLoading() {
  return (
    <div className="bg-background text-primary min-h-screen">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        {/* Hero Skeleton */}
        <div className="pt-20 pb-8">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-surface animate-pulse rounded" />
              <div className="h-10 w-3/4 bg-surface animate-pulse rounded" />
              <div className="h-6 w-1/2 bg-surface animate-pulse rounded" />
              <div className="flex gap-4 mt-6">
                <div className="h-10 w-24 bg-surface animate-pulse rounded" />
                <div className="h-10 w-24 bg-surface animate-pulse rounded" />
              </div>
            </div>
            <div className="h-[300px] bg-surface animate-pulse rounded-2xl" />
          </div>
        </div>

        {/* Image Gallery Skeleton */}
        <div className="py-8 border-t border-border">
          <div className="grid lg:grid-cols-[0.6fr_0.4fr] gap-4">
            <div className="h-[500px] bg-surface animate-pulse rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[240px] bg-surface animate-pulse rounded-2xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="py-8 border-t border-border">
          <div className="grid lg:grid-cols-[0.65fr_0.35fr] gap-8">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-surface animate-pulse rounded-2xl" />
              ))}
            </div>
            <div className="h-[400px] bg-surface animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}


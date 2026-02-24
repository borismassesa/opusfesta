export default function PlanningToolsLoading() {
  return (
    <div className="orion-theme bg-background flex min-h-screen flex-col">
      {/* Hero skeleton */}
      <div className="flex flex-col items-center gap-6 px-6 pt-28 pb-12">
        <div className="h-8 w-48 animate-pulse rounded-full bg-muted" />
        <div className="h-12 w-[min(90%,600px)] animate-pulse rounded-lg bg-muted" />
        <div className="h-6 w-[min(80%,500px)] animate-pulse rounded-lg bg-muted" />
        <div className="flex gap-4 pt-4">
          <div className="h-12 w-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-12 w-44 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 pt-12 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  )
}

// Shared preview-mode banner used by every content type renderer when
// the page is being viewed in Next.js Draft Mode. Form POST to
// /api/admin/preview/disable so no client JS is required.

export default function PreviewBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b-4 border-brand-border bg-brand-bg text-brand-dark">
      <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-4 px-6 py-3 lg:px-12">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-2.5 w-2.5 bg-brand-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-dark">
            Preview Mode
          </span>
          <span className="hidden text-[11px] font-mono uppercase tracking-[0.16em] text-neutral-500 sm:inline">
            Viewing draft content
          </span>
        </div>
        <form action="/api/admin/preview/disable" method="post">
          <button
            type="submit"
            className="inline-flex items-center border-2 border-brand-dark bg-brand-dark px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-brutal-sm transition-all duration-200 hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent hover:shadow-none"
          >
            Exit preview
          </button>
        </form>
      </div>
    </div>
  );
}

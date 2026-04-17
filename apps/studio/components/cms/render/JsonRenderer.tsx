interface JsonRendererProps {
  type: string;
  content: Record<string, unknown>;
  isDraft: boolean;
}

// Fallback renderer for content types that don't yet have a dedicated
// render component. Shows pretty-printed JSON inside a simple page shell
// so admins can at least verify what was saved.
export default function JsonRenderer({ type, content, isDraft }: JsonRendererProps) {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      {isDraft && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black px-6 py-2 text-[12px] font-bold uppercase tracking-[0.18em] flex items-center justify-between">
          <span>Preview mode · viewing draft content</span>
          <form action="/api/admin/preview/disable" method="post">
            <button
              type="submit"
              className="px-3 py-1 bg-black text-amber-500 hover:bg-neutral-900 transition-colors text-[11px]"
            >
              Exit preview
            </button>
          </form>
        </div>
      )}

      <div className="max-w-[900px] mx-auto px-6 pt-10">
        <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-neutral-500 mb-2">
          {type}
        </p>
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">
          Preview renderer not yet implemented for "{type}"
        </h1>
        <p className="text-sm text-neutral-600 mb-6">
          Add a render component at{' '}
          <code className="bg-neutral-200 px-1 rounded font-mono text-xs">
            components/cms/render/{type}Renderer.tsx
          </code>{' '}
          to replace this JSON view.
        </p>

        <pre className="bg-white border border-neutral-300 p-6 overflow-x-auto text-xs font-mono text-neutral-800 leading-relaxed">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
}

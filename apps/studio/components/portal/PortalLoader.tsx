'use client';

export default function PortalLoader({ message = 'Loading' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        {/* Animated logo squares */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          <div
            className="w-3 h-3 bg-brand-dark animate-pulse"
            style={{ animationDelay: '0ms', animationDuration: '800ms' }}
          />
          <div
            className="w-3 h-3 bg-brand-accent animate-pulse"
            style={{ animationDelay: '200ms', animationDuration: '800ms' }}
          />
          <div
            className="w-3 h-3 bg-brand-dark animate-pulse"
            style={{ animationDelay: '400ms', animationDuration: '800ms' }}
          />
        </div>
        <p className="text-brand-muted font-mono text-xs uppercase tracking-[0.3em]">
          {message}
        </p>
      </div>
    </div>
  );
}

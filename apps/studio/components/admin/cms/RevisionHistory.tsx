'use client';

import { useEffect, useState } from 'react';
import { BsX, BsClockHistory, BsArrowCounterclockwise, BsCheck2, BsEyeSlash, BsPencilSquare } from 'react-icons/bs';

export interface RevisionRow {
  id: string;
  document_id: string;
  content: Record<string, unknown>;
  action: 'save' | 'publish' | 'unpublish' | 'restore';
  comment: string | null;
  created_at: string;
  created_by: string | null;
}

interface RevisionHistoryProps {
  documentType: string;
  documentId: string;
  titleField: string;
  onClose: () => void;
  onRestored: () => void;
}

const ACTION_META: Record<RevisionRow['action'], { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  save:      { label: 'Saved',      icon: BsPencilSquare,        className: 'text-[var(--admin-muted)]' },
  publish:   { label: 'Published',  icon: BsCheck2,              className: 'text-[var(--admin-primary)]' },
  unpublish: { label: 'Unpublished', icon: BsEyeSlash,           className: 'text-amber-600' },
  restore:   { label: 'Restored',   icon: BsArrowCounterclockwise, className: 'text-blue-600' },
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / (60 * 1000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

function truncate(value: string, max = 80): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1).trimEnd() + '…';
}

export default function RevisionHistory({
  documentType,
  documentId,
  titleField,
  onClose,
  onRestored,
}: RevisionHistoryProps) {
  const [revisions, setRevisions] = useState<RevisionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/documents/${documentType}/${documentId}/revisions`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setRevisions((data.revisions ?? []) as RevisionRow[]);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load history');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [documentType, documentId]);

  const handleRestore = async (revId: string) => {
    if (!confirm('Restore this revision as the current draft? Your unsaved changes will be overwritten.')) return;
    setRestoring(revId);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/documents/${documentType}/${documentId}/revisions/${revId}/restore`,
        { method: 'POST' }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Restore failed' }));
        throw new Error(body.error ?? 'Restore failed');
      }
      onRestored();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Restore failed');
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/30"
      onClick={onClose}
    >
      <aside
        className="w-full max-w-md h-full bg-white border-l border-[var(--admin-sidebar-border)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-[var(--admin-sidebar-border)] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BsClockHistory className="w-4 h-4 text-[var(--admin-muted)]" />
            <h2 className="text-[14px] font-bold text-[var(--admin-foreground)]">Revision history</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] hover:bg-[var(--admin-sidebar-accent)] transition-colors"
          >
            <BsX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-[var(--admin-sidebar-accent)] animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 text-[12px] text-red-700">
              {error}
            </div>
          )}

          {!loading && revisions.length === 0 && !error && (
            <p className="text-[12px] text-[var(--admin-muted)] text-center py-8">
              No history yet. Save or publish this document to create the first revision.
            </p>
          )}

          {!loading && revisions.length > 0 && (
            <ol className="relative border-l-2 border-[var(--admin-sidebar-border)] pl-5 space-y-5">
              {revisions.map((rev, idx) => {
                const meta = ACTION_META[rev.action];
                const Icon = meta.icon;
                const titleValue = typeof rev.content?.[titleField] === 'string'
                  ? (rev.content[titleField] as string)
                  : '';
                const isCurrent = idx === 0;
                const isRestoring = restoring === rev.id;

                return (
                  <li key={rev.id} className="relative">
                    {/* Dot */}
                    <span
                      className={`absolute -left-[27px] top-1 w-4 h-4 border-2 border-white bg-white flex items-center justify-center ${meta.className}`}
                    >
                      <Icon className="w-2.5 h-2.5" />
                    </span>

                    <div className="bg-[var(--admin-sidebar-accent)] border border-[var(--admin-sidebar-border)] px-3 py-2">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[11px] font-bold uppercase tracking-[0.12em] ${meta.className}`}>
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-[var(--admin-muted)]">
                          {formatRelative(rev.created_at)}
                        </span>
                      </div>

                      {titleValue && (
                        <p className="text-[12px] text-[var(--admin-foreground)] mb-1">
                          {truncate(titleValue)}
                        </p>
                      )}

                      {rev.comment && (
                        <p className="text-[10px] text-[var(--admin-muted)] italic mb-1">{rev.comment}</p>
                      )}

                      {rev.created_by && (
                        <p className="text-[10px] font-mono text-[var(--admin-muted)]">
                          by {rev.created_by.slice(0, 12)}…
                        </p>
                      )}

                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => handleRestore(rev.id)}
                          disabled={isRestoring}
                          className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--admin-primary)] hover:underline disabled:opacity-50"
                        >
                          <BsArrowCounterclockwise className="w-3 h-3" />
                          {isRestoring ? 'Restoring…' : 'Restore as draft'}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </aside>
    </div>
  );
}

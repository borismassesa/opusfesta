'use client';

import Link from 'next/link';
import { BsPlus, BsFileEarmark } from 'react-icons/bs';
import { resolveIcon } from '@/lib/cms/icons';
import { getContentType } from '@/lib/cms/types';
import type { DocumentRecord } from './DocumentEditor';

interface DocumentListProps {
  // Content type is passed as a string key and resolved client-side so the
  // Zod schema (a class instance, not serializable) never crosses the
  // Server Component → Client Component boundary.
  type: string;
  documents: DocumentRecord[];
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / (60 * 1000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

function truncate(value: string, max = 140): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1).trimEnd() + '…';
}

export default function DocumentList({ type, documents }: DocumentListProps) {
  const contentType = getContentType(type);
  if (!contentType) {
    return (
      <div className="p-6 text-sm text-red-600">
        Unknown content type: <code className="font-mono">{type}</code>
      </div>
    );
  }

  const basePath = `/studio-admin/cms/${contentType.type}`;
  const Icon = resolveIcon(contentType.icon);

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[var(--admin-primary)]/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[var(--admin-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--admin-foreground)] tracking-tight">
              {contentType.pluralLabel}
            </h1>
            <p className="text-sm text-[var(--admin-muted)] mt-1">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </p>
          </div>
        </div>
        <Link
          href={`${basePath}/new`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold bg-[var(--admin-primary)] text-white hover:opacity-90 transition-opacity"
        >
          <BsPlus className="w-4 h-4" />
          New {contentType.label}
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white border border-[var(--admin-sidebar-border)] p-12 text-center">
          <BsFileEarmark className="w-8 h-8 text-[var(--admin-muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-muted)]">No {contentType.pluralLabel.toLowerCase()} yet.</p>
          <Link
            href={`${basePath}/new`}
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--admin-primary)] hover:underline"
          >
            <BsPlus className="w-4 h-4" />
            Create the first one
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[var(--admin-sidebar-border)]">
          <ul className="divide-y divide-[var(--admin-sidebar-border)]">
            {documents.map((doc) => {
              const title = String(doc.draft_content[contentType.titleField] ?? `Untitled ${contentType.label}`);
              const subtitle = contentType.subtitleField
                ? String(doc.draft_content[contentType.subtitleField] ?? '')
                : '';
              const isPublished = doc.published_at != null;
              const hasDraftChanges =
                isPublished &&
                JSON.stringify(doc.draft_content) !== JSON.stringify(doc.published_content);

              return (
                <li key={doc.id}>
                  <Link
                    href={`${basePath}/${doc.id}`}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-[var(--admin-sidebar-accent)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--admin-foreground)] truncate">
                        {title}
                      </p>
                      {subtitle && (
                        <p className="text-[12px] text-[var(--admin-muted)] mt-0.5">
                          {truncate(subtitle)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {hasDraftChanges ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700">
                          Draft changes
                        </span>
                      ) : isPublished ? (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-[var(--admin-primary)]/15 text-[var(--admin-primary)]">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-[var(--admin-muted-surface)] text-[var(--admin-muted)]">
                          Draft
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--admin-muted)]">
                        Updated {formatRelative(doc.updated_at)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

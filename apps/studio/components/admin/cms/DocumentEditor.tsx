'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import { BsArrowLeft, BsCheck2, BsTrash, BsEyeSlash, BsEye, BsClockHistory } from 'react-icons/bs';
import FieldRenderer from './FieldRenderer';
import RevisionHistory from './RevisionHistory';
import { getContentType } from '@/lib/cms/types';
import type { ContentType, FieldDef } from '@/lib/cms/types/define';

export interface DocumentRecord {
  id: string;
  type: string;
  draft_content: Record<string, unknown>;
  published_content: Record<string, unknown> | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface DocumentEditorProps {
  // Content type is passed as a string key and resolved client-side so the
  // Zod schema (a class instance, not serializable) never crosses the
  // Server Component → Client Component boundary.
  type: string;
  mode: 'create' | 'edit';
  document?: DocumentRecord;
}

type FieldErrors = Record<string, string>;

type Status = 'idle' | 'saving' | 'publishing' | 'unpublishing' | 'deleting';

function getFieldDefault(field: FieldDef): unknown {
  switch (field.type) {
    case 'string':
    case 'text':
      return field.default ?? '';
    case 'number':
      return field.default ?? null;
    case 'boolean':
      return field.default ?? false;
    case 'select':
      return field.default ?? '';
    case 'date':
      return field.default ?? '';
    case 'richtext':
      return { type: 'doc', content: [{ type: 'paragraph' }] };
    case 'image':
      return null;
    case 'array':
      return [];
  }
}

function buildInitialValues(contentType: ContentType, seed: Record<string, unknown> | undefined): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of contentType.fields) {
    values[field.name] = seed?.[field.name] ?? getFieldDefault(field);
  }
  return values;
}

export default function DocumentEditor({ type, mode, document }: DocumentEditorProps) {
  const router = useRouter();
  const contentType = getContentType(type);
  const basePath = `/studio-admin/cms/${type}`;

  const initialValues = useMemo(
    () => (contentType ? buildInitialValues(contentType, document?.draft_content) : {}),
    [contentType, document]
  );

  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  if (!contentType) {
    return (
      <div className="p-6 text-sm text-red-600">
        Unknown content type: <code className="font-mono">{type}</code>
      </div>
    );
  }

  const isPublished = document?.published_at != null;
  const isDirty = JSON.stringify(values) !== JSON.stringify(document?.draft_content ?? initialValues);

  const updateField = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const result = contentType.schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const path = issue.path[0];
      if (typeof path === 'string' && !fieldErrors[path]) {
        fieldErrors[path] = issue.message;
      }
    }
    setErrors(fieldErrors);
    return false;
  };

  const performSave = async (publishAfter: boolean): Promise<DocumentRecord | null> => {
    if (!validate()) {
      setMessage({ type: 'error', text: 'Please fix the highlighted fields before saving.' });
      return null;
    }

    setStatus(publishAfter ? 'publishing' : 'saving');
    setMessage(null);

    const payloadContent = contentType.schema.parse(values);

    // Extract every error detail the server returned so we don't lose diagnostic
    // info inside a bare Error message. Phase 5 debugging showed that dropping
    // `code`, `details`, `hint`, and `stack` made 500s invisible.
    const throwDetailed = async (res: Response): Promise<never> => {
      let body: Record<string, unknown> = {};
      try {
        body = await res.json();
      } catch {
        /* non-JSON body */
      }
      const parts = [
        body.error ? String(body.error) : `HTTP ${res.status}`,
        body.code ? `code=${body.code}` : '',
        body.details ? `details=${body.details}` : '',
        body.hint ? `hint=${body.hint}` : '',
      ].filter(Boolean);
      const err = new Error(parts.join(' · '));
      if (body.stack) {
        console.error('[DocumentEditor] server stack:', body.stack);
      }
      console.error('[DocumentEditor] server response body:', body);
      throw err;
    };

    try {
      let record: DocumentRecord;

      if (mode === 'create' || !document) {
        const res = await fetch(`/api/admin/documents/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: payloadContent }),
        });
        if (!res.ok) await throwDetailed(res);
        const data = await res.json();
        record = data.document as DocumentRecord;
      } else {
        const res = await fetch(`/api/admin/documents/${type}/${document.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: payloadContent }),
        });
        if (!res.ok) await throwDetailed(res);
        const data = await res.json();
        record = data.document as DocumentRecord;
      }

      if (publishAfter) {
        const res = await fetch(`/api/admin/documents/${type}/${record.id}/publish`, {
          method: 'POST',
        });
        if (!res.ok) await throwDetailed(res);
        const data = await res.json();
        record = data.document as DocumentRecord;
      }

      setMessage({ type: 'success', text: publishAfter ? 'Published' : 'Draft saved' });

      if (mode === 'create') {
        router.push(`${basePath}/${record.id}`);
        router.refresh();
      } else {
        router.refresh();
      }

      return record;
    } catch (e: unknown) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Save failed' });
      return null;
    } finally {
      setStatus('idle');
    }
  };

  const handleUnpublish = async () => {
    if (!document) return;
    setStatus('unpublishing');
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/documents/${type}/${document.id}/publish`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      setMessage({ type: 'success', text: 'Unpublished — draft is still saved' });
      router.refresh();
    } catch (e: unknown) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Unpublish failed' });
    } finally {
      setStatus('idle');
    }
  };

  const handlePreview = async () => {
    if (!document) return;
    setPreviewing(true);
    setMessage(null);
    try {
      // Save current draft before opening preview so the preview reflects the
      // latest in-progress edits, not a stale snapshot from the database.
      if (isDirty) {
        const saved = await performSave(false);
        if (!saved) {
          setPreviewing(false);
          return;
        }
      }
      const res = await fetch('/api/admin/preview/enable', { method: 'POST' });
      if (!res.ok) throw new Error('Could not enable preview mode');
      window.open(`/preview/${type}/${document.id}`, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Preview failed' });
    } finally {
      setPreviewing(false);
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    if (!confirm(`Delete this ${contentType.label}? This cannot be undone from the UI.`)) return;
    setStatus('deleting');
    try {
      const res = await fetch(`/api/admin/documents/${type}/${document.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      router.push(basePath);
    } catch (e: unknown) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Delete failed' });
      setStatus('idle');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={basePath}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] transition-colors"
        >
          <BsArrowLeft className="w-3 h-3" />
          All {contentType.pluralLabel}
        </Link>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--admin-foreground)] tracking-tight">
              {mode === 'create' ? `New ${contentType.label}` : `Edit ${contentType.label}`}
            </h1>
            {document && (
              <div className="mt-1 flex items-center gap-3 text-[11px] text-[var(--admin-muted)]">
                <StatusPill published={isPublished} dirty={isDirty} />
                {document.published_at && (
                  <span>Published {new Date(document.published_at).toLocaleDateString()}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          performSave(false);
        }}
        className="space-y-5 bg-white border border-[var(--admin-sidebar-border)] p-6"
      >
        {contentType.fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            value={values[field.name]}
            onChange={(v) => updateField(field.name, v)}
            error={errors[field.name]}
            disabled={status !== 'idle'}
          />
        ))}

        {message && (
          <div
            role={message.type === 'error' ? 'alert' : 'status'}
            className={`px-3 py-2 text-[12px] ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-[var(--admin-sidebar-border)]">
          <button
            type="submit"
            disabled={status !== 'idle'}
            className="px-4 py-2 text-[12px] font-semibold bg-white border border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] hover:bg-[var(--admin-sidebar-accent)] disabled:opacity-50 transition-colors"
          >
            {status === 'saving' ? 'Saving…' : 'Save draft'}
          </button>
          <button
            type="button"
            onClick={() => performSave(true)}
            disabled={status !== 'idle'}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold bg-[var(--admin-primary)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <BsCheck2 className="w-3.5 h-3.5" />
            {status === 'publishing' ? 'Publishing…' : isPublished ? 'Publish update' : 'Publish'}
          </button>

          {document && (
            <button
              type="button"
              onClick={handlePreview}
              disabled={status !== 'idle' || previewing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-[var(--admin-foreground)] border border-[var(--admin-sidebar-border)] hover:bg-[var(--admin-sidebar-accent)] transition-colors disabled:opacity-50"
            >
              <BsEye className="w-3.5 h-3.5" />
              {previewing ? 'Opening…' : 'Preview'}
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            {document && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                disabled={status !== 'idle'}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] transition-colors disabled:opacity-50"
                title="Revision history"
              >
                <BsClockHistory className="w-3.5 h-3.5" />
                History
              </button>
            )}
            {document && isPublished && (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={status !== 'idle'}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] transition-colors disabled:opacity-50"
              >
                <BsEyeSlash className="w-3.5 h-3.5" />
                Unpublish
              </button>
            )}
            {document && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={status !== 'idle'}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                <BsTrash className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>
      </form>

      {historyOpen && document && (
        <RevisionHistory
          documentType={type}
          documentId={document.id}
          titleField={contentType.titleField}
          onClose={() => setHistoryOpen(false)}
          onRestored={() => router.refresh()}
        />
      )}
    </div>
  );
}

function StatusPill({ published, dirty }: { published: boolean; dirty: boolean }): ReactNode {
  if (published && dirty) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700">
        Published · unsaved changes
      </span>
    );
  }
  if (published) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-[var(--admin-primary)]/15 text-[var(--admin-primary)]">
        Published
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-[var(--admin-muted-surface)] text-[var(--admin-muted)]">
      Draft
    </span>
  );
}

import { NextResponse } from 'next/server';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { getPublicUrl } from './assets';
import { getContentType } from './types';
import type { ContentType } from './types/define';

export interface DocumentRow {
  id: string;
  type: string;
  draft_content: Record<string, unknown>;
  published_content: Record<string, unknown> | null;
  published_at: string | null;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
}

export interface RevisionRow {
  id: string;
  document_id: string;
  content: Record<string, unknown>;
  action: 'save' | 'publish' | 'unpublish' | 'restore';
  comment: string | null;
  created_at: string;
  created_by: string | null;
}

export class CmsStoreError extends Error {
  status: number;
  code?: string;
  details?: string;
  hint?: string;

  constructor(
    message: string,
    opts: { status?: number; code?: string; details?: string; hint?: string } = {}
  ) {
    super(message);
    this.name = 'CmsStoreError';
    this.status = opts.status ?? 500;
    this.code = opts.code;
    this.details = opts.details;
    this.hint = opts.hint;
  }
}

const DOCUMENT_SELECT =
  'id, type, draft_content, published_content, published_at, publish_at, created_at, updated_at, updated_by, deleted_at';

const EMPTY_RICH_TEXT_DOC = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
} as const;

let hasStudioDocumentsTable: boolean | null = null;
let hasStudioDocumentRevisionsTable: boolean | null = null;

type LegacyRow = Record<string, unknown>;

interface LegacyAdapter {
  table: string;
  select: string;
  toDocument: (row: LegacyRow, type: string) => DocumentRow;
  buildCreate: (content: Record<string, unknown>, assets: Record<string, string | null>) => Record<string, unknown>;
  buildUpdate: (
    content: Record<string, unknown>,
    row: LegacyRow,
    assets: Record<string, string | null>
  ) => Record<string, unknown>;
  buildPublish: (row: LegacyRow) => Record<string, unknown>;
  buildUnpublish: (row: LegacyRow) => Record<string, unknown>;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function cloneContent<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function asTextItems(value: unknown): Array<{ text: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return { text: item };
      if (item && typeof item === 'object') return { text: asString((item as Record<string, unknown>).text) };
      return { text: '' };
    })
    .filter((item) => item.text.length > 0);
}

function asKeyValueItems(value: unknown): Array<{ label: string; value: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const record = asRecord(item);
      return {
        label: asString(record.label),
        value: asString(record.value),
      };
    })
    .filter((item) => item.label.length > 0 || item.value.length > 0);
}

function extractSupabaseMeta(error: unknown): {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
} {
  const record = asRecord(error);
  return {
    message: asString(record.message) || 'Database operation failed',
    code: asNullableString(record.code) ?? undefined,
    details: asNullableString(record.details) ?? undefined,
    hint: asNullableString(record.hint) ?? undefined,
  };
}

function isMissingRelationError(error: unknown, relation: string): boolean {
  const meta = extractSupabaseMeta(error);
  const haystack = [meta.message, meta.details ?? '', meta.hint ?? ''].join(' ');
  return (meta.code === 'PGRST205' || meta.code === '42P01') && haystack.includes(relation);
}

function toStoreError(error: unknown, status = 500): CmsStoreError {
  const meta = extractSupabaseMeta(error);
  return new CmsStoreError(meta.message, {
    status,
    code: meta.code,
    details: meta.details,
    hint: meta.hint,
  });
}

function buildLegacyDocument(
  type: string,
  row: LegacyRow,
  draftContent: Record<string, unknown>,
  isPublished: boolean,
  publishedAt: string | null
): DocumentRow {
  return {
    id: asString(row.id),
    type,
    draft_content: draftContent,
    published_content: isPublished ? cloneContent(draftContent) : null,
    published_at: isPublished ? publishedAt ?? asString(row.updated_at) : null,
    publish_at: null,
    created_at: asString(row.created_at),
    updated_at: asString(row.updated_at),
    updated_by: null,
    deleted_at: null,
  };
}

function teamMemberDraft(row: LegacyRow): Record<string, unknown> {
  const socials = asRecord(row.social_links);
  return {
    name: asString(row.name),
    role: asString(row.role),
    bio: asString(row.bio),
    avatar: null,
    legacy_avatar_url: asString(row.avatar_url),
    social_twitter: asString(socials.twitter),
    social_instagram: asString(socials.instagram),
    social_linkedin: asString(socials.linkedin),
    social_website: asString(socials.website),
    sort_order: asNumber(row.sort_order),
  };
}

function testimonialDraft(row: LegacyRow): Record<string, unknown> {
  return {
    quote: asString(row.quote),
    author: asString(row.author),
    role: asString(row.role),
    avatar: null,
    legacy_avatar_url: asString(row.avatar_url),
    sort_order: asNumber(row.sort_order),
  };
}

function serviceDraft(row: LegacyRow): Record<string, unknown> {
  const includes = Array.isArray(row.includes)
    ? (row.includes as unknown[]).map((item) =>
        typeof item === 'string' ? { text: item } : { text: asString(asRecord(item).text) }
      )
    : [];

  return {
    title: asString(row.title),
    description: asString(row.description),
    price: asString(row.price),
    cover_image: null,
    legacy_cover_image_url: asString(row.cover_image),
    includes: includes.filter((item) => item.text.length > 0),
    sort_order: asNumber(row.sort_order),
  };
}

function projectDraft(row: LegacyRow): Record<string, unknown> {
  return {
    slug: asString(row.slug),
    number: asString(row.number),
    category: asString(row.category),
    title: asString(row.title),
    description: asString(row.description),
    full_description: asString(row.full_description),
    cover_image: null,
    legacy_cover_image_url: asString(row.cover_image),
    video_url: '',
    sort_order: asNumber(row.sort_order),
    stats: asKeyValueItems(row.stats),
    highlights: asTextItems(row.highlights),
    seo_title: asString(row.seo_title),
    seo_description: asString(row.seo_description),
  };
}

function articleDraft(row: LegacyRow): Record<string, unknown> {
  return {
    title: asString(row.title),
    slug: asString(row.slug),
    excerpt: asString(row.excerpt),
    category: asString(row.category),
    author: asString(row.author),
    published_at: asString(row.published_at).slice(0, 10),
    body: cloneContent(EMPTY_RICH_TEXT_DOC),
    cover_image: null,
    legacy_cover_image_url: asString(row.cover_image),
    callouts: [],
    body_html: asString(row.body_html),
  };
}

const LEGACY_ADAPTERS: Record<string, LegacyAdapter> = {
  faq: {
    table: 'studio_faqs',
    select: 'id, question, answer, sort_order, is_published, created_at, updated_at',
    toDocument: (row, type) =>
      buildLegacyDocument(
        type,
        row,
        {
          question: asString(row.question),
          answer: asString(row.answer),
          sort_order: asNumber(row.sort_order),
        },
        Boolean(row.is_published),
        Boolean(row.is_published) ? asString(row.updated_at) : null
      ),
    buildCreate: (content) => ({
      question: asString(content.question),
      answer: asString(content.answer),
      sort_order: asNumber(content.sort_order),
      is_published: false,
    }),
    buildUpdate: (content) => ({
      question: asString(content.question),
      answer: asString(content.answer),
      sort_order: asNumber(content.sort_order),
    }),
    buildPublish: () => ({ is_published: true }),
    buildUnpublish: () => ({ is_published: false }),
  },
  testimonial: {
    table: 'studio_testimonials',
    select: 'id, quote, author, role, avatar_url, sort_order, is_published, created_at, updated_at',
    toDocument: (row, type) =>
      buildLegacyDocument(
        type,
        row,
        testimonialDraft(row),
        Boolean(row.is_published),
        Boolean(row.is_published) ? asString(row.updated_at) : null
      ),
    buildCreate: (content, assets) => ({
      quote: asString(content.quote),
      author: asString(content.author),
      role: asString(content.role),
      avatar_url: assets.avatar ?? null,
      sort_order: asNumber(content.sort_order),
      is_published: false,
    }),
    buildUpdate: (content, row, assets) => ({
      quote: asString(content.quote),
      author: asString(content.author),
      role: asString(content.role),
      avatar_url: assets.avatar ?? asNullableString(row.avatar_url),
      sort_order: asNumber(content.sort_order),
    }),
    buildPublish: () => ({ is_published: true }),
    buildUnpublish: () => ({ is_published: false }),
  },
  teamMember: {
    table: 'studio_team_members',
    select: 'id, name, role, bio, avatar_url, sort_order, is_published, social_links, created_at, updated_at',
    toDocument: (row, type) =>
      buildLegacyDocument(
        type,
        row,
        teamMemberDraft(row),
        Boolean(row.is_published),
        Boolean(row.is_published) ? asString(row.updated_at) : null
      ),
    buildCreate: (content, assets) => ({
      name: asString(content.name),
      role: asString(content.role),
      bio: asString(content.bio),
      avatar_url: assets.avatar ?? null,
      sort_order: asNumber(content.sort_order),
      is_published: false,
      social_links: {
        twitter: asString(content.social_twitter),
        instagram: asString(content.social_instagram),
        linkedin: asString(content.social_linkedin),
        website: asString(content.social_website),
      },
    }),
    buildUpdate: (content, row, assets) => ({
      name: asString(content.name),
      role: asString(content.role),
      bio: asString(content.bio),
      avatar_url: assets.avatar ?? asNullableString(row.avatar_url),
      sort_order: asNumber(content.sort_order),
      social_links: {
        twitter: asString(content.social_twitter),
        instagram: asString(content.social_instagram),
        linkedin: asString(content.social_linkedin),
        website: asString(content.social_website),
      },
    }),
    buildPublish: () => ({ is_published: true }),
    buildUnpublish: () => ({ is_published: false }),
  },
  service: {
    table: 'studio_services',
    select: 'id, title, description, price, cover_image, includes, sort_order, is_active, created_at, updated_at',
    toDocument: (row, type) =>
      buildLegacyDocument(
        type,
        row,
        serviceDraft(row),
        Boolean(row.is_active),
        Boolean(row.is_active) ? asString(row.updated_at) : null
      ),
    buildCreate: (content, assets) => ({
      title: asString(content.title),
      description: asString(content.description),
      price: asString(content.price),
      cover_image: assets.cover_image ?? '',
      includes: asTextItems(content.includes).map((item) => item.text),
      sort_order: asNumber(content.sort_order),
      is_active: false,
    }),
    buildUpdate: (content, row, assets) => ({
      title: asString(content.title),
      description: asString(content.description),
      price: asString(content.price),
      cover_image: assets.cover_image ?? asString(row.cover_image),
      includes: asTextItems(content.includes).map((item) => item.text),
      sort_order: asNumber(content.sort_order),
    }),
    buildPublish: () => ({ is_active: true }),
    buildUnpublish: () => ({ is_active: false }),
  },
  project: {
    table: 'studio_projects',
    select:
      'id, slug, number, category, title, description, full_description, cover_image, stats, highlights, is_published, sort_order, seo_title, seo_description, created_at, updated_at',
    toDocument: (row, type) =>
      buildLegacyDocument(
        type,
        row,
        projectDraft(row),
        Boolean(row.is_published),
        Boolean(row.is_published) ? asString(row.updated_at) : null
      ),
    buildCreate: (content, assets) => ({
      slug: asString(content.slug),
      number: asString(content.number),
      category: asString(content.category),
      title: asString(content.title),
      description: asString(content.description),
      full_description: asString(content.full_description),
      cover_image: assets.cover_image ?? '',
      stats: asKeyValueItems(content.stats),
      highlights: asTextItems(content.highlights).map((item) => item.text),
      is_published: false,
      sort_order: asNumber(content.sort_order),
      seo_title: asString(content.seo_title),
      seo_description: asString(content.seo_description),
    }),
    buildUpdate: (content, row, assets) => ({
      slug: asString(content.slug),
      number: asString(content.number),
      category: asString(content.category),
      title: asString(content.title),
      description: asString(content.description),
      full_description: asString(content.full_description),
      cover_image: assets.cover_image ?? asString(row.cover_image),
      stats: asKeyValueItems(content.stats),
      highlights: asTextItems(content.highlights).map((item) => item.text),
      sort_order: asNumber(content.sort_order),
      seo_title: asString(content.seo_title),
      seo_description: asString(content.seo_description),
    }),
    buildPublish: () => ({ is_published: true }),
    buildUnpublish: () => ({ is_published: false }),
  },
  article: {
    table: 'studio_articles',
    select:
      'id, slug, title, excerpt, body_html, cover_image, author, category, published_at, is_published, seo_title, seo_description, created_at, updated_at',
    toDocument: (row, type) =>
      buildLegacyDocument(
        type,
        row,
        articleDraft(row),
        Boolean(row.is_published),
        Boolean(row.is_published)
          ? (asNullableString(row.published_at) ?? asString(row.updated_at))
          : null
      ),
    buildCreate: (content, assets) => ({
      slug: asString(content.slug),
      title: asString(content.title),
      excerpt: asString(content.excerpt),
      body_html: asString(content.body_html),
      cover_image: assets.cover_image ?? '',
      author: asString(content.author),
      category: asString(content.category),
      published_at: asNullableString(content.published_at),
      is_published: false,
      seo_title: null,
      seo_description: null,
    }),
    buildUpdate: (content, row, assets) => ({
      slug: asString(content.slug),
      title: asString(content.title),
      excerpt: asString(content.excerpt),
      body_html: asString(content.body_html),
      cover_image: assets.cover_image ?? asString(row.cover_image),
      author: asString(content.author),
      category: asString(content.category),
      published_at: asNullableString(content.published_at),
      seo_title: row.seo_title ?? null,
      seo_description: row.seo_description ?? null,
    }),
    buildPublish: (row) => ({
      is_published: true,
      published_at: asNullableString(row.published_at) ?? new Date().toISOString(),
    }),
    buildUnpublish: (row) => ({
      is_published: false,
      published_at: row.published_at ?? null,
    }),
  },
};

function getLegacyAdapter(type: string): LegacyAdapter {
  const adapter = LEGACY_ADAPTERS[type];
  if (!adapter) {
    throw new CmsStoreError(`Legacy fallback is not available for content type: ${type}`, {
      status: 500,
    });
  }
  return adapter;
}

async function resolveLegacyAssetUrl(assetId: string | undefined): Promise<string | null> {
  if (!assetId) return null;
  const sb = getStudioSupabaseAdmin();
  const { data, error } = await sb
    .from('studio_assets')
    .select('path, bucket')
    .eq('id', assetId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[documents] resolveLegacyAssetUrl failed', { assetId, error });
    return null;
  }
  if (!data?.path) return null;
  const bucket = asString(data.bucket);
  return bucket ? getPublicUrl(data.path as string, bucket) : getPublicUrl(data.path as string);
}

async function resolveLegacyAssets(content: Record<string, unknown>): Promise<Record<string, string | null>> {
  const avatar = asRecord(content.avatar);
  const coverImage = asRecord(content.cover_image);

  const [avatarUrl, coverImageUrl] = await Promise.all([
    resolveLegacyAssetUrl(asNullableString(avatar.asset_id) ?? undefined),
    resolveLegacyAssetUrl(asNullableString(coverImage.asset_id) ?? undefined),
  ]);

  return {
    avatar: avatarUrl,
    cover_image: coverImageUrl,
  };
}

async function listLegacyDocuments(
  type: string,
  sortColumn: 'created_at' | 'updated_at',
  ascending: boolean
): Promise<DocumentRow[]> {
  const adapter = getLegacyAdapter(type);
  const sb = getStudioSupabaseAdmin();
  const { data, error } = await sb
    .from(adapter.table)
    .select(adapter.select)
    .order(sortColumn, { ascending })
    .limit(500);

  if (error) throw toStoreError(error);
  return ((data ?? []) as unknown as LegacyRow[]).map((row) => adapter.toDocument(row, type));
}

async function getLegacyDocument(type: string, id: string): Promise<DocumentRow | null> {
  const adapter = getLegacyAdapter(type);
  const sb = getStudioSupabaseAdmin();
  const { data, error } = await sb.from(adapter.table).select(adapter.select).eq('id', id).single();

  if (error) {
    if (extractSupabaseMeta(error).code === 'PGRST116') return null;
    throw toStoreError(error);
  }
  return data ? adapter.toDocument(data as unknown as LegacyRow, type) : null;
}

async function getLegacyRow(type: string, id: string): Promise<LegacyRow | null> {
  const adapter = getLegacyAdapter(type);
  const sb = getStudioSupabaseAdmin();
  const { data, error } = await sb.from(adapter.table).select(adapter.select).eq('id', id).single();

  if (error) {
    if (extractSupabaseMeta(error).code === 'PGRST116') return null;
    throw toStoreError(error);
  }
  return (data as unknown as LegacyRow | null) ?? null;
}

async function createLegacyDocument(type: string, content: Record<string, unknown>): Promise<DocumentRow> {
  const adapter = getLegacyAdapter(type);
  const sb = getStudioSupabaseAdmin();
  const assets = await resolveLegacyAssets(content);
  const { data, error } = await sb
    .from(adapter.table)
    .insert(adapter.buildCreate(content, assets))
    .select(adapter.select)
    .single();

  if (error || !data) throw toStoreError(error);
  return adapter.toDocument(data as unknown as LegacyRow, type);
}

async function updateLegacyDocument(
  type: string,
  id: string,
  content: Record<string, unknown>
): Promise<DocumentRow | null> {
  const adapter = getLegacyAdapter(type);
  const current = await getLegacyRow(type, id);
  if (!current) return null;

  const sb = getStudioSupabaseAdmin();
  const assets = await resolveLegacyAssets(content);
  const { data, error } = await sb
    .from(adapter.table)
    .update(adapter.buildUpdate(content, current, assets))
    .eq('id', id)
    .select(adapter.select)
    .single();

  if (error || !data) throw toStoreError(error);
  return adapter.toDocument(data as unknown as LegacyRow, type);
}

async function patchLegacyDocument(
  type: string,
  id: string,
  patchBuilder: (row: LegacyRow, adapter: LegacyAdapter) => Record<string, unknown>
): Promise<DocumentRow | null> {
  const adapter = getLegacyAdapter(type);
  const current = await getLegacyRow(type, id);
  if (!current) return null;

  const sb = getStudioSupabaseAdmin();
  const { data, error } = await sb
    .from(adapter.table)
    .update(patchBuilder(current, adapter))
    .eq('id', id)
    .select(adapter.select)
    .single();

  if (error || !data) throw toStoreError(error);
  return adapter.toDocument(data as unknown as LegacyRow, type);
}

function revisionsRequireDocumentStore(): never {
  throw new CmsStoreError('Revision history requires the studio_documents migration to be applied.', {
    status: 501,
  });
}

/**
 * Look up a content type by its URL key, or return a 404 response if unknown.
 * The caller should `throw` the response so the route handler catches it.
 */
export function resolveContentTypeOr404(key: string): ContentType {
  const ct = getContentType(key);
  if (!ct) {
    throw NextResponse.json({ error: `Unknown content type: ${key}` }, { status: 404 });
  }
  return ct;
}

/**
 * Validate raw content against a content type's Zod schema.
 * Returns the parsed content on success, or throws a 400 response on failure.
 */
export function validateContentOr400(ct: ContentType, raw: unknown): Record<string, unknown> {
  const result = ct.schema.safeParse(raw);
  if (!result.success) {
    throw NextResponse.json(
      {
        error: 'Validation failed',
        issues: result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }
  return result.data as Record<string, unknown>;
}

export function jsonErrorResponse(error: unknown): NextResponse {
  if (error instanceof NextResponse) return error;
  if (error instanceof CmsStoreError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
      { status: error.status }
    );
  }
  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : 'Internal server error',
      stack: error instanceof Error && process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    },
    { status: 500 }
  );
}

export async function listDocuments(
  type: string,
  sortColumn: 'created_at' | 'updated_at',
  ascending: boolean
): Promise<DocumentRow[]> {
  if (hasStudioDocumentsTable === false) {
    return listLegacyDocuments(type, sortColumn, ascending);
  }

  const sb = getStudioSupabaseAdmin();
  const { data, error } = await sb
    .from('studio_documents')
    .select(DOCUMENT_SELECT)
    .eq('type', type)
    .is('deleted_at', null)
    .order(sortColumn, { ascending })
    .limit(500);

  if (error) {
    if (isMissingRelationError(error, 'studio_documents')) {
      hasStudioDocumentsTable = false;
      return listLegacyDocuments(type, sortColumn, ascending);
    }
    throw toStoreError(error);
  }

  hasStudioDocumentsTable = true;
  return (data ?? []) as DocumentRow[];
}

export async function loadDocument(type: string, id: string): Promise<DocumentRow | null> {
  if (hasStudioDocumentsTable === false) {
    return getLegacyDocument(type, id);
  }

  const sb = getStudioSupabaseAdmin();
  const { data, error } = await sb
    .from('studio_documents')
    .select(DOCUMENT_SELECT)
    .eq('id', id)
    .eq('type', type)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (isMissingRelationError(error, 'studio_documents')) {
      hasStudioDocumentsTable = false;
      return getLegacyDocument(type, id);
    }
    if (extractSupabaseMeta(error).code === 'PGRST116') return null;
    throw toStoreError(error);
  }

  hasStudioDocumentsTable = true;
  return (data as DocumentRow | null) ?? null;
}

export async function createDocument(
  type: string,
  content: Record<string, unknown>,
  userId: string | null
): Promise<DocumentRow> {
  if (hasStudioDocumentsTable === false) {
    return createLegacyDocument(type, content);
  }

  const sb = getStudioSupabaseAdmin();
  const { data, error } = await sb
    .from('studio_documents')
    .insert({
      type,
      draft_content: content,
      updated_by: userId,
    })
    .select(DOCUMENT_SELECT)
    .single();

  if (error || !data) {
    if (isMissingRelationError(error, 'studio_documents')) {
      hasStudioDocumentsTable = false;
      return createLegacyDocument(type, content);
    }
    throw toStoreError(error);
  }

  hasStudioDocumentsTable = true;
  return data as DocumentRow;
}

export async function updateDocument(
  type: string,
  id: string,
  content: Record<string, unknown>,
  userId: string | null
): Promise<DocumentRow | null> {
  if (hasStudioDocumentsTable === false) {
    return updateLegacyDocument(type, id, content);
  }

  const sb = getStudioSupabaseAdmin();
  const { data, error } = await sb
    .from('studio_documents')
    .update({
      draft_content: content,
      updated_by: userId,
    })
    .eq('id', id)
    .eq('type', type)
    .is('deleted_at', null)
    .select(DOCUMENT_SELECT)
    .single();

  if (error || !data) {
    if (isMissingRelationError(error, 'studio_documents')) {
      hasStudioDocumentsTable = false;
      return updateLegacyDocument(type, id, content);
    }
    if (extractSupabaseMeta(error).code === 'PGRST116') return null;
    throw toStoreError(error);
  }

  hasStudioDocumentsTable = true;
  return data as DocumentRow;
}

export async function publishDocument(
  type: string,
  id: string,
  userId: string | null
): Promise<DocumentRow | null> {
  if (hasStudioDocumentsTable === false) {
    return patchLegacyDocument(type, id, (row, adapter) => adapter.buildPublish(row));
  }

  const sb = getStudioSupabaseAdmin();
  const { data: current, error: fetchErr } = await sb
    .from('studio_documents')
    .select('id, draft_content')
    .eq('id', id)
    .eq('type', type)
    .is('deleted_at', null)
    .single();

  if (fetchErr || !current) {
    if (fetchErr && isMissingRelationError(fetchErr, 'studio_documents')) {
      console.error('[documents] studio_documents table not found — falling back to legacy adapters', { type, error: fetchErr });
      hasStudioDocumentsTable = false;
      return patchLegacyDocument(type, id, (row, adapter) => adapter.buildPublish(row));
    }
    if (!current || (fetchErr && extractSupabaseMeta(fetchErr).code === 'PGRST116')) return null;
    if (fetchErr) throw toStoreError(fetchErr);
    return null;
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await sb
    .from('studio_documents')
    .update({
      published_content: current.draft_content,
      published_at: nowIso,
      updated_by: userId,
    })
    .eq('id', id)
    .select(DOCUMENT_SELECT)
    .single();

  if (error || !data) {
    if (error && extractSupabaseMeta(error).code === 'PGRST116') return null;
    throw toStoreError(error);
  }
  hasStudioDocumentsTable = true;
  return data as DocumentRow;
}

export async function unpublishDocument(
  type: string,
  id: string,
  userId: string | null
): Promise<DocumentRow | null> {
  if (hasStudioDocumentsTable === false) {
    return patchLegacyDocument(type, id, (row, adapter) => adapter.buildUnpublish(row));
  }

  const sb = getStudioSupabaseAdmin();
  const { data: current, error: fetchErr } = await sb
    .from('studio_documents')
    .select('id, published_content')
    .eq('id', id)
    .eq('type', type)
    .is('deleted_at', null)
    .single();

  if (fetchErr || !current) {
    if (fetchErr && isMissingRelationError(fetchErr, 'studio_documents')) {
      console.error('[documents] studio_documents table not found — falling back to legacy adapters', { type, error: fetchErr });
      hasStudioDocumentsTable = false;
      return patchLegacyDocument(type, id, (row, adapter) => adapter.buildUnpublish(row));
    }
    if (!current || (fetchErr && extractSupabaseMeta(fetchErr).code === 'PGRST116')) return null;
    if (fetchErr) throw toStoreError(fetchErr);
    return null;
  }

  const { data, error } = await sb
    .from('studio_documents')
    .update({
      published_content: null,
      published_at: null,
      updated_by: userId,
    })
    .eq('id', id)
    .select(DOCUMENT_SELECT)
    .single();

  if (error || !data) {
    if (error && extractSupabaseMeta(error).code === 'PGRST116') return null;
    throw toStoreError(error);
  }
  hasStudioDocumentsTable = true;
  return data as DocumentRow;
}

export async function deleteDocument(
  type: string,
  id: string,
  userId: string | null
): Promise<boolean> {
  if (hasStudioDocumentsTable === false) {
    throw new CmsStoreError(
      'Delete requires the studio_documents migration to be applied. Legacy content tables do not support soft delete.',
      { status: 501 }
    );
  }

  const sb = getStudioSupabaseAdmin();
  const { error, data } = await sb
    .from('studio_documents')
    .update({ deleted_at: new Date().toISOString(), updated_by: userId })
    .eq('id', id)
    .eq('type', type)
    .is('deleted_at', null)
    .select('id');

  if (error) {
    if (isMissingRelationError(error, 'studio_documents')) {
      hasStudioDocumentsTable = false;
      throw new CmsStoreError(
        'Delete requires the studio_documents migration to be applied. Legacy content tables do not support soft delete.',
        { status: 501 }
      );
    }
    throw toStoreError(error);
  }

  hasStudioDocumentsTable = true;
  return Array.isArray(data) && data.length > 0;
}

export async function listDocumentRevisions(type: string, id: string): Promise<RevisionRow[] | null> {
  if (hasStudioDocumentsTable === false) {
    const legacyDoc = await getLegacyDocument(type, id);
    return legacyDoc ? [] : null;
  }

  const sb = getStudioSupabaseAdmin();
  const { data: doc, error: docErr } = await sb
    .from('studio_documents')
    .select('id')
    .eq('id', id)
    .eq('type', type)
    .is('deleted_at', null)
    .single();

  if (docErr || !doc) {
    if (isMissingRelationError(docErr, 'studio_documents')) {
      hasStudioDocumentsTable = false;
      const legacyDoc = await getLegacyDocument(type, id);
      return legacyDoc ? [] : null;
    }
    if (extractSupabaseMeta(docErr).code === 'PGRST116') return null;
    throw toStoreError(docErr);
  }

  if (hasStudioDocumentRevisionsTable === false) return [];

  const { data, error } = await sb
    .from('studio_document_revisions')
    .select('id, document_id, content, action, comment, created_at, created_by')
    .eq('document_id', id)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    if (isMissingRelationError(error, 'studio_document_revisions')) {
      hasStudioDocumentRevisionsTable = false;
      return [];
    }
    throw toStoreError(error);
  }

  hasStudioDocumentsTable = true;
  hasStudioDocumentRevisionsTable = true;
  return (data ?? []) as RevisionRow[];
}

export async function restoreDocumentRevision(
  type: string,
  id: string,
  revId: string,
  userId: string | null,
  ct: ContentType
): Promise<DocumentRow | null> {
  if (hasStudioDocumentsTable === false || hasStudioDocumentRevisionsTable === false) {
    revisionsRequireDocumentStore();
  }

  const sb = getStudioSupabaseAdmin();
  const { data: rev, error: revErr } = await sb
    .from('studio_document_revisions')
    .select('id, document_id, content')
    .eq('id', revId)
    .eq('document_id', id)
    .single();

  if (revErr || !rev) {
    if (isMissingRelationError(revErr, 'studio_document_revisions')) {
      hasStudioDocumentRevisionsTable = false;
      revisionsRequireDocumentStore();
    }
    if (extractSupabaseMeta(revErr).code === 'PGRST116') return null;
    throw toStoreError(revErr);
  }

  const { data: doc, error: docErr } = await sb
    .from('studio_documents')
    .select('id')
    .eq('id', id)
    .eq('type', type)
    .is('deleted_at', null)
    .single();

  if (docErr || !doc) {
    if (isMissingRelationError(docErr, 'studio_documents')) {
      hasStudioDocumentsTable = false;
      revisionsRequireDocumentStore();
    }
    if (extractSupabaseMeta(docErr).code === 'PGRST116') return null;
    throw toStoreError(docErr);
  }

  const content = validateContentOr400(ct, rev.content);

  const { data: updated, error } = await sb
    .from('studio_documents')
    .update({ draft_content: content, updated_by: userId })
    .eq('id', id)
    .select(DOCUMENT_SELECT)
    .single();

  if (error || !updated) throw toStoreError(error);

  hasStudioDocumentsTable = true;
  hasStudioDocumentRevisionsTable = true;
  return updated as DocumentRow;
}

/**
 * Write an entry to studio_document_revisions. Silent on failure — revisions
 * are a nice-to-have, not a blocker for the primary mutation.
 */
export async function recordRevision(params: {
  documentId: string;
  content: Record<string, unknown>;
  action: 'save' | 'publish' | 'unpublish' | 'restore';
  createdBy: string | null;
  comment?: string;
}): Promise<void> {
  if (hasStudioDocumentRevisionsTable === false) return;

  const sb = getStudioSupabaseAdmin();
  const { error } = await sb.from('studio_document_revisions').insert({
    document_id: params.documentId,
    content: params.content,
    action: params.action,
    created_by: params.createdBy,
    comment: params.comment ?? null,
  });
  if (error) {
    if (isMissingRelationError(error, 'studio_document_revisions')) {
      hasStudioDocumentRevisionsTable = false;
      return;
    }
    hasStudioDocumentRevisionsTable = true;
    console.error('[documents] revision insert failed', error);
    return;
  }
  hasStudioDocumentRevisionsTable = true;
}

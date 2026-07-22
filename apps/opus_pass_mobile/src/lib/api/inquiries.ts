import type { InquiryStatus, ProposalStatus } from '@/types/vendor';

/**
 * The inquiry/proposal surface is the one part of the vendors feature that does
 * NOT talk to Supabase directly. Couples have no UPDATE policy on `inquiries`
 * (052_update_rls_for_clerk.sql grants UPDATE to the owning vendor only), and
 * `inquiry_messages` is `USING (false)` for every client role. opus_website
 * already implements the whole flow server-side — including the atomic
 * proposal guard and the acceptance confirmation email — so we call it rather
 * than fork that state machine into a second implementation.
 *
 * Auth is the default Clerk session token (not the `supabase` JWT template);
 * both apps must be on the same Clerk instance.
 */

export interface InquiryListItem {
  id: string;
  vendor_name: string | null;
  vendor_slug: string | null;
  status: InquiryStatus;
  created_at: string;
  event_date: string | null;
  location: string | null;
  guest_count: number | null;
}

export interface InquiryDetail extends InquiryListItem {
  name: string;
  email: string;
  budget: string | null;
  message: string;
  vendor_response: string | null;
  responded_at: string | null;
  proposal_status: ProposalStatus | null;
  proposal_event_date: string | null;
  proposal_venue: string | null;
  proposal_guest_count: number | null;
  proposal_package: string | null;
  proposal_invoice_amount: number | null;
  proposal_invoice_details: string | null;
  proposal_sent_at: string | null;
  proposal_counter_amount: number | null;
  proposal_counter_message: string | null;
  proposal_countered_at: string | null;
  proposal_accepted_at: string | null;
}

export interface InquiryMessage {
  id: string;
  sender_type: 'client' | 'vendor';
  sender_name: string | null;
  content: string;
  created_at: string;
  read_at: string | null;
}

export class ProposalConflictError extends Error {
  constructor() {
    super('This proposal was already responded to. Pull to refresh for the latest.');
    this.name = 'ProposalConflictError';
  }
}

/** Defaults to production, matching how src/lib/share.ts resolves its origin. */
function baseUrl(): string {
  return (process.env.EXPO_PUBLIC_OPUS_WEBSITE_URL || 'https://www.opusfesta.com').replace(
    /\/$/,
    '',
  );
}

/**
 * opus_website protects /api/my/* with `auth.protect({ unauthenticatedUrl })`,
 * which redirects rather than returning 401 — a rejected token comes back as
 * an HTML sign-in page, not JSON. Parse defensively so that surfaces as a
 * clear auth error instead of a JSON parse crash.
 */
async function request<T>(
  path: string,
  token: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const response = await fetch(`${baseUrl()}/api/my${path}`, {
    method: init?.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    redirect: 'manual',
  });

  if (response.status === 409) throw new ProposalConflictError();

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      response.status === 0 || response.status >= 300
        ? 'Could not sign in to your OpusFesta account. Please try again.'
        : 'Unexpected response from the server.',
    );
  }

  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || 'Request failed.');
  return payload;
}

export async function getMyInquiries(token: string): Promise<InquiryListItem[]> {
  const data = await request<{ inquiries: InquiryListItem[] }>('/inquiries', token);
  return data.inquiries ?? [];
}

export async function getInquiry(
  token: string,
  id: string,
): Promise<{ inquiry: InquiryDetail; messages: InquiryMessage[] }> {
  return request<{ inquiry: InquiryDetail; messages: InquiryMessage[] }>(
    `/inquiries/${id}`,
    token,
  );
}

export async function sendInquiryMessage(token: string, id: string, content: string) {
  return request<{ success: boolean }>(`/inquiries/${id}/messages`, token, {
    method: 'POST',
    body: { content },
  });
}

export async function acceptProposal(token: string, id: string) {
  return request<{ success: boolean }>(`/inquiries/${id}/proposal`, token, {
    method: 'PATCH',
    body: { action: 'accept' },
  });
}

export async function counterProposal(
  token: string,
  id: string,
  input: { counterAmount?: number; counterMessage?: string },
) {
  return request<{ success: boolean }>(`/inquiries/${id}/proposal`, token, {
    method: 'PATCH',
    body: { action: 'counter', ...input },
  });
}

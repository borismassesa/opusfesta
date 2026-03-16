// ============================================================================
// Client Portal Authentication
// Magic link + OTP based auth, session management via httpOnly cookie
// Completely separate from Clerk admin auth
// ============================================================================

import { randomBytes, randomInt } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getStudioSupabaseAdmin } from './supabase-admin';
import { sendEmail } from './resend';

const SESSION_COOKIE = 'of_client_session';
const SESSION_MAX_AGE_DAYS = 30;
const MAGIC_LINK_EXPIRY_MIN = 10;
const MAX_SEND_PER_10_MIN = 3;
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_SESSIONS_PER_CLIENT = 5;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClientProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  portal_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface ClientSession {
  client: ClientProfile;
  sessionId: string;
}

// ---------------------------------------------------------------------------
// Magic Link / OTP
// ---------------------------------------------------------------------------

export async function sendMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
  const db = getStudioSupabaseAdmin();
  const normalizedEmail = email.toLowerCase().trim();

  // Rate limit: max sends per 10 minutes
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await db
    .from('studio_client_magic_links')
    .select('id', { count: 'exact', head: true })
    .eq('email', normalizedEmail)
    .gte('created_at', tenMinAgo);

  if ((count || 0) >= MAX_SEND_PER_10_MIN) {
    return { success: false, error: 'Too many attempts. Please wait a few minutes.' };
  }

  // Generate OTP (6 digits) and magic link token
  const code = String(randomInt(100000, 999999));
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MIN * 60 * 1000).toISOString();

  const { error: insertError } = await db.from('studio_client_magic_links').insert({
    email: normalizedEmail,
    code,
    token,
    expires_at: expiresAt,
  });

  if (insertError) {
    console.error('[CLIENT_AUTH] Failed to create magic link:', insertError.message);
    return { success: false, error: 'Failed to send verification code' };
  }

  // Send email
  const magicLinkUrl = `${APP_URL}/portal/login?token=${token}`;
  const emailResult = await sendEmail({
    to: normalizedEmail,
    subject: 'Your OpusStudio Login Code',
    html: magicLinkEmail(code, magicLinkUrl),
  });

  if (!emailResult.success) {
    console.error('[CLIENT_AUTH] Failed to send email:', emailResult.error);
    return { success: false, error: 'Failed to send email. Please try again.' };
  }

  return { success: true };
}

export async function verifyCode(
  email: string,
  code: string
): Promise<{ success: boolean; client?: ClientProfile; sessionToken?: string; error?: string }> {
  const db = getStudioSupabaseAdmin();
  const normalizedEmail = email.toLowerCase().trim();

  // Find valid magic link for this email + code
  const { data: link, error } = await db
    .from('studio_client_magic_links')
    .select('*')
    .eq('email', normalizedEmail)
    .eq('code', code)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .lt('attempts', MAX_VERIFY_ATTEMPTS)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !link) {
    // Increment attempts on all recent unused links for this email
    await db
      .from('studio_client_magic_links')
      .update({ attempts: (link?.attempts || 0) + 1 })
      .eq('email', normalizedEmail)
      .is('used_at', null);

    return { success: false, error: 'Invalid or expired code' };
  }

  // Mark as used
  await db
    .from('studio_client_magic_links')
    .update({ used_at: new Date().toISOString() })
    .eq('id', link.id);

  // Get or create client profile
  const client = await getOrCreateClient(normalizedEmail);
  if (!client) {
    return { success: false, error: 'Failed to create account' };
  }

  // Create session
  const sessionToken = await createSession(client.id);

  return { success: true, client, sessionToken };
}

export async function verifyMagicLinkToken(
  token: string
): Promise<{ success: boolean; client?: ClientProfile; sessionToken?: string; error?: string }> {
  const db = getStudioSupabaseAdmin();

  const { data: link, error } = await db
    .from('studio_client_magic_links')
    .select('*')
    .eq('token', token)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !link) {
    return { success: false, error: 'Invalid or expired link' };
  }

  // Mark as used
  await db
    .from('studio_client_magic_links')
    .update({ used_at: new Date().toISOString() })
    .eq('id', link.id);

  const client = await getOrCreateClient(link.email);
  if (!client) {
    return { success: false, error: 'Failed to create account' };
  }

  const sessionToken = await createSession(client.id);

  return { success: true, client, sessionToken };
}

// ---------------------------------------------------------------------------
// Session Management
// ---------------------------------------------------------------------------

async function createSession(clientId: string): Promise<string> {
  const db = getStudioSupabaseAdmin();
  const sessionToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await db.from('studio_client_sessions').insert({
    client_id: clientId,
    session_token: sessionToken,
    expires_at: expiresAt,
  });

  // Update last_login_at
  await db
    .from('studio_client_profiles')
    .update({ last_login_at: new Date().toISOString(), portal_enabled: true })
    .eq('id', clientId);

  // Prune old sessions (keep max N per client)
  const { data: sessions } = await db
    .from('studio_client_sessions')
    .select('id')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (sessions && sessions.length > MAX_SESSIONS_PER_CLIENT) {
    const toDelete = sessions.slice(MAX_SESSIONS_PER_CLIENT).map((s: { id: string }) => s.id);
    await db.from('studio_client_sessions').delete().in('id', toDelete);
  }

  return sessionToken;
}

export async function validateSession(sessionToken: string): Promise<ClientSession | null> {
  const db = getStudioSupabaseAdmin();

  const { data: session, error } = await db
    .from('studio_client_sessions')
    .select('id, client_id, expires_at')
    .eq('session_token', sessionToken)
    .single();

  if (error || !session) return null;

  // Check expiry
  if (new Date(session.expires_at) < new Date()) {
    await db.from('studio_client_sessions').delete().eq('id', session.id);
    return null;
  }

  // Fetch client profile
  const { data: client } = await db
    .from('studio_client_profiles')
    .select('id, email, name, phone, whatsapp, company, portal_enabled, last_login_at, created_at')
    .eq('id', session.client_id)
    .single();

  if (!client) return null;

  // Sliding window: extend expiry and update last_active_at
  const newExpiry = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await db
    .from('studio_client_sessions')
    .update({ expires_at: newExpiry, last_active_at: new Date().toISOString() })
    .eq('id', session.id);

  return { client: client as ClientProfile, sessionId: session.id };
}

export async function destroySession(sessionToken: string): Promise<void> {
  const db = getStudioSupabaseAdmin();
  await db.from('studio_client_sessions').delete().eq('session_token', sessionToken);
}

// ---------------------------------------------------------------------------
// Cookie Helpers
// ---------------------------------------------------------------------------

export async function setSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getClientFromRequest(req: NextRequest): Promise<ClientSession | null> {
  const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionToken) return null;
  return validateSession(sessionToken);
}

export async function getClientFromCookies(): Promise<ClientSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionToken) return null;
  return validateSession(sessionToken);
}

// ---------------------------------------------------------------------------
// Client Profile Helpers
// ---------------------------------------------------------------------------

async function getOrCreateClient(email: string): Promise<ClientProfile | null> {
  const db = getStudioSupabaseAdmin();

  // Check if client exists
  const { data: existing } = await db
    .from('studio_client_profiles')
    .select('id, email, name, phone, whatsapp, company, portal_enabled, last_login_at, created_at')
    .eq('email', email)
    .single();

  if (existing) return existing as ClientProfile;

  // Check if there's a booking with this email (to prefill name)
  const { data: booking } = await db
    .from('studio_bookings')
    .select('name, phone')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Create new client profile
  const { data: newClient, error } = await db
    .from('studio_client_profiles')
    .insert({
      email,
      name: booking?.name || email.split('@')[0],
      phone: booking?.phone || null,
      portal_enabled: true,
    })
    .select('id, email, name, phone, whatsapp, company, portal_enabled, last_login_at, created_at')
    .single();

  if (error || !newClient) {
    console.error('[CLIENT_AUTH] Failed to create client:', error?.message);
    return null;
  }

  return newClient as ClientProfile;
}

// ---------------------------------------------------------------------------
// Email Template
// ---------------------------------------------------------------------------

function magicLinkEmail(code: string, magicLinkUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:monospace,monospace">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:24px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:3px solid #1a1a1a;max-width:600px">
<tr><td style="background:#1a1a1a;color:#f5f5f0;padding:24px 32px;font-size:14px;font-weight:700;letter-spacing:1px">
OpusStudio
</td></tr>
<tr><td style="padding:32px;font-size:14px;line-height:1.6;color:#1a1a1a">
<h2 style="margin:0 0 16px;font-size:18px;font-weight:700">Your Login Code</h2>
<p>Enter this code to sign in to your OpusStudio portal:</p>
<div style="background:#1a1a1a;color:#D6492A;font-size:32px;font-weight:700;letter-spacing:8px;text-align:center;padding:20px;margin:24px 0;border:3px solid #1a1a1a;font-family:monospace,monospace">
${code}
</div>
<p style="color:#888;font-size:12px">This code expires in ${MAGIC_LINK_EXPIRY_MIN} minutes.</p>
<p>Or click the button below to sign in instantly:</p>
<a href="${magicLinkUrl}" style="display:inline-block;background:#D6492A;color:#fff;padding:14px 28px;font-size:14px;font-weight:700;text-decoration:none;font-family:monospace,monospace;border:3px solid #1a1a1a;margin:8px 0">SIGN IN TO PORTAL →</a>
<p style="color:#888;font-size:12px;margin-top:24px">If you didn't request this code, you can safely ignore this email.</p>
</td></tr>
<tr><td style="padding:16px 32px;font-size:11px;color:#888;border-top:1px solid #e0e0e0;text-align:center">
OpusStudio — Dar es Salaam, Tanzania
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

import { NextRequest, NextResponse } from 'next/server';
import { getPortalClient } from '@/lib/portal-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  const client = await getPortalClient();
  if (!client) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ client });
}

export async function PATCH(req: NextRequest) {
  const client = await getPortalClient();
  if (!client) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, phone, whatsapp, company, location } = body;

  const updates: Record<string, string | null> = {};
  if (name && typeof name === 'string') updates.name = name.trim();
  if (phone !== undefined) updates.phone = phone?.trim() || null;
  if (whatsapp !== undefined) updates.whatsapp = whatsapp?.trim() || null;
  if (company !== undefined) updates.company = company?.trim() || null;
  if (location !== undefined) updates.location = location?.trim() || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const db = getStudioSupabaseAdmin();
  const { data, error } = await db
    .from('studio_client_profiles')
    .update(updates)
    .eq('id', client.id)
    .select('id, email, name, phone, whatsapp, company, location, avatar_url, portal_enabled, last_login_at, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }

  return NextResponse.json({ client: data });
}

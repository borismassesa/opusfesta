// Server-side helper to auto-create or link a studio client whenever a
// booking is written. Call this from both POST routes (admin + public) and
// from PATCH when the client email changes. Returns the client_id to set
// on the booking row.

import type { SupabaseClient } from '@supabase/supabase-js';

interface UpsertInput {
  email: string;
  name: string;
  phone?: string | null;
  actorUserId?: string | null; // Clerk userId of the admin, null for public
}

/**
 * Find a non-deleted client by email (case-insensitive). If one exists,
 * refresh its name/phone with the latest values when they're blank on
 * the client record. If none exists, create one.
 *
 * Soft-fails: if anything goes wrong, returns null so the caller can still
 * save the booking without a client link rather than hard-erroring the
 * whole write.
 */
export async function upsertClientFromBooking(
  db: SupabaseClient,
  input: UpsertInput,
): Promise<string | null> {
  const emailLower = input.email.trim().toLowerCase();
  if (!emailLower) return null;

  try {
    // Look for an existing client.
    const { data: existing, error: findErr } = await db
      .from('studio_clients')
      .select('id, name, phone')
      .ilike('email', emailLower)
      .is('deleted_at', null)
      .maybeSingle();

    if (findErr) {
      console.error('[client-sync] find failed', findErr);
      return null;
    }

    if (existing) {
      // Backfill missing fields on the client if the booking has fresher info.
      const patch: Record<string, unknown> = {};
      if (!existing.name && input.name) patch.name = input.name;
      if (!existing.phone && input.phone) patch.phone = input.phone;
      if (Object.keys(patch).length > 0) {
        patch.updated_by = input.actorUserId ?? null;
        await db.from('studio_clients').update(patch).eq('id', existing.id);
      }
      return existing.id as string;
    }

    // Create a fresh client.
    const { data: inserted, error: insertErr } = await db
      .from('studio_clients')
      .insert({
        name: input.name,
        email: emailLower,
        phone: input.phone ?? null,
        created_by: input.actorUserId ?? null,
        updated_by: input.actorUserId ?? null,
      })
      .select('id')
      .single();

    if (insertErr) {
      // Unique-violation race: another request just created the same client.
      // Re-read and return its id.
      if ((insertErr as { code?: string }).code === '23505') {
        const { data: racer } = await db
          .from('studio_clients')
          .select('id')
          .ilike('email', emailLower)
          .is('deleted_at', null)
          .maybeSingle();
        return (racer?.id as string | undefined) ?? null;
      }
      console.error('[client-sync] insert failed', insertErr);
      return null;
    }

    return inserted.id as string;
  } catch (e) {
    console.error('[client-sync] unexpected', e);
    return null;
  }
}

import type { SupabaseClient } from '@supabase/supabase-js';
import type { SavedVendorRow } from '@/types/vendor';

/**
 * `saved_vendors` is RLS-scoped to `requesting_user_id()`, so reads and deletes
 * need no explicit user filter. Writes still have to supply `user_id` in the
 * payload — and it must be the internal `public.users.id` UUID that
 * `requesting_user_id()` resolves to, not the Clerk id. See useInternalUserId.
 */

export async function getSavedVendors(client: SupabaseClient): Promise<SavedVendorRow[]> {
  const { data, error } = await client
    .from('saved_vendors')
    .select(
      '*, vendors:vendor_id (id, business_name, logo, category, cover_image, location, price_range, stats)',
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as SavedVendorRow[];
}

export async function getSavedVendorIds(client: SupabaseClient): Promise<string[]> {
  const { data, error } = await client.from('saved_vendors').select('vendor_id');

  if (error) throw error;
  return (data ?? []).map((row) => row.vendor_id as string);
}

export async function saveVendor(client: SupabaseClient, vendorId: string, userId: string) {
  const { data, error } = await client
    .from('saved_vendors')
    .upsert({ user_id: userId, vendor_id: vendorId }, { onConflict: 'user_id,vendor_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unsaveVendor(client: SupabaseClient, vendorId: string) {
  const { error } = await client.from('saved_vendors').delete().eq('vendor_id', vendorId);

  if (error) throw error;
}

export async function markVendorBooked(client: SupabaseClient, vendorId: string, userId: string) {
  const { data, error } = await client
    .from('saved_vendors')
    .upsert(
      { user_id: userId, vendor_id: vendorId, status: 'booked' },
      { onConflict: 'user_id,vendor_id' },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

import type { SupabaseClient } from '@supabase/supabase-js';

export async function getInspirationItems(client: SupabaseClient) {
  const { data, error } = await client
    .from('inspiration_items')
    .select('*, vendors:vendor_id (id, business_name, category)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addInspirationItem(
  client: SupabaseClient,
  userId: string,
  item: { imageUrl: string; vendorId?: string; category?: string; note?: string },
) {
  const { data, error } = await client
    .from('inspiration_items')
    .insert({
      user_id: userId,
      vendor_id: item.vendorId ?? null,
      image_url: item.imageUrl,
      category: item.category ?? null,
      note: item.note ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeInspirationItem(client: SupabaseClient, id: string) {
  const { error } = await client.from('inspiration_items').delete().eq('id', id);

  if (error) throw error;
}

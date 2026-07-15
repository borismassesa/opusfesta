import type { SupabaseClient } from '@supabase/supabase-js';
import type { VendorAvailabilityDay } from '@/types/vendor';

export async function getVendorAvailabilityRange(
  client: SupabaseClient,
  vendorId: string,
  start: string,
  end: string
): Promise<VendorAvailabilityDay[]> {
  const { data, error } = await client.rpc('get_vendor_availability', {
    vendor_uuid: vendorId,
    start_date: start,
    end_date: end,
  });

  if (error) throw error;
  return (data ?? []) as VendorAvailabilityDay[];
}

export async function setVendorAvailability(
  client: SupabaseClient,
  vendorId: string,
  date: string,
  isAvailable: boolean,
  reason?: string
): Promise<void> {
  const { error } = await client
    .from('vendor_availability')
    .upsert(
      { vendor_id: vendorId, date, is_available: isAvailable, reason: reason ?? null },
      { onConflict: 'vendor_id,date' }
    );

  if (error) throw error;
}

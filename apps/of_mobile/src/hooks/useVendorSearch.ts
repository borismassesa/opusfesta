import { useQuery } from '@tanstack/react-query';
import { searchVendors } from '@/lib/api/vendors';

export function useVendorSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ['vendor-search', trimmed],
    queryFn: () => searchVendors(trimmed),
    enabled: trimmed.length > 1,
  });
}

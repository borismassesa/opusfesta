import { useQuery } from '@tanstack/react-query';
import {
  getFeaturedVendors,
  getVendorById,
  getVendorsByCategory,
  searchVendors,
  getVendorReviews,
  getVendorPackages,
  getCategoryCounts,
} from '@/lib/api/vendors';

export function useFeaturedVendors() {
  return useQuery({
    queryKey: ['vendors', 'featured'],
    queryFn: getFeaturedVendors,
  });
}

export function useVendor(id: string | undefined) {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: () => getVendorById(id!),
    enabled: !!id,
  });
}

export function useVendorsByCategory(category: string | undefined) {
  return useQuery({
    queryKey: ['vendors', 'category', category],
    queryFn: () => getVendorsByCategory(category!),
    enabled: !!category,
  });
}

export function useSearchVendors(query: string) {
  return useQuery({
    queryKey: ['vendors', 'search', query],
    queryFn: () => searchVendors(query),
    enabled: query.length >= 2,
  });
}

export function useVendorReviews(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-reviews', vendorId],
    queryFn: () => getVendorReviews(vendorId!),
    enabled: !!vendorId,
  });
}

export function useVendorPackages(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-packages', vendorId],
    queryFn: () => getVendorPackages(vendorId!),
    enabled: !!vendorId,
  });
}

export function useCategoryCounts() {
  return useQuery({
    queryKey: ['vendor-category-counts'],
    queryFn: getCategoryCounts,
  });
}

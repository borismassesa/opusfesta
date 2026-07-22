import { useQuery } from '@tanstack/react-query';
import {
  getCategoryCounts,
  getFeaturedVendors,
  getVendorById,
  getVendorPackages,
  getVendorReviews,
  getVendorsByCategory,
  searchVendors,
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
    enabled: Boolean(id),
  });
}

export function useVendorsByCategory(category: string | undefined) {
  return useQuery({
    queryKey: ['vendors', 'category', category],
    queryFn: () => getVendorsByCategory(category!),
    enabled: Boolean(category),
  });
}

export function useSearchVendors(query: string) {
  return useQuery({
    queryKey: ['vendors', 'search', query],
    queryFn: () => searchVendors(query),
    enabled: query.trim().length >= 2,
  });
}

export function useVendorReviews(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-reviews', vendorId],
    queryFn: () => getVendorReviews(vendorId!),
    enabled: Boolean(vendorId),
  });
}

export function useVendorPackages(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor-packages', vendorId],
    queryFn: () => getVendorPackages(vendorId!),
    enabled: Boolean(vendorId),
  });
}

export function useCategoryCounts() {
  return useQuery({
    queryKey: ['vendor-category-counts'],
    queryFn: getCategoryCounts,
  });
}

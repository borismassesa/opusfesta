import { waitFor } from '@testing-library/react-native';
import { renderHookWithQueryClient } from '@/test/renderHookWithQueryClient';
import { useCurrentVendor } from './useCurrentVendor';
import { getMyVendor } from '@/lib/api/vendorProfile';
import type { VendorRow } from '@/types/vendor';

jest.mock('@/lib/supabase', () => ({ useAuthenticatedSupabase: () => ({}) }));
jest.mock('@/lib/api/vendorProfile', () => ({ getMyVendor: jest.fn() }));

const mockGetMyVendor = getMyVendor as jest.Mock;

const vendorFixture = (onboarding_status: VendorRow['onboarding_status']): VendorRow =>
  ({ id: 'v1', business_name: 'Zanzibar Blooms', onboarding_status }) as VendorRow;

describe('useCurrentVendor', () => {
  // Canary for the monorepo's dual-React hazard (metro.config.js forces the
  // local copy; jest.config.js must too) — if this fails, fix module
  // resolution before trusting anything else in the suite.
  it('resolves the local react 19 copy', () => {
    expect(require('react').version).toMatch(/^19\./);
  });

  it('derives active approval state for an active vendor', async () => {
    mockGetMyVendor.mockResolvedValue({ vendor: vendorFixture('active'), myRole: 'owner' });
    const { result } = await renderHookWithQueryClient(() => useCurrentVendor());
    await waitFor(() => expect(result.current.approvalState).toEqual({ kind: 'active' }));
    expect(result.current.myRole).toBe('owner');
  });

  it('derives suspended approval state', async () => {
    mockGetMyVendor.mockResolvedValue({ vendor: vendorFixture('suspended'), myRole: 'owner' });
    const { result } = await renderHookWithQueryClient(() => useCurrentVendor());
    await waitFor(() => expect(result.current.approvalState).toEqual({ kind: 'suspended' }));
  });

  it('derives pending approval state with the raw status', async () => {
    mockGetMyVendor.mockResolvedValue({ vendor: vendorFixture('admin_review'), myRole: 'owner' });
    const { result } = await renderHookWithQueryClient(() => useCurrentVendor());
    await waitFor(() =>
      expect(result.current.approvalState).toEqual({ kind: 'pending', status: 'admin_review' })
    );
  });

  // Regression for the staff-account hang: before the vendor_memberships
  // fallback in getMyVendor, a membership-only account resolved to null and
  // every vendor screen spun on {kind:'loading'} forever.
  it('resolves a membership-only staff account instead of hanging on loading', async () => {
    mockGetMyVendor.mockResolvedValue({ vendor: vendorFixture('active'), myRole: 'staff' });
    const { result } = await renderHookWithQueryClient(() => useCurrentVendor());
    await waitFor(() => expect(result.current.approvalState).toEqual({ kind: 'active' }));
    expect(result.current.myRole).toBe('staff');
    expect(result.current.vendor?.id).toBe('v1');
  });

  it('stays loading while the vendor is unresolved', async () => {
    mockGetMyVendor.mockResolvedValue(null);
    const { result } = await renderHookWithQueryClient(() => useCurrentVendor());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.approvalState).toEqual({ kind: 'loading' });
    expect(result.current.myRole).toBeNull();
  });
});

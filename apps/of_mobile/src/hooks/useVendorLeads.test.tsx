import { waitFor } from '@testing-library/react-native';
import { renderHookWithQueryClient } from '@/test/renderHookWithQueryClient';
import { useUpdateLeadStatus } from './useVendorLeads';
import { updateLeadStatus } from '@/lib/api/vendorLeads';

jest.mock('@/lib/supabase', () => ({ useAuthenticatedSupabase: () => ({}) }));
jest.mock('@/lib/api/vendorLeads', () => ({
  ...jest.requireActual('@/lib/api/vendorLeads'),
  updateLeadStatus: jest.fn(),
}));

const mockUpdateLeadStatus = updateLeadStatus as jest.Mock;

describe('useUpdateLeadStatus', () => {
  it('invalidates leads, dashboard, and — critically — vendor-availability', async () => {
    // Accept/decline flips a date via the sync_inquiry_to_availability DB
    // trigger; forgetting the ['vendor-availability'] invalidation leaves
    // the calendar stale with no type error anywhere. Pin the exact set.
    mockUpdateLeadStatus.mockResolvedValue({ id: 'lead-1', status: 'accepted' });
    const { result, queryClient } = await renderHookWithQueryClient(() => useUpdateLeadStatus());
    const spy = jest.spyOn(queryClient, 'invalidateQueries');

    result.current.mutate({ id: 'lead-1', status: 'accepted' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const invalidatedKeys = spy.mock.calls.map(([filters]) => filters?.queryKey);
    expect(invalidatedKeys).toEqual(
      expect.arrayContaining([
        ['vendor-leads'],
        ['vendor-lead', 'lead-1'],
        ['vendor-dashboard'],
        ['vendor-availability'],
      ])
    );
  });

  it('surfaces the API error without invalidating anything', async () => {
    mockUpdateLeadStatus.mockRejectedValue(new Error('rls denied'));
    const { result, queryClient } = await renderHookWithQueryClient(() => useUpdateLeadStatus());
    const spy = jest.spyOn(queryClient, 'invalidateQueries');

    result.current.mutate({ id: 'lead-1', status: 'declined' });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(spy).not.toHaveBeenCalled();
  });
});

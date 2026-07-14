import { waitFor } from '@testing-library/react-native';
import { renderHookWithQueryClient } from '@/test/renderHookWithQueryClient';
import { useAdvanceBookingStage } from './useVendorBookingsPipeline';
import { updateVendorBookingStage } from '@/lib/api/vendorBookings';
import type { VendorBookingTimelineEntry } from '@/types/vendor';

jest.mock('@/lib/supabase', () => ({ useAuthenticatedSupabase: () => ({}) }));
jest.mock('@/lib/api/vendorBookings', () => ({
  ...jest.requireActual('@/lib/api/vendorBookings'),
  updateVendorBookingStage: jest.fn(),
}));

const mockUpdateStage = updateVendorBookingStage as jest.Mock;

describe('useAdvanceBookingStage', () => {
  it('constructs the timeline entry and passes the prior timeline through', async () => {
    mockUpdateStage.mockResolvedValue({ id: 'b1', stage: 'confirmed' });
    const { result } = await renderHookWithQueryClient(() => useAdvanceBookingStage());

    const currentTimeline: VendorBookingTimelineEntry[] = [
      { at: '2026-01-01T00:00:00.000Z', kind: 'reserved', label: 'Reserved' },
    ];
    result.current.mutate({ id: 'b1', stage: 'confirmed', label: 'Moved to Confirmed', currentTimeline });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [, id, stage, entry, priorTimeline] = mockUpdateStage.mock.calls[0];
    expect(id).toBe('b1');
    expect(stage).toBe('confirmed');
    expect(entry).toEqual({
      at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      kind: 'confirmed',
      label: 'Moved to Confirmed',
    });
    expect(priorTimeline).toBe(currentTimeline);
  });

  it('invalidates the bookings pipeline, the booking, and the dashboard', async () => {
    mockUpdateStage.mockResolvedValue({ id: 'b1', stage: 'confirmed' });
    const { result, queryClient } = await renderHookWithQueryClient(() => useAdvanceBookingStage());
    const spy = jest.spyOn(queryClient, 'invalidateQueries');

    result.current.mutate({ id: 'b1', stage: 'confirmed', label: 'Moved to Confirmed', currentTimeline: [] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const invalidatedKeys = spy.mock.calls.map(([filters]) => filters?.queryKey);
    expect(invalidatedKeys).toEqual(
      expect.arrayContaining([['vendor-bookings'], ['vendor-booking', 'b1'], ['vendor-dashboard']])
    );
  });
});

import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChecklistCompletion } from './useChecklist';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@/lib/auth', () => ({ useOpusFestaAuth: () => ({ user: { id: 'user-1' } }) }));

const STORAGE_KEY = 'opusfesta:checklist:user-1';

describe('useChecklistCompletion', () => {
  beforeEach(() => AsyncStorage.clear());

  it('hydrates completed tasks from storage', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(['book-venue', 'set-date']));
    const { result } = await renderHook(() => useChecklistCompletion());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.completed.has('book-venue')).toBe(true);
    expect(result.current.completed.has('set-date')).toBe(true);
    expect(result.current.completed.size).toBe(2);
  });

  it('treats corrupted storage as an empty checklist', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'not-json{');
    const { result } = await renderHook(() => useChecklistCompletion());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.completed.size).toBe(0);
  });

  it('toggle adds then removes a task and persists each change', async () => {
    const { result } = await renderHook(() => useChecklistCompletion());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    await act(async () => result.current.toggle('book-venue'));
    expect(result.current.completed.has('book-venue')).toBe(true);
    expect(JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!)).toEqual(['book-venue']);

    await act(async () => result.current.toggle('book-venue'));
    expect(result.current.completed.has('book-venue')).toBe(false);
    expect(JSON.parse((await AsyncStorage.getItem(STORAGE_KEY))!)).toEqual([]);
  });
});

import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Shared jest-expo helper: a fresh QueryClient per call, with retries off —
// a deliberately-failing query would otherwise retry with backoff and hang
// the test. Returns the client so tests can spy on invalidateQueries.
// NOTE: RTL v14's renderHook is async — always await this.
export async function renderHookWithQueryClient<T>(callback: () => T) {
  // retry off so a failing query fails fast instead of hanging the test;
  // gcTime 0 so cache garbage-collection timers don't keep the jest worker
  // alive after the suite finishes.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false, gcTime: 0 } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const rendered = await renderHook(callback, { wrapper });
  return { ...rendered, queryClient };
}

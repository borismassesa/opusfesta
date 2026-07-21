import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { readCart, withGuestCount, writeCart } from '@/lib/cart';
import type { CartItem } from '@/types/cart';

const QUERY_KEY = ['cart', 'items'] as const;

/**
 * The cart, stored on-device (see lib/cart.ts) and held in the React Query
 * cache so every screen reading it — the card detail screen's badge, the
 * Cards tab header, the cart screen itself — updates together, the same way
 * the web's CartProvider context does.
 */
export function useCart() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: readCart,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: writeCart,
    onMutate: async (next: CartItem[]) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<CartItem[]>(QUERY_KEY);
      queryClient.setQueryData<CartItem[]>(QUERY_KEY, next);
      return { previous };
    },
    onError: (_error, _next, context) => {
      if (context?.previous) {
        queryClient.setQueryData<CartItem[]>(QUERY_KEY, context.previous);
      }
    },
  });

  // Memoized so the `?? []` fallback doesn't hand out a fresh array (and so
  // invalidate every callback below) on each render before the query resolves.
  const data = query.data;
  const items = useMemo(() => data ?? [], [data]);
  const { mutate } = mutation;

  /** One line per design: re-adding a design replaces its line, never stacks. */
  const addItem = useCallback(
    (item: CartItem) => {
      mutate([...items.filter((existing) => existing.id !== item.id), item]);
    },
    [items, mutate]
  );

  const removeItem = useCallback(
    (id: string) => {
      mutate(items.filter((item) => item.id !== id));
    },
    [items, mutate]
  );

  const setGuests = useCallback(
    (id: string, guests: number) => {
      mutate(items.map((item) => (item.id === id ? withGuestCount(item, guests) : item)));
    },
    [items, mutate]
  );

  const clear = useCallback(() => mutate([]), [mutate]);

  const has = useCallback((id: string) => items.some((item) => item.id === id), [items]);

  return {
    items,
    count: items.length,
    subtotal: items.reduce((sum, item) => sum + item.total, 0),
    isPending: query.isPending,
    addItem,
    removeItem,
    setGuests,
    clear,
    has,
  };
}

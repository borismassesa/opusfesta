import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@opusfesta/liked-articles';

/**
 * Local-only "save to favourites" toggle — matches the real web app's own
 * behavior exactly (apps/opus_website's article like button is
 * `localStorage`-only too, no backend counter anywhere), so this isn't a cut
 * corner, it's parity.
 */
export function useLikedArticle(slug: string | undefined) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!active) return;
        const set: string[] = stored ? JSON.parse(stored) : [];
        setLiked(set.includes(slug));
      })
      .catch(() => {
        // Ignore read failures — falls back to not-liked.
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const toggle = useCallback(() => {
    if (!slug) return;
    setLiked((prev) => {
      const next = !prev;
      AsyncStorage.getItem(STORAGE_KEY)
        .then((stored) => {
          const set = new Set<string>(stored ? JSON.parse(stored) : []);
          if (next) set.add(slug);
          else set.delete(slug);
          return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
        })
        .catch(() => {
          // Non-fatal: the like still applies for this session.
        });
      return next;
    });
  }, [slug]);

  return { liked, toggle };
}

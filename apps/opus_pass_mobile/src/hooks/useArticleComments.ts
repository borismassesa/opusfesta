import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  liked: boolean;
}

function storageKey(slug: string) {
  return `@opusfesta/article-comments/${slug}`;
}

/**
 * Local-only comments — the real web app has no comments backend either
 * (`advice_ideas_posts.seed_comments` is admin-authored jsonb, empty on
 * every published post today; anything a visitor types there is
 * `localStorage`-only and never leaves their browser). This mirrors that
 * exact behavior rather than fabricating a synced comment system that
 * doesn't exist anywhere in the real app.
 */
export function useArticleComments(slug: string | undefined) {
  const [comments, setComments] = useState<LocalComment[]>([]);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    AsyncStorage.getItem(storageKey(slug))
      .then((stored) => {
        if (active && stored) setComments(JSON.parse(stored));
      })
      .catch(() => {
        // Ignore read failures — falls back to no saved comments.
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const persist = useCallback(
    (next: LocalComment[]) => {
      setComments(next);
      if (slug) {
        AsyncStorage.setItem(storageKey(slug), JSON.stringify(next)).catch(
          () => {
            // Non-fatal: the comment still applies for this session.
          }
        );
      }
    },
    [slug]
  );

  const addComment = useCallback(
    (author: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const comment: LocalComment = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        author,
        text: trimmed,
        createdAt: new Date().toISOString(),
        liked: false,
      };
      persist([comment, ...comments]);
    },
    [comments, persist]
  );

  const toggleCommentLike = useCallback(
    (id: string) => {
      persist(
        comments.map((c) => (c.id === id ? { ...c, liked: !c.liked } : c))
      );
    },
    [comments, persist]
  );

  return { comments, addComment, toggleCommentLike };
}

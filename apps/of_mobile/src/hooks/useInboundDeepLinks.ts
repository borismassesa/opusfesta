import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useOpusFestaAuth } from '@/lib/auth';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { resolveDeepLink, setPendingDeepLink, consumePendingDeepLink } from '@/lib/deepLinks';

/**
 * Handles inbound opusfesta:// / https://opusfesta.com links (vendor
 * profiles, chat threads, the caller's own wedding-website preview).
 * Links that arrive before the user is signed in and onboarded are stashed
 * and resumed once auth resolves, mirroring how the rest of the app funnels
 * everything through the `/(tabs)` gate.
 *
 * Universal links (tapping an https link outside the app) aren't wired up
 * yet — that needs native associated-domains/App Links config plus hosting
 * an AASA/assetlinks.json file, which is out of scope here. This covers the
 * opusfesta:// custom scheme, which already reaches the app today.
 */
export function useInboundDeepLinks() {
  const { isLoaded, isSignedIn, user } = useOpusFestaAuth();
  const authedClient = useAuthenticatedSupabase();
  const router = useRouter();
  const ready = isLoaded && isSignedIn && !!user?.onboardingComplete;

  useEffect(() => {
    const handleUrl = (url: string) => {
      if (!ready) {
        setPendingDeepLink(url);
        return;
      }
      resolveDeepLink(url, authedClient)
        .then((target) => {
          if (target) router.push(target as never);
        })
        .catch(() => {
          // Best-effort — a bad/expired link should never crash the app.
        });
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const pending = consumePendingDeepLink();
    if (!pending) return;
    resolveDeepLink(pending, authedClient)
      .then((target) => {
        if (target) router.push(target as never);
      })
      .catch(() => {
        // Best-effort — see above.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
}

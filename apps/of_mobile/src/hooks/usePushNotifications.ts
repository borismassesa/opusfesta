import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuthenticatedSupabase } from '@/lib/supabase';
import { useOpusFestaAuth } from '@/lib/auth';
import { registerForPushNotificationsAsync } from '@/lib/push';
import { upsertPushToken } from '@/lib/api/push';

/**
 * Registers the device's Expo push token once per signed-in session and
 * routes notification taps to the relevant screen. Silently no-ops when
 * permission is denied or a token can't be minted (e.g. simulator) — push
 * is additive, never blocking.
 */
export function usePushNotifications() {
  const { isSignedIn, user } = useOpusFestaAuth();
  const client = useAuthenticatedSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn || !user) return;

    let cancelled = false;
    registerForPushNotificationsAsync()
      .then((registered) => {
        if (cancelled || !registered) return;
        return upsertPushToken(client, user.id, registered.token, registered.platform);
      })
      .catch(() => {
        // Best-effort — push registration should never block the app.
      });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, user, client]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | { type?: string; threadId?: string; inquiryId?: string }
        | undefined;

      if (data?.type === 'message' && data.threadId) {
        router.push({ pathname: '/(tabs)/messages/[id]', params: { id: data.threadId } });
      } else if (data?.type === 'inquiry') {
        router.push('/notifications');
      }
    });

    return () => subscription.remove();
  }, [router]);
}

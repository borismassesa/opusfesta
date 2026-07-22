import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEEN_KEY = 'opuspass.scanner.tipsSeen';
const BANNER_KEY = 'opuspass.scanner.tipsBannerDismissed';

/**
 * First-run coaching for the scan screen.
 *
 * Door attendants are usually casual staff working a single shift, handed a
 * phone minutes before guests arrive and never trained on it. The tips fire
 * once, unprompted, and then stay reachable from a banner they can dismiss —
 * so the person who already knows the job isn't taxed for the person who
 * doesn't.
 *
 * AsyncStorage rather than SecureStore: this is a UI preference, not a
 * credential, and losing it costs one extra dismissal.
 */
export function useScannerTips() {
  const [ready, setReady] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [seen, dismissed] = await AsyncStorage.multiGet([SEEN_KEY, BANNER_KEY]);
        if (cancelled) return;
        setShowTips(seen[1] !== 'true');
        setBannerVisible(dismissed[1] !== 'true');
      } catch {
        // Unreadable store — show the tips. Coaching someone twice is a much
        // smaller failure than never coaching them at all.
        if (!cancelled) {
          setShowTips(true);
          setBannerVisible(true);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openTips = useCallback(() => setShowTips(true), []);

  const closeTips = useCallback(() => {
    setShowTips(false);
    AsyncStorage.setItem(SEEN_KEY, 'true').catch(() => {
      // Non-fatal: they'll see the tips again next launch.
    });
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
    AsyncStorage.setItem(BANNER_KEY, 'true').catch(() => {
      // Non-fatal, as above.
    });
  }, []);

  return { ready, showTips, openTips, closeTips, bannerVisible, dismissBanner };
}

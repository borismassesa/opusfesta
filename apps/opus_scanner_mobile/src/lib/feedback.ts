import * as Haptics from 'expo-haptics'

/**
 * Haptic confirmation for a scan result — port of apps/opus_scanner's
 * scan/feedback.ts. The web version paired vibrate() with a synthesized
 * WebAudio tone because neither is reliable alone on the open web; native
 * haptics are the stronger, more consistent signal on a phone, so there's
 * no audio tone here.
 */
export type FeedbackTone = 'success' | 'duplicate' | 'fail'

export async function playScanFeedback(tone: FeedbackTone): Promise<void> {
  try {
    if (tone === 'success') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else if (tone === 'duplicate') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
  } catch {
    // best-effort — never block the check-in flow on a haptics failure
  }
}

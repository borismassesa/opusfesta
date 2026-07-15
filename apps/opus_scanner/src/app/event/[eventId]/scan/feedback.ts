/** Haptic + audio confirmation for a scan result — a color/icon flash alone
 * isn't an "unmistakable" pass/fail signal at a loud, chaotic door. Both are
 * best-effort: vibrate() is Android-Chrome-only (silent no-op on iOS
 * Safari/desktop), and Web Audio can fail if the tab never had a user
 * gesture yet — neither failure should ever block the actual check-in. */
export type FeedbackTone = 'success' | 'duplicate' | 'fail'

export function playScanFeedback(tone: FeedbackTone): void {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(tone === 'success' ? 80 : tone === 'duplicate' ? [50, 60, 50] : [120, 60, 120])
    }
  } catch {
    // ignore
  }

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = tone === 'success' ? 880 : tone === 'duplicate' ? 440 : 220
    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
    osc.onended = () => ctx.close()
  } catch {
    // ignore — audio context can throw before any user gesture on some browsers
  }
}

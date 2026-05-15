import { useCallback, useState, useTransition } from 'react'

// Centralized wrapper around `useTransition` for CMS editor server-action
// calls. Without this, every editor independently does
//
//   startTransition(async () => { await saveDraft(...); setMessage('Saved.') })
//
// which means any throw becomes an unhandled rejection: the toast never
// appears, the row never updates, and the admin sees zero feedback.
//
// `runAction` runs the job inside a transition, captures the message it
// surfaces on success, and turns any thrown error into a user-visible string
// in the `error` state. Editors render `error` next to `message` so server-
// side failures (auth, 413 body-too-large, network) stop being invisible.
export function useEditorActionRunner() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runAction = useCallback(
    (job: () => Promise<void>) => {
      startTransition(async () => {
        setError(null)
        try {
          await job()
        } catch (err) {
          const detail = err instanceof Error ? err.message : String(err)
          setError(`That didn’t go through: ${detail}`)
          setMessage(null)
          console.error('[cms-editor] server action failed:', err)
        }
      })
    },
    [],
  )

  return { pending, message, error, setMessage, setError, runAction }
}

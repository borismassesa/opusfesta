import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { AlertTriangle, ArrowRight, ShieldCheck, User } from 'lucide-react-native'
import { readSession, writeSession, type ScannerSession } from '@/lib/session'
import { saveRoster } from '@/lib/db'
import { validateAccess } from '@/lib/api'
import { colors } from '@/constants/theme'

/**
 * Event login — port of apps/opus_scanner's EventLogin.tsx. The web version
 * splits into a two-column layout with a decorative animated QR visual on
 * the right at desktop widths; this is a phone-only app so there's no
 * desktop breakpoint to fill, just the single centered column.
 */
export default function EventLogin() {
  const router = useRouter()
  const { eventId, token: urlToken } = useLocalSearchParams<{ eventId: string; token?: string }>()

  const [state, setState] = useState<'checking' | 'attendant' | 'ready' | 'error'>('checking')
  const [session, setSession] = useState<ScannerSession | null>(null)
  const [error, setError] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    let cancelled = false

    async function run() {
      const existing = await readSession(eventId)
      const token = urlToken || existing?.accessToken

      if (!token) {
        if (!cancelled) {
          setState('error')
          setError('This link is missing an access token. Ask the couple to send you a fresh one.')
        }
        return
      }

      try {
        const data = await validateAccess(eventId, token)
        if (cancelled) return
        if (!data.ok) {
          setState('error')
          setError(data.error || 'This link is no longer valid.')
          return
        }
        // An admin-assigned code carries its own authoritative name — skip
        // the "who's scanning?" step entirely and go straight to 'ready'.
        const assignedName = data.attendantName || undefined
        const next: ScannerSession = {
          eventId,
          accessToken: token,
          doorLabel: data.doorLabel ?? '',
          eventName: data.event?.name ?? 'Event',
          attendantName: assignedName ?? existing?.attendantName ?? '',
          attendantAssigned: Boolean(assignedName),
        }
        await writeSession(next)
        // Cache the roster for offline scanning; failing this shouldn't
        // block login — it just means offline mode won't have fresh data yet.
        saveRoster(eventId, data.roster ?? []).catch(() => {})
        setSession(next)
        setState(next.attendantName ? 'ready' : 'attendant')
      } catch {
        if (!cancelled) {
          setState('error')
          setError('Could not reach the server. Check your connection and try again.')
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [eventId, urlToken])

  async function startShift() {
    if (!session || !name.trim()) return
    const next: ScannerSession = { ...session, attendantName: name.trim() }
    await writeSession(next)
    setSession(next)
    setState('ready')
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-12">
        <View className="flex-row items-baseline">
          <Text className="text-2xl font-bold text-purple">Opus</Text>
          <Text className="text-2xl font-bold text-ink">Pass</Text>
        </View>

        <View className="mt-10 max-w-sm">
          {state === 'checking' ? (
            <View className="flex-row items-center gap-3">
              <ActivityIndicator color={colors.purple} />
              <Text className="text-sm text-ink/70">Verifying your link…</Text>
            </View>
          ) : null}

          {state === 'error' ? (
            <View>
              <View className="h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-rose-50">
                <AlertTriangle size={20} color={colors.rose} />
              </View>
              <Text className="mt-5 text-2xl font-bold tracking-tight text-ink">Link not valid</Text>
              <Text className="mt-3 text-base text-ink/60">{error}</Text>
            </View>
          ) : null}

          {state === 'attendant' ? (
            <View>
              <Text className="text-[11px] font-semibold tracking-wide text-purple uppercase">
                {session?.eventName}
              </Text>
              <Text className="mt-2 text-2xl font-bold tracking-tight text-ink">Who&apos;s scanning?</Text>
              <Text className="mt-3 text-base text-ink/60">
                Enter your name to start your shift at{' '}
                <Text className="font-medium text-ink">{session?.doorLabel}</Text>.
              </Text>

              <View className="mt-8 flex-row items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-1">
                <User size={16} color={colors.ink + '66'} />
                <TextInput
                  autoFocus
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="#6b7280"
                  className="flex-1 py-3 text-sm text-ink"
                />
              </View>

              <TouchableOpacity
                onPress={startShift}
                disabled={!name.trim()}
                className="mt-4 w-full flex-row items-center justify-center gap-2 rounded-xl bg-lavender px-6 py-3.5 disabled:opacity-40"
              >
                <Text className="text-sm font-semibold text-ink">Start Shift</Text>
                <ArrowRight size={14} color={colors.ink} />
              </TouchableOpacity>
            </View>
          ) : null}

          {state === 'ready' ? (
            <View>
              <Text className="text-[11px] font-semibold tracking-wide text-purple uppercase">
                {session?.eventName}
              </Text>
              <Text className="mt-2 text-2xl font-bold tracking-tight text-ink">{session?.doorLabel}</Text>
              <View className="mt-4 flex-row items-center gap-1.5 self-start rounded-full bg-green-tint px-3 py-1.5">
                <ShieldCheck size={14} color={colors.greenDark} />
                <Text className="text-xs font-semibold tracking-wide text-green-dark uppercase">
                  Checked in as {session?.attendantName}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.replace({ pathname: '/event/[eventId]/scan', params: { eventId } })}
                className="mt-8 w-full flex-row items-center justify-center gap-2 rounded-xl bg-lavender px-6 py-3.5"
              >
                <Text className="text-sm font-semibold text-ink">Enter Portal</Text>
                <ArrowRight size={14} color={colors.ink} />
              </TouchableOpacity>

              {/* Admin-assigned codes ARE the identity — there's no separate
                  name step to switch back into, only a different code. */}
              {!session?.attendantAssigned ? (
                <TouchableOpacity
                  onPress={() => {
                    setName('')
                    setState('attendant')
                  }}
                  className="mt-3"
                >
                  <Text className="text-xs text-purple underline">
                    Not {session?.attendantName}? Switch attendant
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  )
}

import { useState } from 'react'
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { resolveAccessCode } from '@/lib/api'
import { colors } from '@/constants/theme'

/**
 * Home screen — port of apps/opus_scanner's app/page.tsx. This app has no
 * desktop breakpoint (it's a phone-only door-staff tool), so there's no
 * split-screen QR illustration like the web version grew for wide viewports
 * — just the centered access-code entry.
 */
export default function Home() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submitCode() {
    const trimmed = code.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    try {
      const data = await resolveAccessCode(trimmed)
      if (!data.ok || !data.eventId) {
        setError(data.error || 'That code was not recognized')
        setLoading(false)
        return
      }
      router.push({ pathname: '/event/[eventId]', params: { eventId: data.eventId, token: trimmed } })
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center gap-6 px-6">
        <View className="flex-row items-baseline">
          <Text className="text-3xl font-bold text-purple">Opus</Text>
          <Text className="text-3xl font-bold text-ink">Pass</Text>
        </View>

        <View className="items-center gap-3">
          <Text className="text-xl font-bold tracking-tight text-ink">Door Scanner</Text>
          <View className="flex-row items-center gap-3">
            <View className="h-px w-8 bg-black/10" />
            <Text className="text-[10px] tracking-wide text-purple uppercase">Digital Entry Portal</Text>
            <View className="h-px w-8 bg-black/10" />
          </View>
          <Text className="max-w-xs text-center text-sm leading-relaxed text-ink/70">
            Open the event link the couple or OpusFesta team sent you, or enter your access code
            below if you were only given one verbally.
          </Text>
        </View>

        <View className="w-full max-w-xs gap-3">
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Enter access code"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#6b7280"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-center text-sm text-ink"
          />
          {error ? <Text className="text-xs text-rose">{error}</Text> : null}
          <TouchableOpacity
            onPress={submitCode}
            disabled={!code.trim() || loading}
            className="w-full flex-row items-center justify-center gap-2 rounded-xl bg-lavender px-6 py-3 disabled:opacity-40"
          >
            {loading ? (
              <ActivityIndicator color={colors.ink} />
            ) : (
              <Text className="text-sm font-semibold text-ink">Continue →</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

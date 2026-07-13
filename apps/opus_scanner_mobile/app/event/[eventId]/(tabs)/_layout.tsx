import { useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Tabs, useLocalSearchParams, useRouter } from 'expo-router'
import { BarChart3, ScanLine, User, Users } from 'lucide-react-native'
import { clearAttendant, readSession } from '@/lib/session'
import { colors } from '@/constants/theme'

/**
 * Scan/Guests/Stats tab shell — port of apps/opus_scanner's ScannerShell.tsx.
 * The web version also renders a desktop top nav bar (this is primarily a
 * mobile PWA there, bottom bar is what staff actually use); this app has no
 * desktop mode, so it's just the bottom tab bar, always.
 */
function AttendantHeader({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [attendantName, setAttendantName] = useState('')
  const [attendantAssigned, setAttendantAssigned] = useState(false)

  useEffect(() => {
    readSession(eventId).then((s) => {
      setAttendantName(s?.attendantName ?? '')
      setAttendantAssigned(Boolean(s?.attendantAssigned))
    })
  }, [eventId])

  async function switchAttendant() {
    await clearAttendant(eventId)
    router.replace({ pathname: '/event/[eventId]', params: { eventId } })
  }

  return (
    <SafeAreaView edges={['top']} className="border-b border-black/10 bg-white">
      <View className="h-14 flex-row items-center justify-between px-5">
        <View className="flex-row items-baseline">
          <Text className="text-lg font-bold text-purple">Opus</Text>
          <Text className="text-lg font-bold text-ink">Pass</Text>
        </View>

        {attendantName ? (
          <TouchableOpacity
            onPress={attendantAssigned ? undefined : switchAttendant}
            disabled={attendantAssigned}
            className="flex-row items-center gap-2 rounded-full border border-black/10 px-3 py-1.5"
          >
            <View className="h-6 w-6 items-center justify-center rounded-full bg-lavender-tint">
              <User size={13} color={colors.purple} />
            </View>
            <Text className="text-xs font-medium text-ink">{attendantName}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  )
}

export default function TabsLayout() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>()

  return (
    <Tabs
      screenOptions={{
        header: () => <AttendantHeader eventId={eventId} />,
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.ink,
        tabBarActiveBackgroundColor: colors.lavenderTint,
        tabBarLabelStyle: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
      }}
    >
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size} /> }} />
      <Tabs.Screen name="guests" options={{ title: 'Guests', tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats', tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} /> }} />
    </Tabs>
  )
}

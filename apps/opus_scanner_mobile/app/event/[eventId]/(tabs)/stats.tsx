import { useCallback, useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Svg, { Path } from 'react-native-svg'
import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react-native'
import { readSession } from '@/lib/session'
import { listRoster, type RosterEntry } from '@/lib/db'
import { checkinChannelName, createRealtimeClient, type CheckinBroadcastPayload } from '@/lib/realtimeClient'
import { colors } from '@/constants/theme'

type RosterRow = RosterEntry & { key: string; eventId: string }

/** Metrics/capacity screen — port of apps/opus_scanner's StatsClient.tsx.
 * The capacity ring uses the same SVG path + stroke-dasharray technique as
 * the web version — react-native-svg supports the identical `d` syntax. */
export default function StatsScreen() {
  const router = useRouter()
  const { eventId } = useLocalSearchParams<{ eventId: string }>()
  const [roster, setRoster] = useState<RosterRow[]>([])
  const [activity, setActivity] = useState<CheckinBroadcastPayload[]>([])

  const refresh = useCallback(() => {
    listRoster(eventId).then(setRoster)
  }, [eventId])

  useEffect(() => {
    readSession(eventId).then((s) => {
      if (!s || !s.attendantName) {
        router.replace({ pathname: '/event/[eventId]', params: { eventId } })
        return
      }
      refresh()
    })
  }, [eventId, refresh, router])

  useEffect(() => {
    let client: ReturnType<typeof createRealtimeClient>
    try {
      client = createRealtimeClient()
    } catch {
      return
    }
    const channel = client
      .channel(checkinChannelName(eventId))
      .on('broadcast', { event: 'scan' }, ({ payload }) => {
        setActivity((prev) => [payload as CheckinBroadcastPayload, ...prev].slice(0, 10))
        refresh()
      })
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }, [eventId, refresh])

  const admitted = roster.filter((r) => r.checkedInAt).length
  const remaining = roster.length - admitted
  const capacityPct = roster.length > 0 ? Math.round((admitted / roster.length) * 100) : 0
  const vipTotal = roster.filter((r) => r.isVip).length
  const vipAdmitted = roster.filter((r) => r.isVip && r.checkedInAt).length
  const generalTotal = roster.length - vipTotal
  const generalAdmitted = admitted - vipAdmitted
  const generalPct = generalTotal > 0 ? Math.round((generalAdmitted / generalTotal) * 100) : 0
  const vipPct = vipTotal > 0 ? Math.round((vipAdmitted / vipTotal) * 100) : 0

  const doorsByLastSeen = Object.values(
    activity.reduce<Record<string, CheckinBroadcastPayload>>((acc, a) => {
      if (!acc[a.doorLabel] || a.at > acc[a.doorLabel].at) acc[a.doorLabel] = a
      return acc
    }, {}),
  )

  const ringPath = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-5" contentContainerStyle={{ paddingBottom: 32 }}>
      <Text className="text-xl font-bold tracking-tight text-ink">Metrics &amp; Flow</Text>
      <Text className="mb-6 mt-0.5 text-[11px] tracking-wide text-ink/60 uppercase">Live check-in analysis</Text>

      <View className="mb-4 flex-row gap-3">
        <View className="flex-1 rounded-xl border border-black/10 bg-white p-4">
          <Text className="text-[10px] tracking-wide text-ink/60 uppercase">Admitted</Text>
          <Text className="mt-1.5 text-2xl font-bold text-ink">{admitted}</Text>
          <View className="mt-3 h-1 w-full overflow-hidden rounded-full bg-black/5">
            <View className="h-full bg-green" style={{ width: `${capacityPct}%` }} />
          </View>
        </View>
        <View className="flex-1 rounded-xl border border-black/10 bg-white p-4">
          <Text className="text-[10px] tracking-wide text-ink/60 uppercase">Remaining</Text>
          <Text className="mt-1.5 text-2xl font-bold text-ink">{remaining}</Text>
          <View className="mt-3 h-1 w-full overflow-hidden rounded-full bg-black/5">
            <View className="h-full bg-gray-400" style={{ width: `${100 - capacityPct}%` }} />
          </View>
        </View>
      </View>

      <View className="mb-6 flex-row items-center justify-between rounded-xl border border-black/10 bg-white p-4">
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-green" />
          <Text className="text-[11px] tracking-wide text-ink uppercase">
            {doorsByLastSeen.length || 1} door{doorsByLastSeen.length === 1 ? '' : 's'} active
          </Text>
        </View>
        <ShieldCheck size={16} color={colors.purple} />
      </View>

      <View className="mb-6 items-center rounded-xl border border-black/10 bg-white p-6">
        <Text className="mb-4 self-start text-[10px] tracking-wide text-ink/60 uppercase">Capacity</Text>
        <View className="h-40 w-40 items-center justify-center">
          <Svg viewBox="0 0 36 36" style={{ width: 160, height: 160, transform: [{ rotate: '-90deg' }] }}>
            <Path d={ringPath} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={2} />
            <Path
              d={ringPath}
              fill="none"
              stroke={colors.green}
              strokeWidth={2}
              strokeDasharray={`${capacityPct}, 100`}
              strokeLinecap="round"
            />
          </Svg>
          <View className="absolute items-center">
            <Text className="text-3xl font-bold text-ink">{capacityPct}%</Text>
            <Text className="text-[9px] tracking-wide text-ink/60 uppercase">Checked in</Text>
          </View>
        </View>
      </View>

      <View className="mb-6 rounded-xl border border-black/10 bg-white p-6">
        <Text className="mb-5 text-[10px] tracking-wide text-ink/60 uppercase">Tier breakdown</Text>
        <View className="gap-6">
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs tracking-wide text-ink uppercase">General Admission</Text>
              <Text className="text-sm font-semibold text-ink">{generalAdmitted} / {generalTotal}</Text>
            </View>
            <View className="h-2 w-full overflow-hidden rounded-full bg-black/5">
              <View className="h-full bg-purple" style={{ width: `${generalPct}%` }} />
            </View>
          </View>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs tracking-wide text-amber-dark uppercase">VIP / Hospitality</Text>
              <Text className="text-sm font-semibold text-ink">{vipAdmitted} / {vipTotal}</Text>
            </View>
            <View className="h-2 w-full overflow-hidden rounded-full bg-black/5">
              <View className="h-full bg-amber" style={{ width: `${vipPct}%` }} />
            </View>
          </View>
        </View>
      </View>

      <View className="rounded-xl border border-black/10 bg-white">
        <View className="flex-row items-center justify-between border-b border-black/5 px-4 py-3">
          <Text className="text-[10px] tracking-wide text-ink/60 uppercase">Recent activity</Text>
          <View className="flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 rounded-full bg-green" />
            <Text className="text-[9px] tracking-wide text-ink/60 uppercase">Live sync</Text>
          </View>
        </View>
        {activity.length === 0 ? (
          <Text className="px-4 py-8 text-center text-sm text-ink/60">No activity yet</Text>
        ) : (
          activity.map((a, i) => (
            <View key={i} className="flex-row items-center justify-between border-b border-black/5 px-4 py-3">
              <View className="flex-1">
                <Text className="font-medium text-ink">{a.guestName}</Text>
                <Text className="text-[10px] tracking-wide text-ink/60 uppercase">{a.doorLabel}</Text>
              </View>
              <View
                className={`flex-row items-center gap-1.5 rounded px-2 py-1 ${
                  a.status === 'duplicate' ? 'bg-amber-tint/50' : 'bg-green-tint/50'
                }`}
              >
                {a.status === 'duplicate' ? (
                  <Clock size={12} color={colors.amberDark} />
                ) : (
                  <CheckCircle2 size={12} color={colors.greenDark} />
                )}
                <Text
                  className={`text-[9px] tracking-wide uppercase ${
                    a.status === 'duplicate' ? 'text-amber-dark' : 'text-green-dark'
                  }`}
                >
                  {a.status === 'duplicate' ? 'Duplicate' : 'Admitted'}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

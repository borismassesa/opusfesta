import { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Search } from 'lucide-react-native'
import { readSession, type ScannerSession } from '@/lib/session'
import { listRoster, markRosterCheckedInLocally, type RosterEntry } from '@/lib/db'
import { checkinChannelName, createRealtimeClient } from '@/lib/realtimeClient'
import { submitCheckin } from '@/lib/api'
import { colors } from '@/constants/theme'

type RosterRow = RosterEntry & { key: string; eventId: string }
type Filter = 'all' | 'vip' | 'checked_in' | 'pending'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

/** Guest ledger — port of apps/opus_scanner's GuestsClient.tsx. The web
 * version renders an HTML table; a FlatList of row cards is the natural RN
 * equivalent (no <table> primitive). */
export default function GuestsScreen() {
  const router = useRouter()
  const { eventId } = useLocalSearchParams<{ eventId: string }>()
  const [roster, setRoster] = useState<RosterRow[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [session, setSession] = useState<ScannerSession | null>(null)

  const refresh = useCallback(() => {
    listRoster(eventId).then(setRoster)
  }, [eventId])

  useEffect(() => {
    readSession(eventId).then((s) => {
      if (!s || !s.attendantName) {
        router.replace({ pathname: '/event/[eventId]', params: { eventId } })
        return
      }
      setSession(s)
      refresh()
    })
  }, [eventId, refresh, router])

  // Live updates from any door — without this, the ledger only reflects
  // check-ins that happened before this screen loaded.
  useEffect(() => {
    let client: ReturnType<typeof createRealtimeClient>
    try {
      client = createRealtimeClient()
    } catch {
      return
    }
    const channel = client
      .channel(checkinChannelName(eventId))
      .on('broadcast', { event: 'scan' }, () => refresh())
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }, [eventId, refresh])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return roster
      .filter((r) => (q ? r.fullName.toLowerCase().includes(q) : true))
      .filter((r) => {
        if (filter === 'vip') return r.isVip
        if (filter === 'checked_in') return Boolean(r.checkedInAt)
        if (filter === 'pending') return !r.checkedInAt
        return true
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
  }, [roster, query, filter])

  const admitted = roster.filter((r) => r.checkedInAt).length
  const capacityPct = roster.length > 0 ? Math.round((admitted / roster.length) * 100) : 0

  async function admit(entry: RosterRow) {
    if (!session || pendingKey) return
    setPendingKey(entry.key)
    try {
      const data = await submitCheckin({
        eventId,
        accessToken: session.accessToken,
        doorLabel: session.doorLabel,
        attendantName: session.attendantName,
        qrToken: entry.qrToken,
        manualReason: 'Ledger',
      })
      if (data.status === 'success' || data.status === 'duplicate') {
        await markRosterCheckedInLocally(eventId, entry.qrToken, new Date().toISOString())
      }
    } finally {
      setPendingKey(null)
      refresh()
    }
  }

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'vip', label: 'VIP' },
    { key: 'pending', label: 'Pending' },
    { key: 'checked_in', label: 'Checked in' },
  ]

  return (
    <View className="flex-1 bg-white px-4 pt-5">
      <View className="mb-5 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold tracking-tight text-ink">Guest Ledger</Text>
          <Text className="mt-0.5 text-[11px] tracking-wide text-ink/60 uppercase">Live access verification</Text>
        </View>
        <View className="rounded-full border border-green-tint bg-green-tint px-3 py-1">
          <Text className="text-[10px] tracking-wide text-green-dark uppercase">{capacityPct}%</Text>
        </View>
      </View>

      <View className="mb-4 flex-row items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-1">
        <Search size={16} color={colors.ink} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name…"
          placeholderTextColor="#6b7280"
          className="flex-1 py-3 text-sm text-ink"
        />
      </View>

      <View className="mb-4 flex-row gap-2">
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            className={`rounded-lg border px-4 py-2 ${filter === f.key ? 'border-ink bg-ink' : 'border-black/10 bg-white'}`}
          >
            <Text className={`text-[10px] font-medium tracking-wide uppercase ${filter === f.key ? 'text-white' : 'text-ink'}`}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text className="py-12 text-center text-sm text-ink/60">
            {roster.length === 0 ? 'No guests cached yet.' : 'No guests match this view.'}
          </Text>
        }
        renderItem={({ item: guest }) => (
          <View className={`mb-2 flex-row items-center gap-3 rounded-xl border border-black/10 p-3 ${guest.checkedInAt ? 'bg-green-tint/30' : 'bg-white'}`}>
            <View className={`h-9 w-9 items-center justify-center rounded-full ${guest.isVip ? 'bg-amber-tint' : 'bg-lavender-tint'}`}>
              <Text className={`text-sm font-semibold ${guest.isVip ? 'text-amber-dark' : 'text-purple'}`}>{initials(guest.fullName)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-ink">{guest.fullName}</Text>
              <View className="mt-0.5 flex-row flex-wrap items-center gap-1.5">
                <Text className="text-[10px] tracking-wide text-ink/60 uppercase">Party of {guest.partySize}</Text>
                {guest.groupTag ? (
                  <Text className="rounded border border-black/10 bg-black/5 px-1.5 py-0.5 text-[9px] tracking-wide text-ink/70 uppercase">
                    {guest.groupTag}
                  </Text>
                ) : null}
                {guest.isVip ? (
                  <Text className="rounded border border-amber-tint bg-amber-tint px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-amber-dark uppercase">
                    VIP
                  </Text>
                ) : null}
              </View>
            </View>
            {guest.checkedInAt ? (
              <Text className="text-[10px] font-semibold tracking-wide text-green-dark uppercase">Verified</Text>
            ) : (
              <TouchableOpacity
                onPress={() => admit(guest)}
                disabled={pendingKey === guest.key}
                className="rounded-lg border border-black/10 px-3 py-2 disabled:opacity-40"
              >
                <Text className="text-[10px] tracking-wide text-ink uppercase">
                  {pendingKey === guest.key ? 'Admitting…' : 'Admit'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  )
}

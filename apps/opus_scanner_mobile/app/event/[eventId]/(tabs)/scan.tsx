import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera'
import { CheckCircle2, Flashlight, FlashlightOff, RotateCw, Users, XCircle } from 'lucide-react-native'
import { readSession, type ScannerSession } from '@/lib/session'
import {
  enqueuePendingScan,
  listPendingScans,
  listRoster,
  lookupRoster,
  markRosterCheckedInLocally,
  removePendingScan,
  type RosterEntry,
} from '@/lib/db'
import { checkinChannelName, createRealtimeClient, type CheckinBroadcastPayload } from '@/lib/realtimeClient'
import { submitCheckin } from '@/lib/api'
import { playScanFeedback } from '@/lib/feedback'
import { SCAN_STRINGS, readLocale, onLocaleChange, type Locale } from '@/lib/locale'
import { colors } from '@/constants/theme'

interface CheckinResult {
  status: 'success' | 'duplicate' | 'invalid' | 'error' | 'queued'
  message?: string
  guestName?: string
  partySize?: number
  isVip?: boolean
  groupTag?: string | null
}

type RosterRow = RosterEntry & { key: string; eventId: string }

const RESCAN_COOLDOWN_MS = 3000

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

/**
 * Scan tab — port of apps/opus_scanner's ScanClient.tsx. The web version
 * hand-rolls a BarcodeDetector/jsQR decode loop over a raw <video> element;
 * expo-camera's CameraView does continuous QR decoding natively via
 * onBarcodeScanned, so that whole polling loop just isn't needed here.
 */
export default function ScanScreen() {
  const router = useRouter()
  const { eventId } = useLocalSearchParams<{ eventId: string }>()
  const [permission, requestPermission] = useCameraPermissions()

  const lastScanRef = useRef<{ value: string; at: number } | null>(null)
  const sessionRef = useRef<ScannerSession | null>(null)
  const inFlightRef = useRef(false)

  const [locale, setLocale] = useState<Locale>('en')
  useEffect(() => {
    readLocale().then(setLocale)
    return onLocaleChange(setLocale)
  }, [])
  const t = SCAN_STRINGS[locale]

  const [result, setResult] = useState<CheckinResult | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [facing, setFacing] = useState<'back' | 'front'>('back')
  const [torchOn, setTorchOn] = useState(false)

  const refreshPendingCount = useCallback(() => {
    listPendingScans(eventId).then((rows) => setPendingCount(rows.length))
  }, [eventId])

  /** Resolve a scan against the cached roster when we have no network. */
  const checkInOffline = useCallback(async (qrToken: string, manualReason?: string): Promise<CheckinResult> => {
    const session = sessionRef.current
    if (!session) return { status: 'error', message: 'No active session' }

    const entry = await lookupRoster(eventId, qrToken)
    if (!entry) return { status: 'invalid', message: 'Not a valid entry pass (offline — will not sync)' }
    if (entry.checkedInAt) {
      return { status: 'duplicate', guestName: entry.fullName, partySize: entry.partySize, isVip: entry.isVip, groupTag: entry.groupTag }
    }

    const now = new Date().toISOString()
    await markRosterCheckedInLocally(eventId, qrToken, now)
    await enqueuePendingScan({
      eventId,
      qrToken,
      doorLabel: session.doorLabel,
      attendantName: session.attendantName,
      scannedAt: now,
      manualReason,
    })
    refreshPendingCount()
    return { status: 'queued', guestName: entry.fullName, partySize: entry.partySize, isVip: entry.isVip, groupTag: entry.groupTag }
  }, [eventId, refreshPendingCount])

  const submitScan = useCallback(async (qrToken: string, manualReason?: string) => {
    const session = sessionRef.current
    if (!session || inFlightRef.current) return
    inFlightRef.current = true
    let data: CheckinResult
    try {
      try {
        data = await submitCheckin({
          eventId,
          accessToken: session.accessToken,
          doorLabel: session.doorLabel,
          attendantName: session.attendantName,
          qrToken,
          manualReason,
        })
        // Keep the local roster cache in sync with the server's authoritative
        // write — without this, a successful online scan never shows up in
        // the Guests tab until the next full login.
        if (data.status === 'success' || data.status === 'duplicate') {
          await markRosterCheckedInLocally(eventId, qrToken, new Date().toISOString())
        }
      } catch {
        // fetch threw — treat as offline rather than a hard error.
        data = await checkInOffline(qrToken, manualReason)
      }
      setResult(data)
      playScanFeedback(
        data.status === 'success' || data.status === 'queued'
          ? 'success'
          : data.status === 'duplicate'
            ? 'duplicate'
            : 'fail',
      )
    } finally {
      inFlightRef.current = false
    }
    setTimeout(() => setResult(null), 2200)
  }, [eventId, checkInOffline])

  /** Flush queued offline scans. RN has no navigator.onLine/'online' event,
   * so this runs on mount and whenever the app comes back to the
   * foreground — plus every submitScan already retries inline via the
   * catch-and-fallback above. */
  const flushQueue = useCallback(async () => {
    const session = sessionRef.current
    if (!session) return
    const pending = await listPendingScans(eventId)
    for (const scan of pending) {
      try {
        await submitCheckin({
          eventId,
          accessToken: session.accessToken,
          doorLabel: scan.doorLabel,
          attendantName: scan.attendantName,
          qrToken: scan.qrToken,
          manualReason: scan.manualReason,
        })
        if (scan.id !== undefined) await removePendingScan(scan.id)
      } catch {
        break // still offline — stop and retry next time
      }
    }
    refreshPendingCount()
  }, [eventId, refreshPendingCount])

  useEffect(() => {
    refreshPendingCount()
    flushQueue()
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') flushQueue()
    })
    return () => sub.remove()
  }, [flushQueue, refreshPendingCount])

  // Live "recent activity" across all doors for this event, seeded from the
  // roster's own checked-in guests on load (a Realtime Broadcast channel has
  // no history).
  const [activity, setActivity] = useState<CheckinBroadcastPayload[]>([])
  const activitySeededRef = useRef(false)
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
        setActivity((prev) => [payload as CheckinBroadcastPayload, ...prev].slice(0, 6))
      })
      .subscribe()
    return () => {
      client.removeChannel(channel)
    }
  }, [eventId])

  const [session, setSession] = useState<ScannerSession | null>(null)
  useEffect(() => {
    readSession(eventId).then((loaded) => {
      if (!loaded || !loaded.attendantName) {
        router.replace({ pathname: '/event/[eventId]', params: { eventId } })
        return
      }
      sessionRef.current = loaded
      setSession(loaded)
    })
  }, [eventId, router])

  const [roster, setRoster] = useState<RosterRow[]>([])
  const refreshRoster = useCallback(() => {
    listRoster(eventId).then(setRoster)
  }, [eventId])
  useEffect(() => {
    refreshRoster()
  }, [refreshRoster, result])

  useEffect(() => {
    if (activitySeededRef.current || roster.length === 0) return
    const already = roster
      .filter((r) => r.checkedInAt)
      .sort((a, b) => (b.checkedInAt! > a.checkedInAt! ? 1 : -1))
      .slice(0, 6)
      .map((r) => ({
        status: 'success' as const,
        guestName: r.fullName,
        partySize: r.partySize,
        doorLabel: session?.doorLabel ?? '',
        at: r.checkedInAt!,
      }))
    if (already.length > 0) {
      activitySeededRef.current = true
      setActivity((prev) => (prev.length > 0 ? prev : already))
    }
  }, [roster, session])

  const admitted = roster.filter((r) => r.checkedInAt).length
  const capacityPct = roster.length > 0 ? Math.round((admitted / roster.length) * 100) : 0

  function handleBarcodeScanned(scan: BarcodeScanningResult) {
    const value = scan.data
    const last = lastScanRef.current
    if (last && last.value === value && Date.now() - last.at < RESCAN_COOLDOWN_MS) return
    lastScanRef.current = { value, at: Date.now() }
    submitScan(value)
  }

  const [query, setQuery] = useState('')
  const [reason, setReason] = useState('Lost phone')
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return roster.filter((r) => r.fullName.toLowerCase().includes(q)).slice(0, 5)
  }, [query, roster])

  const toneColor = {
    success: colors.greenDark,
    queued: colors.greenDark,
    duplicate: colors.amberDark,
    invalid: colors.rose,
    error: colors.rose,
  } as const

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-4" contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="mb-4 items-center">
        <Text className="text-[10px] tracking-wide text-purple uppercase">{session?.eventName}</Text>
        <Text className="mt-0.5 text-lg font-bold tracking-tight text-ink">{session?.doorLabel}</Text>
      </View>

      <View className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink">
        {permission?.granted ? (
          <CameraView
            style={{ flex: 1 }}
            facing={facing}
            enableTorch={torchOn}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
        ) : (
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-center text-sm text-white/70">
              {permission ? 'Camera access is required to scan entry passes.' : 'Checking camera permission…'}
            </Text>
            {permission && !permission.granted ? (
              <TouchableOpacity onPress={requestPermission} className="mt-4 rounded-xl bg-lavender px-5 py-2.5">
                <Text className="text-sm font-semibold text-ink">Grant camera access</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Scanning reticle */}
        <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
          <View className="h-44 w-44">
            <View className="absolute left-0 top-0 h-7 w-7 border-l-2 border-t-2 border-lavender" />
            <View className="absolute right-0 top-0 h-7 w-7 border-r-2 border-t-2 border-lavender" />
            <View className="absolute bottom-0 left-0 h-7 w-7 border-b-2 border-l-2 border-lavender" />
            <View className="absolute bottom-0 right-0 h-7 w-7 border-b-2 border-r-2 border-lavender" />
          </View>
        </View>

        <View className="absolute left-0 right-0 top-5 items-center px-6">
          <Text className="text-center text-[11px] font-medium tracking-wide text-white/90 uppercase">{t.alignQr}</Text>
        </View>

        {result ? (
          <View className="absolute inset-0 items-center justify-center gap-3 bg-white/95 px-6">
            {result.status === 'success' || result.status === 'queued' ? (
              <CheckCircle2 size={48} color={colors.greenDark} />
            ) : (
              <XCircle size={48} color={colors.rose} />
            )}
            <View className="items-center">
              <View className="flex-row items-center gap-2">
                <Text className="text-xl font-bold text-ink">
                  {result.guestName ?? (result.status === 'invalid' ? 'Not valid' : 'Error')}
                </Text>
                {result.isVip ? (
                  <Text className="rounded-full bg-amber-tint px-2 py-0.5 text-[9px] font-bold tracking-wide text-amber-dark uppercase">
                    VIP
                  </Text>
                ) : null}
              </View>
              {result.groupTag ? <Text className="mt-0.5 text-xs text-ink/50">{result.groupTag}</Text> : null}
              <Text className="mt-1 text-xs tracking-wide uppercase" style={{ color: toneColor[result.status] }}>
                {result.status === 'success' && t.accessGranted(result.partySize)}
                {result.status === 'queued' && t.accessGrantedOffline}
                {result.status === 'duplicate' && t.alreadyCheckedIn}
                {result.status === 'invalid' && (result.message || t.notValidPass)}
                {result.status === 'error' && (result.message || t.somethingWrong)}
              </Text>
            </View>
          </View>
        ) : null}

        <View className="absolute bottom-5 left-5 right-5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full bg-lavender" />
            <Text className="text-[10px] font-medium tracking-wide text-white/90 uppercase">{t.scannerActive}</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setTorchOn((v) => !v)}
              className="h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10"
            >
              {torchOn ? <Flashlight size={16} color="#fff" /> : <FlashlightOff size={16} color="#fff" />}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
              className="h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10"
            >
              <RotateCw size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {pendingCount > 0 ? (
        <Text className="mt-3 rounded-lg border border-amber-tint bg-amber-tint/40 px-4 py-2 text-center text-xs font-medium tracking-wide text-amber-dark uppercase">
          {t.pendingSync(pendingCount)}
        </Text>
      ) : null}

      <View className="mt-3 flex-row divide-x divide-black/5 overflow-hidden rounded-xl border border-black/10">
        <View className="flex-1 items-center bg-white py-3">
          <Text className="text-xl font-bold text-ink">{admitted}</Text>
          <Text className="mt-0.5 text-[9px] tracking-wide text-ink/60 uppercase">{t.admitted}</Text>
        </View>
        <View className="flex-1 items-center bg-white py-3">
          <Text className="text-xl font-bold text-ink">{roster.length}</Text>
          <Text className="mt-0.5 text-[9px] tracking-wide text-ink/60 uppercase">{t.expected}</Text>
        </View>
        <View className="flex-1 items-center bg-white py-3">
          <Text className="text-xl font-bold text-ink">{capacityPct}%</Text>
          <Text className="mt-0.5 text-[9px] tracking-wide text-ink/60 uppercase">{t.checkedIn}</Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between border-b border-black/5 pb-3">
        <Text className="text-base font-bold text-ink">{t.recentArrivals}</Text>
        <Text className="rounded-full bg-green-dark px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
          {t.live}
        </Text>
      </View>
      <View className="mt-3 max-h-40">
        {activity.length === 0 ? (
          <View className="items-center gap-2 py-6">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-lavender-tint">
              <Users size={18} color={colors.purple} />
            </View>
            <Text className="text-xs text-ink/60">{t.noArrivals}</Text>
          </View>
        ) : (
          activity.map((a, i) => (
            <View key={i} className="mb-2 flex-row items-center gap-3 rounded-xl border border-black/5 bg-white p-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-lavender-tint">
                <Text className="text-xs font-semibold text-purple">{initials(a.guestName)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-ink">{a.guestName}</Text>
                <Text className="text-[10px] tracking-wide text-ink/60 uppercase">{a.doorLabel}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View className="mt-2 border-t border-black/5 pt-4">
        <Text className="mb-2 text-[10px] tracking-wide text-ink/60 uppercase">{t.conciergeEntry}</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t.guestNamePlaceholder}
          placeholderTextColor="#6b7280"
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-ink"
        />
        {!query.trim() ? <Text className="mt-2 text-[11px] text-ink/50">{t.startTyping}</Text> : null}
        {query.trim() ? (
          <View className="mt-3 gap-2">
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder={t.reasonPlaceholder}
              placeholderTextColor="#6b7280"
              className="w-full rounded-lg border border-black/10 bg-black/[0.02] px-3 py-2 text-xs text-ink"
            />
            {matches.length === 0 ? (
              <Text className="py-3 text-center text-xs text-ink">{t.noMatch(query)}</Text>
            ) : (
              matches.map((entry) => (
                <View key={entry.key} className="flex-row items-center justify-between gap-3 rounded-lg border border-black/10 bg-white p-3">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-sm font-medium text-ink">{entry.fullName}</Text>
                      {entry.isVip ? (
                        <Text className="rounded bg-amber-tint px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-amber-dark uppercase">VIP</Text>
                      ) : null}
                    </View>
                    <Text className="text-[10px] tracking-wide text-ink/60 uppercase">
                      {entry.groupTag ? `${entry.groupTag} · ` : ''}
                      {t.partyOf(entry.partySize)}
                      {entry.checkedInAt ? t.checkedInSuffix : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    disabled={Boolean(entry.checkedInAt)}
                    onPress={() => {
                      submitScan(entry.qrToken, reason.trim() || 'Manual')
                      setQuery('')
                    }}
                    className="rounded-full border border-black/10 px-4 py-1.5 disabled:opacity-40"
                  >
                    <Text className="text-[10px] font-medium tracking-wide text-ink uppercase">
                      {entry.checkedInAt ? t.admittedPill : t.admit}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        ) : null}
      </View>
    </ScrollView>
  )
}

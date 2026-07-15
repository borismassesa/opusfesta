import * as SQLite from 'expo-sqlite'
import type { RosterEntry } from './api'

export type { RosterEntry }

/**
 * SQLite-backed offline store for one event's guest roster + a queue of
 * scans made while offline — port of apps/opus_scanner's lib/db.ts (which
 * used IndexedDB; expo-sqlite is the native equivalent). Lets a scan
 * resolve locally (marked "will sync") when the venue has no signal, then
 * flushes the queue to /api/checkin once the connection returns — the
 * server's atomic checkin_guest_invitation() RPC is still the source of
 * truth; the local mark is optimistic UI only.
 */

export interface PendingScan {
  id?: number
  eventId: string
  qrToken: string
  doorLabel: string
  attendantName: string
  scannedAt: string
  manualReason?: string
}

type RosterRow = RosterEntry & { key: string; eventId: string }

interface RosterTableRow {
  key: string
  eventId: string
  qrToken: string
  invitationId: string
  guestContactId: string
  fullName: string
  partySize: number
  checkedInAt: string | null
  groupTag: string | null
  isVip: number
}

function fromTableRow(row: RosterTableRow): RosterRow {
  return { ...row, isVip: Boolean(row.isVip) }
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('opus-scanner.db').then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS roster (
          key TEXT PRIMARY KEY NOT NULL,
          eventId TEXT NOT NULL,
          qrToken TEXT NOT NULL,
          invitationId TEXT NOT NULL,
          guestContactId TEXT NOT NULL,
          fullName TEXT NOT NULL,
          partySize INTEGER NOT NULL,
          checkedInAt TEXT,
          groupTag TEXT,
          isVip INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS pending_scans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          eventId TEXT NOT NULL,
          qrToken TEXT NOT NULL,
          doorLabel TEXT NOT NULL,
          attendantName TEXT NOT NULL,
          scannedAt TEXT NOT NULL,
          manualReason TEXT
        );
      `)
      return db
    })
  }
  return dbPromise
}

function rosterKey(eventId: string, qrToken: string) {
  return `${eventId}:${qrToken}`
}

/** Replace the cached roster for an event (called right after a fresh login). */
export async function saveRoster(eventId: string, roster: RosterEntry[]): Promise<void> {
  const db = await getDb()
  await db.withTransactionAsync(async () => {
    for (const entry of roster) {
      await db.runAsync(
        `INSERT OR REPLACE INTO roster
           (key, eventId, qrToken, invitationId, guestContactId, fullName, partySize, checkedInAt, groupTag, isVip)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rosterKey(eventId, entry.qrToken),
          eventId,
          entry.qrToken,
          entry.invitationId,
          entry.guestContactId,
          entry.fullName,
          entry.partySize,
          entry.checkedInAt,
          entry.groupTag,
          entry.isVip ? 1 : 0,
        ],
      )
    }
  })
}

/** Look up a scanned token against the cached roster. */
export async function lookupRoster(eventId: string, qrToken: string): Promise<RosterRow | undefined> {
  const db = await getDb()
  const row = await db.getFirstAsync<RosterTableRow>('SELECT * FROM roster WHERE key = ?', [rosterKey(eventId, qrToken)])
  return row ? fromTableRow(row) : undefined
}

/** Every cached roster entry for an event — used by the manual guest-search flow. */
export async function listRoster(eventId: string): Promise<RosterRow[]> {
  const db = await getDb()
  const rows = await db.getAllAsync<RosterTableRow>('SELECT * FROM roster WHERE eventId = ?', [eventId])
  return rows.map(fromTableRow)
}

/** Optimistically mark a cached roster entry as checked in (pending server sync). */
export async function markRosterCheckedInLocally(eventId: string, qrToken: string, when: string): Promise<void> {
  const db = await getDb()
  await db.runAsync('UPDATE roster SET checkedInAt = ? WHERE key = ?', [when, rosterKey(eventId, qrToken)])
}

export async function enqueuePendingScan(scan: Omit<PendingScan, 'id'>): Promise<void> {
  const db = await getDb()
  await db.runAsync(
    `INSERT INTO pending_scans (eventId, qrToken, doorLabel, attendantName, scannedAt, manualReason)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [scan.eventId, scan.qrToken, scan.doorLabel, scan.attendantName, scan.scannedAt, scan.manualReason ?? null],
  )
}

export async function listPendingScans(eventId: string): Promise<PendingScan[]> {
  const db = await getDb()
  const rows = await db.getAllAsync<PendingScan & { manualReason: string | null }>(
    'SELECT * FROM pending_scans WHERE eventId = ? ORDER BY id ASC',
    [eventId],
  )
  return rows.map((r) => ({ ...r, manualReason: r.manualReason ?? undefined }))
}

export async function removePendingScan(id: number): Promise<void> {
  const db = await getDb()
  await db.runAsync('DELETE FROM pending_scans WHERE id = ?', [id])
}

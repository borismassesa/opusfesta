'use client'

import type { RosterEntry } from '@/app/api/access/validate/route'
export type { RosterEntry }

/**
 * IndexedDB-backed offline store for one event's guest roster + a queue of
 * scans made while offline. Sprint 3: lets a scan resolve locally (and be
 * marked as "will sync") when the venue has no signal, then flushes the
 * queue to /api/checkin once the connection returns — the server's atomic
 * checkin_guest_invitation() RPC is still the source of truth; the local
 * mark is optimistic UI only.
 */

const DB_NAME = 'opus-scanner'
const DB_VERSION = 1
const ROSTER_STORE = 'roster'
const QUEUE_STORE = 'pendingSync'

export interface PendingScan {
  id?: number
  eventId: string
  qrToken: string
  doorLabel: string
  attendantName: string
  scannedAt: string
  manualReason?: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(ROSTER_STORE)) {
        db.createObjectStore(ROSTER_STORE, { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function rosterKey(eventId: string, qrToken: string) {
  return `${eventId}:${qrToken}`
}

/** Replace the cached roster for an event (called right after a fresh login). */
export async function saveRoster(eventId: string, roster: RosterEntry[]): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(ROSTER_STORE, 'readwrite')
  const store = tx.objectStore(ROSTER_STORE)
  for (const entry of roster) {
    store.put({ key: rosterKey(eventId, entry.qrToken), eventId, ...entry })
  }
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Look up a scanned token against the cached roster. */
export async function lookupRoster(
  eventId: string,
  qrToken: string,
): Promise<(RosterEntry & { key: string; eventId: string }) | undefined> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(ROSTER_STORE, 'readonly').objectStore(ROSTER_STORE).get(rosterKey(eventId, qrToken))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Every cached roster entry for an event — used by the manual guest-search flow. */
export async function listRoster(eventId: string): Promise<(RosterEntry & { key: string; eventId: string })[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(ROSTER_STORE, 'readonly').objectStore(ROSTER_STORE).getAll()
    req.onsuccess = () => resolve((req.result as (RosterEntry & { key: string; eventId: string })[]).filter((r) => r.eventId === eventId))
    req.onerror = () => reject(req.error)
  })
}

/** Optimistically mark a cached roster entry as checked in (pending server sync). */
export async function markRosterCheckedInLocally(eventId: string, qrToken: string, when: string): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(ROSTER_STORE, 'readwrite')
  const store = tx.objectStore(ROSTER_STORE)
  const key = rosterKey(eventId, qrToken)
  const existing = await new Promise<(RosterEntry & { key: string }) | undefined>((resolve, reject) => {
    const req = store.get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  if (existing) store.put({ ...existing, checkedInAt: when })
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function enqueuePendingScan(scan: Omit<PendingScan, 'id'>): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(QUEUE_STORE, 'readwrite')
  tx.objectStore(QUEUE_STORE).add(scan)
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function listPendingScans(eventId: string): Promise<PendingScan[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const req = db.transaction(QUEUE_STORE, 'readonly').objectStore(QUEUE_STORE).getAll()
    req.onsuccess = () => resolve((req.result as PendingScan[]).filter((s) => s.eventId === eventId))
    req.onerror = () => reject(req.error)
  })
}

export async function removePendingScan(id: number): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(QUEUE_STORE, 'readwrite')
  tx.objectStore(QUEUE_STORE).delete(id)
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

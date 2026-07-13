// OpusPass door scanner service worker.
//
// Sprint 2 scope: cache the app shell so the PWA installs and reloads
// offline. Sprint 3 adds the IndexedDB scan queue + background sync —
// this file will grow a 'sync' event handler and cache-then-network
// strategy for /api/checkin at that point.
const CACHE_NAME = 'opus-scanner-shell-v1'
const APP_SHELL = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

// Network-first for everything; API calls (/api/*) are never served from
// cache — a stale check-in response is worse than a failed fetch, which the
// client's offline queue (Sprint 3) will handle explicitly.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
        return response
      })
      .catch(() => caches.match(event.request)),
  )
})

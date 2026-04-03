// ─── Study Planner Service Worker ────────────────────────────────────────────
const CACHE_NAME = 'study-planner-v1'

// Assets to pre-cache on install
const PRECACHE_URLS = ['/', '/index.html', '/manifest.json']

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch — network-first, fallback to cache ─────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for same-origin or navigation
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('firestore.googleapis.com')) return
  if (event.request.url.includes('identitytoolkit.googleapis.com')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for the app shell
        if (response.ok && event.request.destination !== 'video') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
  )
})

// ── Push notifications ────────────────────────────────────────────────────────
// Receives push events sent from the app via postMessage or a push server
self.addEventListener('push', (event) => {
  let data = { title: '📚 Study Reminder', body: 'You have pending tasks!', tag: 'study-push' }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: data.tag,
      renotify: false,
      data: data.url || '/',
    })
  )
})

// ── Notification click — open/focus the app ───────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow('/')
    })
  )
})

// ── Message from app — trigger a local notification via SW ───────────────────
// This is the key for mobile: the app posts a message to the SW,
// which calls showNotification() — this works even when the app is backgrounded.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = event.data
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: tag || 'study-reminder',
      renotify: false,
    })
  }
})

/**
 * Registers the PWA service worker.
 * Required for background notifications on mobile and offline support.
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    console.log('[SW] Registered:', registration.scope)
    return registration
  } catch (err) {
    console.error('[SW] Registration failed:', err)
    return null
  }
}

/**
 * Show a notification via the active service worker.
 * Works on mobile even when the app is backgrounded or installed as a PWA.
 * Falls back gracefully if SW is not available.
 */
export async function showNotificationViaSW(title, body, tag) {
  if (!('serviceWorker' in navigator)) return false

  try {
    const registration = await navigator.serviceWorker.ready
    if (!registration) return false

    await registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: tag || 'study-reminder',
      renotify: false,
    })
    return true
  } catch {
    return false
  }
}

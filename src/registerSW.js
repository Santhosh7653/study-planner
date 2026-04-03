/**
 * Registers the service worker and returns a helper to send
 * notifications through it (required for mobile background notifications).
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
 * Send a notification via the active service worker.
 * This works on mobile even when the app is backgrounded/installed as PWA.
 */
export async function showNotificationViaSW(title, body, tag) {
  if (!('serviceWorker' in navigator)) return false

  const registration = await navigator.serviceWorker.ready
  if (!registration) return false

  // Use SW showNotification directly — works in background on Android
  try {
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

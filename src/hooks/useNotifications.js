import { useEffect, useRef } from 'react'
import { showNotificationViaSW } from '../registerSW'

const DAILY_KEY = (taskId) => `study-notif-daily-${taskId}`
const HOUR_KEY  = (taskId) => `study-notif-1h-${taskId}`
const CHECK_INTERVAL_MS = 60 * 1000 // every minute

// ── Permission ────────────────────────────────────────────────────────────────
async function requestPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// ── Send notification ─────────────────────────────────────────────────────────
// Prefers SW-based showNotification (works on mobile / background).
// Falls back to new Notification() for desktop browsers without SW.
async function sendNotification(title, body, tag) {
  // Try service worker path first (required for mobile PWA)
  const sentViaSW = await showNotificationViaSW(title, body, tag)
  if (sentViaSW) return

  // Fallback: direct Notification API (desktop)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      tag,
      renotify: false,
    })
  }
}

// ── Core check logic ──────────────────────────────────────────────────────────
async function checkAndNotify(tasks) {
  const now      = new Date()
  const todayStr = now.toDateString()

  for (const task of tasks) {
    if (task.completed || !task.deadline) continue

    const deadline        = new Date(task.deadline)
    const msUntilDeadline = deadline - now

    // ── Daily reminder ────────────────────────────────────────────
    const dailyKey     = DAILY_KEY(task.id)
    const lastDailyDate = localStorage.getItem(dailyKey)

    if (lastDailyDate !== todayStr && deadline >= new Date(todayStr)) {
      await sendNotification(
        '📚 Study Reminder',
        `Don't forget: "${task.title}" is due on ${deadline.toLocaleDateString(undefined, {
          weekday: 'short', month: 'short', day: 'numeric',
        })}`,
        `daily-${task.id}`
      )
      localStorage.setItem(dailyKey, todayStr)
    }

    // ── 1-hour-before reminder ────────────────────────────────────
    const hourKey          = HOUR_KEY(task.id)
    const alreadyNotified1h = localStorage.getItem(hourKey)

    if (!alreadyNotified1h && msUntilDeadline > 0 && msUntilDeadline <= 60 * 60 * 1000) {
      const minutesLeft = Math.round(msUntilDeadline / 60000)
      await sendNotification(
        '⏰ Due Very Soon!',
        `"${task.title}" is due in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}!`,
        `1h-${task.id}`
      )
      localStorage.setItem(hourKey, 'true')
    }
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useNotifications(tasks, enabled) {
  const tasksRef = useRef(tasks)
  useEffect(() => { tasksRef.current = tasks }, [tasks])

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const run = async () => {
      if (cancelled) return
      const granted = await requestPermission()
      if (!granted || cancelled) return
      await checkAndNotify(tasksRef.current)
    }

    const initTimer = setTimeout(run, 2000)
    const interval  = setInterval(run, CHECK_INTERVAL_MS)

    return () => {
      cancelled = true
      clearTimeout(initTimer)
      clearInterval(interval)
    }
  }, [enabled])
}

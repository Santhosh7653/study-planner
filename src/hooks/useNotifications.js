import { useEffect } from 'react'
import { isToday, isPast } from 'date-fns'

const NOTIF_KEY = 'study-planner-notif-date'

export function useNotifications(tasks, enabled) {
  useEffect(() => {
    if (!enabled || !tasks.length) return

    const today = new Date().toDateString()
    const lastShown = localStorage.getItem(NOTIF_KEY)
    if (lastShown === today) return // already shown today

    const requestAndNotify = async () => {
      if (!('Notification' in window)) return

      let permission = Notification.permission
      if (permission === 'default') {
        permission = await Notification.requestPermission()
      }
      if (permission !== 'granted') return

      const pending = tasks.filter((t) => !t.completed)
      const overdue = pending.filter(
        (t) => isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline))
      )
      const dueToday = pending.filter((t) => isToday(new Date(t.deadline)))

      if (overdue.length === 0 && dueToday.length === 0) return

      const parts = []
      if (dueToday.length) parts.push(`${dueToday.length} task${dueToday.length > 1 ? 's' : ''} due today`)
      if (overdue.length) parts.push(`${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`)

      new Notification('Study Reminder 📚', {
        body: parts.join(' · '),
        icon: '/favicon.ico',
        tag: 'study-reminder',
      })

      localStorage.setItem(NOTIF_KEY, today)
    }

    // slight delay so the page settles first
    const timer = setTimeout(requestAndNotify, 2000)
    return () => clearTimeout(timer)
  }, [enabled, tasks])
}

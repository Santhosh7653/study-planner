import { useEffect, useState } from 'react'
import { isToday, isPast, format } from 'date-fns'

export default function ReminderPopup({ tasks }) {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const todayTasks = tasks.filter(
    (t) => !t.completed && (isToday(new Date(t.deadline)) || isPast(new Date(t.deadline)))
  )

  useEffect(() => {
    if (todayTasks.length > 0 && !dismissed) {
      const timer = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [todayTasks.length, dismissed])

  // Daily reminder: re-show once per day
  useEffect(() => {
    const lastDismissed = localStorage.getItem('reminder-dismissed-date')
    const today = new Date().toDateString()
    if (lastDismissed === today) setDismissed(true)
  }, [])

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('reminder-dismissed-date', new Date().toDateString())
  }

  if (!show) return null

  const overdue = todayTasks.filter((t) => isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)))
  const dueToday = todayTasks.filter((t) => isToday(new Date(t.deadline)))

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-bounce-in">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⏰</span>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Daily Study Reminder</h2>
            <p className="text-sm text-gray-500">You have pending tasks to tackle today</p>
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto mb-5">
          {overdue.map((t) => (
            <div key={t.id} className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span className="text-red-500 text-xs font-bold uppercase">Overdue</span>
              <span className="text-sm text-gray-700 flex-1 truncate">{t.title}</span>
              <span className="text-xs text-gray-400">{format(new Date(t.deadline), 'MMM d')}</span>
            </div>
          ))}
          {dueToday.map((t) => (
            <div key={t.id} className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
              <span className="text-indigo-500 text-xs font-bold uppercase">Today</span>
              <span className="text-sm text-gray-700 flex-1 truncate">{t.title}</span>
              <span className="text-xs text-gray-400">{format(new Date(t.deadline), 'h:mm a')}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleDismiss}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
        >
          Got it, let's study! 📚
        </button>
      </div>
    </div>
  )
}

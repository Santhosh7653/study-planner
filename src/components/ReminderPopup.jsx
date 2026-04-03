import { useEffect, useState } from 'react'
import { isToday, isPast, format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReminderPopup({ tasks }) {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const todayTasks = tasks.filter(
    (t) => !t.completed && (isToday(new Date(t.deadline)) || isPast(new Date(t.deadline)))
  )

  useEffect(() => {
    const lastDismissed = localStorage.getItem('reminder-dismissed-date')
    if (lastDismissed === new Date().toDateString()) setDismissed(true)
  }, [])

  useEffect(() => {
    if (todayTasks.length > 0 && !dismissed) {
      const timer = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [todayTasks.length, dismissed])

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('reminder-dismissed-date', new Date().toDateString())
  }

  const overdue = todayTasks.filter((t) => isPast(new Date(t.deadline)) && !isToday(new Date(t.deadline)))
  const dueToday = todayTasks.filter((t) => isToday(new Date(t.deadline)))

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-2xl">⏰</div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Daily Study Reminder</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">You have pending tasks to tackle</p>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto mb-5">
              {overdue.map((t) => (
                <div key={t.id} className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                  <span className="text-red-500 text-xs font-bold uppercase shrink-0">Overdue</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{t.title}</span>
                  <span className="text-xs text-gray-400 shrink-0">{format(new Date(t.deadline), 'MMM d')}</span>
                </div>
              ))}
              {dueToday.map((t) => (
                <div key={t.id} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-2">
                  <span className="text-indigo-500 text-xs font-bold uppercase shrink-0">Today</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">{t.title}</span>
                  <span className="text-xs text-gray-400 shrink-0">{format(new Date(t.deadline), 'h:mm a')}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDismiss}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
            >
              Got it, let's study! 📚
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

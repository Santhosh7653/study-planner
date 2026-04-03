import { motion } from 'framer-motion'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'

export default function CalendarConnect({ userId }) {
  const { connected, connecting, error, connect } = useGoogleCalendar(userId)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center gap-3 mb-3">
        {/* Google Calendar icon */}
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-lg shrink-0">
          📅
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Google Calendar</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {connected ? 'Tasks sync to your calendar automatically' : 'Sync tasks and get calendar reminders'}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-3 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {connected ? (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Connected
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={connect}
          disabled={connecting}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60 shadow-sm"
        >
          {connecting ? (
            <span className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.82 8.49l-1.64 7.71c-.12.54-.45.67-.91.42l-2.52-1.86-1.22 1.17c-.13.13-.25.25-.51.25l.18-2.57 4.67-4.22c.2-.18-.04-.28-.32-.1L7.1 14.28 4.62 13.5c-.54-.17-.55-.54.11-.8l11.38-4.39c.45-.16.84.11.71.18z"/>
            </svg>
          )}
          {connecting ? 'Connecting...' : 'Connect Google Calendar'}
        </motion.button>
      )}
    </div>
  )
}

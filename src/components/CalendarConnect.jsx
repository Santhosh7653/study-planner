import { motion } from 'framer-motion'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function CalendarConnect({ userId }) {
  const { connected, connecting, error, connect, disconnect } = useGoogleCalendar(userId)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-lg shrink-0">
            📅
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Google Calendar</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {connected
                ? 'Tasks sync to your calendar automatically'
                : 'Connect to sync tasks with Google Calendar'}
            </p>
          </div>
        </div>

        {/* Action button */}
        {connected ? (
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Connected
            </div>
            <button
              onClick={disconnect}
              className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors underline"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={connect}
            disabled={connecting}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-60 shadow-sm"
          >
            {connecting ? (
              <span className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {connecting ? 'Connecting...' : 'Connect'}
          </motion.button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-3 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  )
}

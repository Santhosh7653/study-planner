// ── Shared primitives used across all forgot-password steps ──────────────────

import { motion } from 'framer-motion'

export const inputCls =
  'w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm ' +
  'bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 ' +
  'focus:ring-indigo-500 transition'

export function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-3xl mb-4">
            📚
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Planner</h1>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

export function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <motion.div
      key={message}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-3 mb-4"
    >
      {message}
    </motion.div>
  )
}

export function SubmitButton({ loading, label, loadingLabel }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-indigo-200 dark:shadow-none"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          {loadingLabel}
        </span>
      ) : label}
    </motion.button>
  )
}

export function BackButton({ onClick, label = '← Back to Sign In' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
    >
      {label}
    </button>
  )
}

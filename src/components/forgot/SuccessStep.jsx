/**
 * Step 4 — SuccessStep
 * Shown after password is successfully reset.
 * Auto-redirects to sign-in after 5 seconds.
 */
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PageShell } from './shared'

export default function SuccessStep({ onBack }) {
  const [countdown, setCountdown] = useState(5)

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown <= 0) { onBack(); return }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, onBack])

  return (
    <PageShell>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="text-center py-4"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 18 }}
          className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-4xl mx-auto mb-5"
        >
          ✅
        </motion.div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          Password Reset!
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Your password has been updated successfully. You can now sign in with your new password.
        </p>

        {/* Auto-redirect indicator */}
        <p className="text-xs text-gray-400 mb-4">
          Redirecting to sign in in {countdown}s…
        </p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onBack}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-indigo-200 dark:shadow-none"
        >
          Sign In Now
        </motion.button>
      </motion.div>
    </PageShell>
  )
}

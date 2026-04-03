import { useState } from 'react'
import { motion } from 'framer-motion'

export default function SignupPage({ onSignup, onGoLogin }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const result = await onSignup({ username: form.username, email: form.email, password: form.password })
    if (result?.error) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-3xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Planner</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create your account to get started.</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Create Account</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-3 mb-5"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'username', label: 'Username', type: 'text', placeholder: 'johndoe', minLength: 3 },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters' },
              { name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{f.label}</label>
                <input
                  type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                  placeholder={f.placeholder} required minLength={f.minLength}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            ))}

            <motion.button
              type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-indigo-200 dark:shadow-none mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <button onClick={onGoLogin} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'

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

const features = [
  { icon: '📅', title: 'Smart Scheduling', desc: 'Organize tasks by priority and deadline' },
  { icon: '🔔', title: 'Email Reminders', desc: 'Never miss a deadline with timely alerts' },
  { icon: '📊', title: 'Progress Tracking', desc: 'Visualize your study progress at a glance' },
  { icon: '🗓️', title: 'Calendar Sync', desc: 'Integrate with Google Calendar seamlessly' },
]

export default function LoginPage({ onLogin, onGoogleLogin, onGoSignup }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await onLogin(form)
    if (result?.error) setError(result.error)
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)
    const result = await onGoogleLogin()
    if (result?.error) setError(result.error)
    setGoogleLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl shadow-lg">📚</div>
            <span className="text-white font-bold text-lg tracking-tight">Study Planner</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Plan smarter,<br />
            <span className="text-indigo-200">study better.</span>
          </h2>
          <p className="text-indigo-200 text-base leading-relaxed max-w-xs">
            Your all-in-one study companion that keeps you organized, focused, and on track.
          </p>
        </div>

        <div className="relative space-y-4">
          {features.map((f) => (
            <div key={f.title} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3.5">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{f.title}</p>
                <p className="text-indigo-200 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-950 p-6 sm:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl text-2xl mb-3 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">📚</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Planner</h1>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sign in to continue to your dashboard</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-xl px-4 py-3 mb-5"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </motion.div>
            )}

            {/* Google Sign-In first (most prominent) */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md disabled:opacity-60"
            >
              {googleLoading
                ? <span className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                : <GoogleIcon />
              }
              {googleLoading ? 'Signing in...' : 'Continue with Google'}
            </motion.button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or sign in with email</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input
                  id="login-email"
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" required
                  autoComplete="email"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                </div>
                <input
                  id="login-password"
                  type="password" name="password" value={form.password} onChange={handleChange}
                  placeholder="••••••••" required
                  autoComplete="current-password"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <motion.button
                type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/50 mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </motion.button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Don't have an account?{' '}
              <button onClick={onGoSignup} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold transition-colors">
                Create one free
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'

const steps = [
  { icon: '📚', label: 'Organize your study tasks' },
  { icon: '⏰', label: 'Get deadline reminders via email' },
  { icon: '📈', label: 'Track your daily progress' },
]

function PasswordStrength({ password }) {
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3

  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : 'bg-gray-200 dark:bg-gray-700'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
        {labels[strength]}
      </p>
    </div>
  )
}

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

  const fields = [
    { name: 'username', label: 'Username', type: 'text', placeholder: 'johndoe', autoComplete: 'username' },
    { name: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 6 characters', autoComplete: 'new-password' },
    { name: 'confirm', label: 'Confirm password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative text-center max-w-sm">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl">📚</div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Start your study<br />
            <span className="text-indigo-200">journey today.</span>
          </h2>
          <p className="text-indigo-200 text-base mb-10 leading-relaxed">
            Join students who stay organized, hit their goals, and study smarter every day.
          </p>

          <div className="space-y-3 text-left">
            {steps.map((s) => (
              <div key={s.label} className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-3">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-white text-sm font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-950 p-6 sm:p-12 overflow-y-auto">
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Free forever. No credit card needed.</p>
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

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              {fields.map((f) => (
                <div key={f.name}>
                  <label htmlFor={`signup-${f.name}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
                  <input
                    id={`signup-${f.name}`}
                    type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                    placeholder={f.placeholder} required minLength={f.name === 'username' ? 3 : undefined}
                    autoComplete={f.autoComplete}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  {f.name === 'password' && <PasswordStrength password={form.password} />}
                </div>
              ))}

              <motion.button
                type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 hover:shadow-lg mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : 'Create Free Account'}
              </motion.button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Already have an account?{' '}
              <button onClick={onGoLogin} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold transition-colors">
                Sign in
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

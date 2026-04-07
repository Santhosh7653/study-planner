import { useState } from 'react'
import { motion } from 'framer-motion'
import ForgotPassword from './ForgotPassword'
import { GoogleLogin } from '@react-oauth/google'
import { getAuth } from 'firebase/auth'

export default function LoginPage({ onLogin, onGoSignup }) {
const [form, setForm] = useState({ email: '', password: '' })
const [error, setError] = useState('')
const [loading, setLoading] = useState(false)
const [showForgot, setShowForgot] = useState(false)

const auth = getAuth()

const handleChange = (e) => {
setForm({ ...form, [e.target.name]: e.target.value })
}

const handleSubmit = async (e) => {
e.preventDefault()
setError('')
setLoading(true)

```
const result = await onLogin(form)

if (result?.error) {
  setError(result.error)
} else {
  const currentUser = auth.currentUser
  if (currentUser) {
    console.log('Logged-in user UID:', currentUser.uid)
  }
}

setLoading(false)
```

}

if (showForgot) {
return <ForgotPassword onBack={() => setShowForgot(false)} />
}

return ( <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
<motion.div
className="w-full max-w-md"
initial={{ opacity: 0, y: 24 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4 }}
> <div className="text-center mb-8"> <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-3xl mb-4">📚</div> <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Planner</h1> <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
Welcome back! Sign in to continue. </p> </div>

```
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
        Sign In
      </h2>

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
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          <div className="text-right mt-1">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-indigo-200 dark:shadow-none mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </motion.button>
      </form>

      {/* Google Login */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Or sign in with Google
        </p>

        <GoogleLogin
          onSuccess={(credentialResponse) => {
            console.log('Google login success', credentialResponse)

            fetch(`${import.meta.env.VITE_FUNCTIONS_URL}/save-google-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                credential: credentialResponse.credential
              })
            })
          }}
          onError={() => {
            console.log('Google login failed')
          }}
        />
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Don't have an account?{' '}
        <button
          onClick={onGoSignup}
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          Sign up
        </button>
      </p>
    </div>
  </motion.div>
</div>


)
}

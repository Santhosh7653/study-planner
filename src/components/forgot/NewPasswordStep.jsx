/**
 * Step 3 — NewPasswordStep
 * User sets a new password. Calls POST /api/resetPassword with
 * { email, otp, newPassword } — the server does the final OTP
 * verification and updates Firebase Auth via Admin SDK.
 */
import { useState } from 'react'
import { PageShell, ErrorBanner, SubmitButton, inputCls } from './shared'

export default function NewPasswordStep({ email, otp, onSuccess }) {
  const [form, setForm]     = useState({ newPassword: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [showPw, setShowPw] = useState(false)

  // Password strength indicator
  const strength = (() => {
    const p = form.newPassword
    if (!p)          return null
    if (p.length < 6) return { label: 'Too short', color: 'bg-red-400', width: '25%' }
    if (p.length < 8) return { label: 'Weak',      color: 'bg-orange-400', width: '50%' }
    if (!/[A-Z]/.test(p) || !/\d/.test(p)) return { label: 'Fair', color: 'bg-yellow-400', width: '75%' }
    return { label: 'Strong', color: 'bg-green-500', width: '100%' }
  })()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.newPassword.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.newPassword !== form.confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const res  = await fetch('/api/resetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword: form.newPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to reset password. Please try again.')
        return
      }

      onSuccess()
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">New Password</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Choose a strong password for your account.
      </p>

      <ErrorBanner message={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New password */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Min. 6 characters"
              required
              autoFocus
              className={inputCls + ' pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Strength bar */}
          {strength && (
            <div className="mt-2">
              <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: strength.width }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{strength.label}</p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Confirm Password
          </label>
          <input
            type={showPw ? 'text' : 'password'}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="••••••••"
            required
            className={[
              inputCls,
              form.confirm && form.confirm !== form.newPassword
                ? 'border-red-400 focus:ring-red-300'
                : '',
            ].join(' ')}
          />
          {form.confirm && form.confirm !== form.newPassword && (
            <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
          )}
        </div>

        <SubmitButton loading={loading} label="Reset Password" loadingLabel="Resetting..." />
      </form>
    </PageShell>
  )
}

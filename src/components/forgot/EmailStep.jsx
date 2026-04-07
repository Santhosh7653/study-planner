/**
 * Step 1 — EmailStep
 * User enters their email. Calls POST /api/sendOtp.
 * Does NOT reveal whether the email exists (prevents enumeration).
 */
import { useState } from 'react'
import { PageShell, ErrorBanner, SubmitButton, BackButton, inputCls } from './shared'

export default function EmailStep({ onSuccess, onBack }) {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res  = await fetch('/api/sendOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send code. Please try again.')
        return
      }

      // Pass email up so subsequent steps can use it
      onSuccess(email)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Reset Password</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Enter your registered email and we'll send you a 6-digit verification code.
      </p>

      <ErrorBanner message={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
            className={inputCls}
          />
        </div>
        <SubmitButton loading={loading} label="Send Code" loadingLabel="Sending..." />
      </form>

      <BackButton onClick={onBack} />
    </PageShell>
  )
}

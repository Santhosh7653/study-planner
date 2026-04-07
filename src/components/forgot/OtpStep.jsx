/**
 * Step 2 — OtpStep
 * 6-box OTP entry with:
 *  - Auto-advance on digit entry
 *  - Backspace goes to previous box
 *  - Paste support for full 6-digit code
 *  - 10-minute countdown timer (matches server-side TTL)
 *  - Attempt counter — locks input after 5 wrong guesses
 *  - 60-second resend cooldown
 */
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageShell, ErrorBanner, SubmitButton, BackButton } from './shared'

const OTP_EXPIRY_SECONDS = 10 * 60  // must match _otpStore.js OTP_TTL_MS
const MAX_ATTEMPTS       = 5
const RESEND_COOLDOWN    = 60

export default function OtpStep({ email, onSuccess, onBack, onResend }) {
  const [digits, setDigits]         = useState(Array(6).fill(''))
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [attemptsLeft, setAttempts] = useState(MAX_ATTEMPTS)
  const [locked, setLocked]         = useState(false)

  // Countdown timers
  const [expiryLeft, setExpiryLeft]   = useState(OTP_EXPIRY_SECONDS)
  const [resendLeft, setResendLeft]   = useState(RESEND_COOLDOWN)

  const inputRefs = useRef([])

  // ── Expiry countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    if (expiryLeft <= 0) return
    const t = setTimeout(() => setExpiryLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [expiryLeft])

  // ── Resend cooldown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (resendLeft <= 0) return
    const t = setTimeout(() => setResendLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendLeft])

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  // ── Digit input handlers ──────────────────────────────────────────────────
  const handleChange = (index, value) => {
    if (locked) return
    const digit = value.replace(/\D/g, '').slice(-1)
    const next  = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (locked) return
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    if (locked) return
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (locked) return

    const code = digits.join('')
    if (code.length < 6) { setError('Please enter all 6 digits.'); return }
    if (expiryLeft <= 0) { setError('Code has expired. Please request a new one.'); return }

    setError('')
    setLoading(true)

    try {
      // We do a lightweight pre-check by calling resetPassword with a dummy password.
      // The real verification happens there — we just want to know if the OTP is valid
      // before asking for a new password. We pass a sentinel to distinguish.
      const res  = await fetch('/api/verifyOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      })
      const data = await res.json()

      if (!res.ok) {
        const remaining = attemptsLeft - 1
        setAttempts(remaining)
        if (remaining <= 0) {
          setLocked(true)
          setError('Too many incorrect attempts. Please request a new code.')
        } else {
          setError(data.error || `Incorrect code. ${remaining} attempt(s) remaining.`)
        }
        // Clear digits on wrong attempt
        setDigits(Array(6).fill(''))
        inputRefs.current[0]?.focus()
        return
      }

      // OTP verified — pass code up so NewPasswordStep can include it in the reset call
      onSuccess(code)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // ── Resend ────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendLeft > 0) return
    setError('')
    setDigits(Array(6).fill(''))
    setAttempts(MAX_ATTEMPTS)
    setLocked(false)
    setExpiryLeft(OTP_EXPIRY_SECONDS)
    setResendLeft(RESEND_COOLDOWN)
    inputRefs.current[0]?.focus()
    await onResend()
  }

  // ── Expiry colour ─────────────────────────────────────────────────────────
  const timerColor =
    expiryLeft > 120 ? 'text-gray-400' :
    expiryLeft > 30  ? 'text-orange-500' :
                       'text-red-500 font-semibold'

  return (
    <PageShell>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Enter Code</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
        We sent a 6-digit code to{' '}
        <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>.
      </p>

      {/* Expiry timer */}
      <p className={`text-xs mb-5 ${timerColor}`}>
        {expiryLeft > 0
          ? `Code expires in ${formatTime(expiryLeft)}`
          : 'Code has expired — please request a new one.'}
      </p>

      <ErrorBanner message={error} />

      {/* Attempt indicator */}
      {attemptsLeft < MAX_ATTEMPTS && !locked && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-orange-500 mb-3"
        >
          {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
        </motion.p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6 digit boxes */}
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={locked || expiryLeft <= 0}
              autoFocus={i === 0}
              className={[
                'text-center text-xl font-bold border-2 rounded-xl transition',
                'bg-white dark:bg-gray-800 dark:text-white',
                'focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900',
                locked || expiryLeft <= 0
                  ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                  : d
                  ? 'border-indigo-500'
                  : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500',
              ].join(' ')}
              style={{ width: '44px', height: '52px' }}
            />
          ))}
        </div>

        <SubmitButton
          loading={loading}
          label={locked ? 'Locked' : 'Verify Code'}
          loadingLabel="Verifying..."
        />
      </form>

      {/* Resend */}
      <div className="text-center mt-4">
        {resendLeft > 0 ? (
          <p className="text-xs text-gray-400">Resend available in {resendLeft}s</p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Resend code
          </button>
        )}
      </div>

      <BackButton onClick={onBack} label="← Change email" />
    </PageShell>
  )
}

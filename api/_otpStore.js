/**
 * In-memory OTP store for Vercel serverless functions.
 * Each entry: { otp, expiresAt, attempts }
 * Keyed by email (lowercased).
 *
 * Note: Vercel functions can run on multiple instances in production,
 * so this works reliably for low-traffic apps. For high-traffic apps,
 * replace with Redis or Firestore.
 */
const store = {}

const OTP_TTL_MS    = 10 * 60 * 1000  // 10 minutes
const MAX_ATTEMPTS  = 5                // lock out after 5 wrong guesses

export function saveOtp(email, otp) {
  store[email.toLowerCase()] = {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  }
}

/**
 * peekOtp — validates the OTP but does NOT delete it.
 * Used by /api/verifyOtp so the UI can confirm the code
 * before the user sets a new password.
 * Attempts are still tracked to prevent brute-force.
 */
export function peekOtp(email, inputOtp) {
  const key    = email.toLowerCase()
  const record = store[key]

  if (!record)                        return { valid: false, reason: 'No OTP found for this email. Please request a new one.' }
  if (Date.now() > record.expiresAt)  { delete store[key]; return { valid: false, reason: 'OTP has expired. Please request a new one.' } }
  if (record.attempts >= MAX_ATTEMPTS){ delete store[key]; return { valid: false, reason: 'Too many incorrect attempts. Please request a new OTP.' } }

  record.attempts++
  if (record.otp !== inputOtp) return { valid: false, reason: `Incorrect OTP. ${MAX_ATTEMPTS - record.attempts} attempt(s) remaining.` }

  // Valid — do NOT delete, resetPassword will consume it
  return { valid: true }
}

/**
 * verifyOtp — validates AND deletes the OTP (one-time use).
 * Used by /api/resetPassword as the final authoritative check.
 */
export function verifyOtp(email, inputOtp) {
  const key    = email.toLowerCase()
  const record = store[key]

  if (!record)                        return { valid: false, reason: 'No OTP found for this email. Please request a new one.' }
  if (Date.now() > record.expiresAt)  { delete store[key]; return { valid: false, reason: 'OTP has expired. Please request a new one.' } }
  if (record.attempts >= MAX_ATTEMPTS){ delete store[key]; return { valid: false, reason: 'Too many incorrect attempts. Please request a new OTP.' } }

  if (record.otp !== inputOtp) {
    record.attempts++
    return { valid: false, reason: `Incorrect OTP. ${MAX_ATTEMPTS - record.attempts} attempt(s) remaining.` }
  }

  // Valid — remove immediately so it can't be reused
  delete store[key]
  return { valid: true }
}

import { peekOtp } from './_otpStore.js'

/**
 * POST /api/verifyOtp
 * Body: { email, otp }
 *
 * Checks whether the OTP is correct WITHOUT consuming it.
 * This lets the UI confirm the code before asking for a new password.
 * The OTP is only deleted when /api/resetPassword is called.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, otp } = req.body
  if (!email || !otp) return res.status(400).json({ error: 'email and otp are required.' })

  const { valid, reason } = peekOtp(email, otp)
  if (!valid) return res.status(400).json({ error: reason })

  return res.status(200).json({ success: true })
}

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { verifyOtp } from './_otpStore.js'

/**
 * POST /api/resetPassword
 * Body: { email, otp, newPassword }
 *
 * Verifies the OTP and uses Firebase Admin SDK to update the user's password.
 * The Admin SDK can update any user's password without needing their current one.
 */

function initAdmin() {
  if (getApps().length > 0) return  // already initialized

  // Firebase Admin credentials — set these in Vercel environment variables
  // FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel stores multiline values with literal \n — replace them
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, otp, newPassword } = req.body

  // Input validation
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'email, otp, and newPassword are all required.' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })
  }
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ error: 'OTP must be a 6-digit number.' })
  }

  // Verify OTP — this also deletes it so it can't be reused
  const { valid, reason } = verifyOtp(email, otp)
  if (!valid) return res.status(400).json({ error: reason })

  // Update password via Firebase Admin
  try {
    initAdmin()
    const adminAuth = getAuth()

    // Look up the user by email
    const userRecord = await adminAuth.getUserByEmail(email)

    // Update their password
    await adminAuth.updateUser(userRecord.uid, { password: newPassword })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[resetPassword] Firebase Admin error:', err.code, err.message)

    if (err.code === 'auth/user-not-found') {
      // Return generic message to prevent user enumeration
      return res.status(200).json({ success: true })
    }

    return res.status(500).json({ error: 'Failed to reset password. Please try again.' })
  }
}

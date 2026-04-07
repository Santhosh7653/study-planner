import nodemailer from 'nodemailer'
import { saveOtp } from './_otpStore.js'

/**
 * POST /api/sendOtp
 * Body: { email }
 *
 * Generates a cryptographically random 6-digit OTP,
 * stores it with a 10-minute expiry, and emails it to the user.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' })
  }

  // Generate a secure 6-digit OTP using crypto (not Math.random)
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  const otp = String(array[0] % 1_000_000).padStart(6, '0')

  // Store OTP with expiry
  saveOtp(email, otp)

  // Send email via Gmail
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_PASS

  if (!gmailUser || !gmailPass) {
    console.error('[sendOtp] GMAIL_USER or GMAIL_PASS env vars are missing')
    return res.status(500).json({ error: 'Email service is not configured.' })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  })

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f5f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:480px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,0.1);">
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;">
          <div style="font-size:28px;margin-bottom:8px;">📚</div>
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Study Planner</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Password Reset</p>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 16px;color:#374151;font-size:15px;">
            Use the code below to reset your password. It expires in <strong>10 minutes</strong>.
          </p>
          <div style="background:#f5f3ff;border:2px dashed #c4b5fd;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
            <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#4f46e5;">${otp}</span>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:12px;">
            If you didn't request this, you can safely ignore this email.
            Never share this code with anyone.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    await transporter.sendMail({
      from: `"Study Planner 📚" <${gmailUser}>`,
      to: email,
      subject: `${otp} is your Study Planner reset code`,
      html,
    })
    // Don't confirm whether the email exists — prevents user enumeration
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[sendOtp] email send failed:', err.message)
    return res.status(500).json({ error: 'Failed to send email. Please try again.' })
  }
}

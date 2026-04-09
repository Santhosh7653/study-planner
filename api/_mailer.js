/**
 * Shared Nodemailer transporter.
 * Uses Gmail + App Password stored in environment variables.
 * Never import GMAIL_USER / GMAIL_PASS anywhere else — keep them here only.
 */
import nodemailer from 'nodemailer'

export function createTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_PASS

  if (!user || !pass) {
    throw new Error('GMAIL_USER or GMAIL_PASS environment variable is not set.')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

// ── Priority helpers ──────────────────────────────────────────────────────────
const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
const PRIORITY_LABEL = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' }

export function priorityColor(p) { return PRIORITY_COLOR[p] || '#6366f1' }
export function priorityLabel(p) { return PRIORITY_LABEL[p] || p }

// ── Date formatter ────────────────────────────────────────────────────────────
export function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

// ── Base HTML wrapper ─────────────────────────────────────────────────────────
export function htmlWrap(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">📚 Study Planner</p>
            <p style="margin:6px 0 0;font-size:13px;color:#c7d2fe;">${title}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:28px 32px;">${bodyHtml}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              Study Planner · You're receiving this because you have an active account.<br/>
              <a href="https://study-planner-gold-delta.vercel.app" style="color:#6366f1;text-decoration:none;">Open App</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Single task card HTML ─────────────────────────────────────────────────────
export function taskCardHtml(task) {
  const color = priorityColor(task.priority)
  return `
  <div style="border:1px solid #e5e7eb;border-left:4px solid ${color};border-radius:12px;padding:16px 20px;margin-bottom:12px;">
    <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111827;">${task.title}</p>
    <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">
      📅 <strong>Deadline:</strong> ${fmtDate(task.deadline)}
    </p>
    <p style="margin:0;font-size:13px;">
      <span style="display:inline-block;background:${color}22;color:${color};font-weight:600;padding:2px 10px;border-radius:999px;font-size:12px;">
        ${priorityLabel(task.priority)}
      </span>
    </p>
    ${task.notes ? `<p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">${task.notes}</p>` : ''}
  </div>`
}

/**
 * Send an email, failing gracefully.
 * Returns true on success, false on failure (never throws).
 */
export async function sendMail({ to, subject, html }) {
  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"Study Planner" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    })
    console.log(`[mailer] Sent "${subject}" → ${to}`)
    return true
  } catch (err) {
    console.error('[mailer] Failed to send email:', err.message)
    return false
  }
}

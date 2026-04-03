const nodemailer = require('nodemailer')
const { defineString } = require('firebase-functions/params')

// Set these with: firebase functions:secrets:set GMAIL_USER etc.
// Or use firebase functions:config:set for v1 config
const GMAIL_USER = defineString('GMAIL_USER')
const GMAIL_PASS = defineString('GMAIL_PASS')
const APP_URL    = defineString('APP_URL', { default: 'https://your-app.vercel.app' })

function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER.value(),
      pass: GMAIL_PASS.value(), // use a Gmail App Password, not your real password
    },
  })
}

/**
 * Send a task reminder email.
 * @param {string} toEmail
 * @param {string} toName
 * @param {{ title: string, deadline: string, priority: string, notes?: string }} task
 * @param {'daily'|'1hour'} type
 */
async function sendReminderEmail(toEmail, toName, task, type) {
  const transporter = createTransport()
  const deadlineDate = new Date(task.deadline)
  const formattedDate = deadlineDate.toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const isUrgent = type === '1hour'
  const subject = isUrgent
    ? `⏰ Due in 1 hour: ${task.title}`
    : `📚 Study Reminder: ${task.title} is due today`

  const priorityEmoji = { high: '🔴', medium: '🟡', low: '🟢' }[task.priority] || '📌'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0;padding:0;background:#f5f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,0.1);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;">
          <div style="font-size:28px;margin-bottom:8px;">📚</div>
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Study Planner</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
            ${isUrgent ? '⚡ Urgent Reminder' : '📅 Daily Reminder'}
          </p>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">
          <p style="margin:0 0 20px;color:#374151;font-size:15px;">
            Hi <strong>${toName}</strong>, ${isUrgent
              ? "your task is due <strong>in about 1 hour</strong>!"
              : "here's your daily study reminder."}
          </p>

          <!-- Task card -->
          <div style="background:#f5f3ff;border:1px solid #e0e7ff;border-left:4px solid #4f46e5;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <h2 style="margin:0 0 10px;color:#1e1b4b;font-size:16px;font-weight:700;">${task.title}</h2>
            <p style="margin:0 0 6px;color:#6b7280;font-size:13px;">
              📅 <strong>Due:</strong> ${formattedDate}
            </p>
            <p style="margin:0 0 6px;color:#6b7280;font-size:13px;">
              ${priorityEmoji} <strong>Priority:</strong> ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </p>
            ${task.notes ? `<p style="margin:8px 0 0;color:#9ca3af;font-size:12px;font-style:italic;">${task.notes}</p>` : ''}
          </div>

          <a href="${APP_URL.value()}"
             style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;">
            Open Study Planner →
          </a>
        </div>

        <!-- Footer -->
        <div style="padding:16px 32px;border-top:1px solid #f3f4f6;background:#fafafa;">
          <p style="margin:0;color:#9ca3af;font-size:11px;">
            You're receiving this because you have an account on Study Planner.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"Study Planner 📚" <${GMAIL_USER.value()}>`,
    to: toEmail,
    subject,
    html,
  })
}

module.exports = { sendReminderEmail }

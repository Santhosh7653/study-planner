import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
import nodemailer from 'nodemailer'

const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }
const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }

// ──────────────────────────────────────────────────────────────────────────────
// EMAIL CONFIGURATION VALIDATION
// ──────────────────────────────────────────────────────────────────────────────

const EMAIL_USER = process.env.EMAIL_USER || process.env.GMAIL_USER
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.GMAIL_PASS
const SMTP_FROM = process.env.SMTP_FROM || EMAIL_USER
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || EMAIL_USER

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn('⚠️ EMAIL_USER/GMAIL_USER or EMAIL_PASS/GMAIL_PASS missing — emails will be skipped.')
}

const transporter = EMAIL_USER && EMAIL_PASS
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    })
  : null

if (transporter) {
  transporter.verify((err) => {
    if (err) {
      console.error('❌ Email transporter error:', err.message)
    } else {
      console.log('📧 Email service ready ✅')
    }
  })
}

export function fmtDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function priorityLabel(priority) {
  return PRIORITY_LABEL[priority] || String(priority || 'Normal')
}

export function taskCardHtml({ title, subject = '', priority, dueDate, notes }) {
  const color = PRIORITY_COLOR[priority] || '#6366f1'
  return `
    <div style="border:1px solid #e5e7eb;border-left:4px solid ${color};border-radius:12px;padding:16px 20px;margin-bottom:12px;">
      <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111827;">${title}</p>
      ${subject ? `<p style="margin:0 0 4px;font-size:12px;color:#6b7280;">📚 Subject: <strong>${subject}</strong></p>` : ''}
      <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">
        📅 <strong>Due:</strong> ${fmtDate(dueDate)}
      </p>
      <p style="margin:0;font-size:13px;">
        <span style="display:inline-block;background:${color}22;color:${color};font-weight:600;padding:2px 10px;border-radius:999px;font-size:12px;">
          ${priorityLabel(priority)}
        </span>
      </p>
      ${notes ? `<p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">${notes}</p>` : ''}
    </div>`
}

export function htmlWrap(title, bodyHtml) {
  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f3f4f6;padding:20px;">
  <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:10px;">
    <h2>📚 Study Planner</h2>
    <h3>${title}</h3>
    ${bodyHtml}
    <p style="font-size:12px;color:#999;">Sent by Study Planner</p>
  </div>
</body>
</html>`
}

export async function sendMail({ to, subject, html }) {
  if (!transporter) {
    console.warn('📧 Email skipped: transporter not configured.')
    return { success: false, reason: 'not_configured' }
  }

  const recipient = to || RECIPIENT_EMAIL

  try {
    await transporter.sendMail({
      from: `"Study Planner" <${SMTP_FROM}>`,
      to: recipient,
      subject,
      html,
    })

    console.log('📧 Email sent:', subject, '→', recipient)
    return { success: true }
  } catch (err) {
    console.error('❌ Email failed:', err.message)
    return { success: false, reason: err.message }
  }
}

export async function sendEmail({ subject, html, to }) {
  return sendMail({ to, subject, html })
}

export function buildTaskCreatedEmail(task) {
  return {
    subject: `📚 New Task Added: ${task.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
        <h2 style="color:#1a1a2e">📚 New Task Added</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Title</td><td style="padding:8px">${task.title}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Priority</td><td style="padding:8px">${task.priority}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Due Date</td><td style="padding:8px">${task.deadline}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Notes</td><td style="padding:8px">${task.notes || 'None'}</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:24px">Sent by Study Planner</p>
      </div>
    `,
  }
}

export function buildPriorityChangedEmail(task, oldPriority) {
  return {
    subject: `⚠️ Priority Changed: ${task.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
        <h2 style="color:#1a1a2e">⚠️ Task Priority Updated</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Title</td><td style="padding:8px">${task.title}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Old Priority</td><td style="padding:8px;color:red">${oldPriority}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">New Priority</td><td style="padding:8px;color:green">${task.priority}</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:24px">Sent by Study Planner</p>
      </div>
    `,
  }
}

export function buildDueDateChangedEmail(task, oldDate) {
  return {
    subject: `📅 Due Date Updated: ${task.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px">
        <h2 style="color:#1a1a2e">📅 Due Date Changed</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Title</td><td style="padding:8px">${task.title}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Old Due Date</td><td style="padding:8px;color:red">${oldDate}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">New Due Date</td><td style="padding:8px;color:green">${task.deadline}</td></tr>
        </table>
        <p style="color:#888;font-size:12px;margin-top:24px">Sent by Study Planner</p>
      </div>
    `,
  }
}

export function buildEventEmail({
  eventType,
  taskTitle,
  subject = '',
  priority,
  dueDate,
  userName = 'there',
  notes = '',
}) {
  const subjectMap = {
    task_created: `📚 New Task Added: ${taskTitle}`,
    priority_changed: `⚠️ Priority Changed: ${taskTitle}`,
    due_date_changed: `📅 Due Date Updated: ${taskTitle}`,
    due_reminder_1h: `⏰ 1 Hour Left: ${taskTitle}`,
    daily_reminder: `🌅 Daily Reminder`,
  }

  const subject_line = subjectMap[eventType] || 'Task Update'

  let body = `
    <p>Hi <strong>${userName}</strong>,</p>
    <p>Here is an update about your task:</p>
  `

  if (eventType === 'task_created') {
    body += `<p>Your new task has been added.</p>`
  }

  if (eventType === 'priority_changed') {
    body += `<p>Priority has been updated.</p>`
  }

  if (eventType === 'due_date_changed') {
    body += `<p>Due date has been updated.</p>`
  }

  if (eventType === 'due_reminder_1h') {
    body += `<p>Your task is due in 1 hour.</p>`
  }

  body += taskCardHtml({ title: taskTitle, subject, priority, dueDate, notes })

  return {
    subject: subject_line,
    html: htmlWrap(subject_line, body),
  }
}
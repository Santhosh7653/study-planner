import nodemailer from 'nodemailer'

const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }
const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }

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

export function taskCardHtml({ title, priority, dueDate, notes }) {
  const color = PRIORITY_COLOR[priority] || '#6366f1'
  return `
    <div style="border:1px solid #e5e7eb;border-left:4px solid ${color};border-radius:12px;padding:16px 20px;margin-bottom:12px;">
      <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#111827;">${title}</p>
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
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Study Planner</p>
            <p style="margin:6px 0 0;font-size:13px;color:#c7d2fe;">${title}</p>
          </td>
        </tr>
        <tr><td style="padding:28px 32px;">${bodyHtml}</td></tr>
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              Study Planner · You're receiving this because you are signed in to your account.<br />
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

function createTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS
  const host = process.env.SMTP_HOST

  if (!user || !pass) {
    throw new Error('SMTP_USER/SMTP_PASS or GMAIL_USER/GMAIL_PASS must be configured.')
  }

  if (host) {
    return nodemailer.createTransport({
      host,
      auth: { user, pass },
    })
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

export async function sendMail({ to, subject, html }) {
  if (!to || !subject || !html) {
    throw new Error('sendMail requires to, subject, and html.')
  }

  const transporter = createTransporter()
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    })
    return true
  } catch (err) {
    console.error('[emailService] sendMail failed:', err.message)
    return false
  }
}

export function buildEventEmail({
  eventType,
  taskTitle,
  priority,
  dueDate,
  userName = 'there',
  changes = {},
  notes = '',
}) {
  const subjectMap = {
    task_created: `📚 New task created: "${taskTitle}"`,
    priority_changed: `🔔 Priority updated: "${taskTitle}"`,
    due_date_changed: `⏰ Due date changed: "${taskTitle}"`,
    title_updated: `✏️ Title updated: "${taskTitle}"`,
    notes_updated: `📝 Notes updated: "${taskTitle}"`,
    due_reminder_1h: `⏳ Your task is due in 1 hour: "${taskTitle}"`,
    due_now: `🚨 Your task is due now: "${taskTitle}"`,
  }

  const subject = subjectMap[eventType] || `Task notification: "${taskTitle}"`
  let detailHtml = `
    <p style="margin:0 0 16px;font-size:15px;color:#374151;">
      ${userName ? `Hi <strong>${userName}</strong>,` : 'Hello,'}
    </p>
    <p style="margin:0 0 10px;font-size:15px;color:#374151;">
      `

  if (eventType === 'task_created') {
    detailHtml += 'A new task has been created in your planner:'
  } else if (eventType === 'priority_changed') {
    detailHtml += `The priority of your task has changed to <strong>${priorityLabel(priority)}</strong>.`
  } else if (eventType === 'due_date_changed') {
    detailHtml += 'The due date has been updated for your task:'
  } else if (eventType === 'title_updated') {
    detailHtml += 'The title of your task has been updated:'
  } else if (eventType === 'notes_updated') {
    detailHtml += 'The notes for your task have been updated:'
  } else if (eventType === 'due_reminder_1h') {
    detailHtml += `Your task is due in 1 hour:`
  } else if (eventType === 'due_now') {
    detailHtml += `Your task is due now:`
  } else {
    detailHtml += 'Your task has an update:'
  }

  detailHtml += `</p>`

  if (changes.previousPriority) {
    detailHtml += `
      <p style="margin:0 0 10px;font-size:13px;color:#6b7280;">
        Previous priority: <strong>${priorityLabel(changes.previousPriority)}</strong>
      </p>`
  }

  if (changes.previousDeadline) {
    detailHtml += `
      <p style="margin:0 0 10px;font-size:13px;color:#6b7280;">
        Previous due date: <strong>${fmtDate(changes.previousDeadline)}</strong>
      </p>`
  }

  if (changes.previousTitle) {
    detailHtml += `
      <p style="margin:0 0 10px;font-size:13px;color:#6b7280;">
        Previous title: <strong>${changes.previousTitle}</strong>
      </p>`
  }

  if (changes.previousNotes) {
    detailHtml += `
      <p style="margin:0 0 10px;font-size:13px;color:#6b7280;">
        Previous notes: <strong>${changes.previousNotes}</strong>
      </p>`
  }

  const taskCard = taskCardHtml({ title: taskTitle, priority, dueDate, notes })
  const footer = `
    <p style="margin:18px 0 0;font-size:13px;color:#6b7280;">
      ${eventType === 'due_reminder_1h'
        ? `Your task "${taskTitle}" is due in about 1 hour.`
        : eventType === 'due_now'
          ? `Your task "${taskTitle}" is due now.`
          : 'Open the app to manage your task.'`
      }
    </p>`

  const bodyHtml = `
    ${detailHtml}
    ${taskCard}
    ${footer}`

  return { subject, html: htmlWrap(subject, bodyHtml) }
}

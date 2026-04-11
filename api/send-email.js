/**
 * POST /api/send-email
 *
 * Called from the frontend whenever a task is created or updated.
 * Body: { type, task, userEmail, userName, previousTask? }
 *
 * type values:
 *   'task_created'          — new task added
 *   'deadline_updated'      — deadline changed
 *   'priority_changed'      — priority changed
 *   'title_updated'         — task title changed
 *   'notes_updated'         — task notes changed
 *   'task_updated'          — general task update
 */
import { sendMail, htmlWrap, taskCardHtml, fmtDate, priorityLabel } from './_mailer.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { type, task, userEmail, userName, previousTask } = req.body ?? {}

  if (!type || !task || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields: type, task, userEmail' })
  }

  let subject = ''
  let bodyHtml = ''
  const greeting = `<p style="margin:0 0 20px;font-size:15px;color:#374151;">Hi <strong>${userName || 'there'}</strong>,</p>`

  // ── Task Created ────────────────────────────────────────────────────────────
  if (type === 'task_created') {
    subject = `📚 New task added: "${task.title}"`
    bodyHtml = `
      ${greeting}
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        A new study task has been added to your planner:
      </p>
      ${taskCardHtml(task)}
      <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
        Stay on track — you've got this! 💪
      </p>`
  }

  // ── Deadline Updated ────────────────────────────────────────────────────────
  else if (type === 'deadline_updated') {
    subject = `⏰ Deadline updated: "${task.title}"`
    bodyHtml = `
      ${greeting}
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        The deadline for one of your tasks has been updated:
      </p>
      ${taskCardHtml(task)}
      ${previousTask?.deadline ? `
      <p style="margin:12px 0 0;font-size:13px;color:#9ca3af;">
        Previous deadline: <s>${fmtDate(previousTask.deadline)}</s>
      </p>` : ''}
      <p style="margin:12px 0 0;font-size:13px;color:#6b7280;">
        New deadline: <strong style="color:#4f46e5;">${fmtDate(task.deadline)}</strong>
      </p>`
  }

  // ── Priority Changed ────────────────────────────────────────────────────────
  else if (type === 'priority_changed') {
    subject = `🔔 Priority changed: "${task.title}"`
    bodyHtml = `
      ${greeting}
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        The priority of a task has been updated:
      </p>
      ${taskCardHtml(task)}
      ${previousTask?.priority ? `
      <p style="margin:12px 0 0;font-size:13px;color:#9ca3af;">
        Previous priority: <s>${priorityLabel(previousTask.priority)}</s> → <strong>${priorityLabel(task.priority)}</strong>
      </p>` : ''}`
  }

  // ── Title Updated ──────────────────────────────────────────────────────────
  else if (type === 'title_updated') {
    subject = `✏️ Task title updated`
    bodyHtml = `
      ${greeting}
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        A task title has been updated:
      </p>
      ${previousTask?.title ? `
      <p style="margin:0 0 12px;font-size:13px;color:#9ca3af;">
        <strong>Previous title:</strong> <s>${previousTask.title}</s>
      </p>` : ''}
      <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">
        <strong>New title:</strong> ${task.title}
      </p>
      ${taskCardHtml(task)}`
  }

  // ── Notes Updated ──────────────────────────────────────────────────────────
  else if (type === 'notes_updated') {
    subject = `📝 Task notes updated: "${task.title}"`
    bodyHtml = `
      ${greeting}
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Notes have been updated for one of your tasks:
      </p>
      <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111827;">
        ${task.title}
      </p>
      ${previousTask?.notes ? `
      <div style="margin:0 0 12px;padding:12px;background:#f3f4f6;border-radius:8px;border-left:3px solid #9ca3af;">
        <p style="margin:0;font-size:12px;color:#6b7280;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Previous notes</p>
        <p style="margin:6px 0 0;font-size:13px;color:#374151;">${previousTask.notes}</p>
      </div>` : ''}
      <div style="margin:0;padding:12px;background:#dbeafe;border-radius:8px;border-left:3px solid #3b82f6;">
        <p style="margin:0;font-size:12px;color:#1e40af;font-weight:500;text-transform:uppercase;letter-spacing:0.5px;">Updated notes</p>
        <p style="margin:6px 0 0;font-size:13px;color:#1e3a8a;">${task.notes || '(cleared)'}</p>
      </div>`
  }

  // ── General Task Update ────────────────────────────────────────────────────
  else if (type === 'task_updated') {
    subject = `🔄 Task updated: "${task.title}"`
    bodyHtml = `
      ${greeting}
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        A task has been updated:
      </p>
      ${taskCardHtml(task)}`
  }

  else {
    return res.status(400).json({ error: `Unknown email type: ${type}` })
  }

  const sent = await sendMail({
    to: userEmail,
    subject,
    html: htmlWrap(subject, bodyHtml),
  })

  return res.status(sent ? 200 : 500).json({ success: sent })
}

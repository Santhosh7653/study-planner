/**
 * POST /api/send-email
 *
 * Backend email endpoint for task events + reminders.
 *
 * Expected body shape:
 *   {
 *     to: string,
 *     eventType: 'task_created' | 'priority_changed' | 'due_date_changed' | 'title_updated' | 'notes_updated' | 'due_reminder_1h' | 'due_now',
 *     taskTitle: string,
 *     priority: string,
 *     dueDate: string,
 *     notes?: string,
 *     userName?: string,
 *     changes?: { previousPriority?: string, previousDeadline?: string, previousTitle?: string, previousNotes?: string }
 *   }
 */
import { buildEventEmail, sendMail } from '../lib/emailService.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const {
    to,
    eventType,
    taskTitle,
    priority,
    dueDate,
    notes = '',
    userName,
    changes = {},
    task,
    previousTask,
  } = req.body ?? {}

  const recipient = to || req.body.userEmail || req.body.email
  const finalTitle = taskTitle || task?.title
  const finalPriority = priority || task?.priority
  const finalDueDate = dueDate || task?.deadline || task?.dueDate

  if (!recipient || !eventType || !finalTitle || !finalPriority || !finalDueDate) {
    return res.status(400).json({
      error: 'Missing required fields: to, eventType, taskTitle, priority, dueDate',
    })
  }

  const emailPayload = {
    eventType,
    taskTitle: finalTitle,
    priority: finalPriority,
    dueDate: finalDueDate,
    notes: notes || task?.notes || '',
    userName,
    changes: {
      previousPriority: changes.previousPriority || previousTask?.priority,
      previousDeadline: changes.previousDeadline || previousTask?.deadline || previousTask?.dueDate,
      previousTitle: changes.previousTitle || previousTask?.title,
      previousNotes: changes.previousNotes || previousTask?.notes,
    },
  }

  const { subject, html } = buildEventEmail(emailPayload)
  const sent = await sendMail({ to: recipient, subject, html })

  if (!sent) {
    return res.status(500).json({ success: false, error: 'Failed to send email.' })
  }

  return res.status(200).json({ success: true })
}

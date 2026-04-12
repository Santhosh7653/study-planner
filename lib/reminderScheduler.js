import { adminDb, adminAuth } from '../api/_firebaseAdmin.js'
import { buildEventEmail, sendMail, fmtDate } from './emailService.js'

const ONE_HOUR_WINDOW_MINUTES = 55
const ONE_HOUR_WINDOW_MAXUTES = 65
const DUE_NOW_WINDOW_MINUTES = 8

function makeWindow(now, minutesBefore, minutesAfter) {
  return {
    start: new Date(now.getTime() - minutesBefore * 60 * 1000),
    end: new Date(now.getTime() + minutesAfter * 60 * 1000),
  }
}

function getTaskDeadline(task) {
  return task.deadline || task.dueDate || task.due_date
}

export async function runReminderScheduler() {
  if (!adminDb) {
    throw new Error('Firebase Admin not initialized. Check env vars.')
  }

  const now = new Date()
  const oneHourWindow = {
    start: new Date(now.getTime() + ONE_HOUR_WINDOW_MINUTES * 60 * 1000),
    end: new Date(now.getTime() + ONE_HOUR_WINDOW_MAXUTES * 60 * 1000),
  }
  const dueNowWindow = makeWindow(now, DUE_NOW_WINDOW_MINUTES, DUE_NOW_WINDOW_MINUTES)

  let emailsSent = 0
  let usersProcessed = 0
  let tasksChecked = 0

  const usersSnap = await adminDb.collection('users').get()

  for (const userDoc of usersSnap.docs) {
    usersProcessed += 1
    const userId = userDoc.id

    let userEmail
    let userName
    try {
      const authUser = await adminAuth.getUser(userId)
      userEmail = authUser.email
      userName = authUser.displayName || authUser.email?.split('@')[0] || 'there'
    } catch (err) {
      console.warn('[reminderScheduler] Could not resolve user auth for', userId, err.message)
      continue
    }

    if (!userEmail) continue

    const tasksSnap = await adminDb.collection('users').doc(userId).collection('tasks').get()
    const tasks = tasksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    for (const task of tasks) {
      tasksChecked += 1
      if (task.completed) continue

      const dueDateValue = getTaskDeadline(task)
      if (!dueDateValue) continue

      const deadline = new Date(dueDateValue)
      if (Number.isNaN(deadline.getTime())) continue

      const sendDueNow =
        !task.alertSent && deadline >= dueNowWindow.start && deadline <= dueNowWindow.end
      const send1hReminder =
        !task.reminderSent && deadline >= oneHourWindow.start && deadline <= oneHourWindow.end

      if (!sendDueNow && !send1hReminder) continue

      const eventType = sendDueNow ? 'due_now' : 'due_reminder_1h'
      const subjectAndHtml = buildEventEmail({
        eventType,
        taskTitle: task.title,
        priority: task.priority,
        dueDate: dueDateValue,
        userName,
        notes: task.notes || '',
      })

      const result = await sendMail({
        to: userEmail,
        subject: subjectAndHtml.subject,
        html: subjectAndHtml.html,
      })

      if (!result.success) continue

      emailsSent += 1
      const updateData = {}
      if (sendDueNow) updateData.alertSent = true
      if (send1hReminder) updateData.reminderSent = true

      try {
        await adminDb
          .collection('users')
          .doc(userId)
          .collection('tasks')
          .doc(task.id)
          .update(updateData)
      } catch (err) {
        console.warn('[reminderScheduler] Failed to update task reminder flags:', err.message)
      }
    }
  }

  return {
    success: true,
    emailsSent,
    usersProcessed,
    tasksChecked,
    checkedAt: now.toISOString(),
  }
}

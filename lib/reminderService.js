import 'dotenv/config'
import { adminDb, adminAuth } from '../api/_firebaseAdmin.js'
import { sendMail } from './emailService.js'

// IST = UTC+5:30 — helper to get "today" boundaries in IST
function istDayBounds() {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
  const nowUtc = Date.now()
  const nowIst = new Date(nowUtc + IST_OFFSET_MS)

  const startOfDayIst = new Date(nowIst)
  startOfDayIst.setHours(0, 0, 0, 0)

  const endOfDayIst = new Date(nowIst)
  endOfDayIst.setHours(23, 59, 59, 999)

  // Convert back to real UTC timestamps
  return {
    start: new Date(startOfDayIst.getTime() - IST_OFFSET_MS),
    end:   new Date(endOfDayIst.getTime() - IST_OFFSET_MS),
    now:   new Date(nowUtc),
  }
}

function fmtDate(value) {
  if (!value) return 'No deadline'
  const d = new Date(value)
  if (isNaN(d)) return String(value)
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' }

function taskRow(task) {
  const color = PRIORITY_COLOR[task.priority] || '#6366f1'
  const label = PRIORITY_LABEL[task.priority] || 'Normal'
  return `
    <div style="border:1px solid #e5e7eb;border-left:4px solid ${color};border-radius:12px;padding:14px 18px;margin-bottom:10px;background:#fff;">
      <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111827;">${task.title}</p>
      ${task.subject ? `<p style="margin:0 0 4px;font-size:12px;color:#6b7280;">📚 ${task.subject}</p>` : ''}
      <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">📅 <strong>Due:</strong> ${fmtDate(task.deadline)}</p>
      <span style="display:inline-block;background:${color}22;color:${color};font-weight:600;padding:2px 10px;border-radius:999px;font-size:12px;">
        ${label} Priority
      </span>
      ${task.notes ? `<p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">${task.notes}</p>` : ''}
    </div>`
}

function emailWrap(title, previewText, body) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>
  <div style="max-width:600px;margin:32px auto;padding:0 16px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:16px 16px 0 0;padding:28px 32px;">
      <div style="font-size:28px;margin-bottom:6px;">📚</div>
      <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">${title}</h1>
    </div>
    <!-- Body -->
    <div style="background:#f9fafb;border-radius:0 0 16px 16px;padding:28px 32px;border:1px solid #e5e7eb;border-top:none;">
      ${body}
      <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
        Study Planner · You're receiving this because you have scheduled reminders enabled.
      </p>
    </div>
  </div>
</body>
</html>`
}

// ── Get user info from Firebase Auth ─────────────────────────────────────────
async function getUserInfo(userId) {
  try {
    const user = await adminAuth.getUser(userId)
    return {
      email: user.email || null,
      name: user.displayName || user.email?.split('@')[0] || 'there',
    }
  } catch (err) {
    console.error(`[reminderService] getUser(${userId}) failed:`, err.message)
    return null
  }
}

// ── Get all user IDs from Firestore ──────────────────────────────────────────
async function getAllUserIds() {
  const refs = await adminDb.collection('users').listDocuments()
  return refs.map((r) => r.id)
}

// ── Get tasks for a user ─────────────────────────────────────────────────────
async function getUserTasks(userId) {
  const snap = await adminDb.collection('users').doc(userId).collection('tasks').get()
  return snap.docs.map((d) => ({ id: d.id, ref: d.ref, ...d.data() }))
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY DIGEST — 8am IST
// Sends a morning email with today's tasks and overdue tasks
// ─────────────────────────────────────────────────────────────────────────────
export async function sendDailyDigest() {
  if (!adminDb || !adminAuth) {
    console.warn('[reminderService] Firebase Admin not configured — daily digest skipped')
    return
  }

  console.log('[reminderService] Running daily digest...')
  const { start, end, now } = istDayBounds()

  let totalSent = 0
  const userIds = await getAllUserIds()

  for (const userId of userIds) {
    try {
      const userInfo = await getUserInfo(userId)
      if (!userInfo?.email) continue

      const tasks = await getUserTasks(userId)
      const incomplete = tasks.filter((t) => !t.completed)

      const todayTasks = incomplete.filter((t) => {
        const d = new Date(t.deadline)
        return d >= start && d <= end
      })

      const overdueTasks = incomplete.filter((t) => {
        const d = new Date(t.deadline)
        return d < start
      })

      if (todayTasks.length === 0 && overdueTasks.length === 0) {
        console.log(`[reminderService] No tasks for user ${userId}, skipping digest`)
        continue
      }

      let body = `<p style="margin:0 0 20px;font-size:15px;color:#374151;">Good morning, <strong>${userInfo.name}</strong>! Here's your study plan for today.</p>`

      if (todayTasks.length > 0) {
        body += `<h2 style="font-size:16px;font-weight:700;color:#4f46e5;margin:0 0 12px;">📅 Due Today (${todayTasks.length})</h2>`
        body += todayTasks.map(taskRow).join('')
      }

      if (overdueTasks.length > 0) {
        body += `<h2 style="font-size:16px;font-weight:700;color:#ef4444;margin:${todayTasks.length > 0 ? '24px' : '0'} 0 12px;">⚠️ Overdue (${overdueTasks.length})</h2>`
        body += `<p style="font-size:13px;color:#6b7280;margin:0 0 12px;">These tasks are past their deadline — take care of them as soon as possible.</p>`
        body += overdueTasks.map(taskRow).join('')
      }

      const total = todayTasks.length + overdueTasks.length
      const html = emailWrap(
        '🌅 Your Daily Study Digest',
        `You have ${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} due today${overdueTasks.length > 0 ? ` and ${overdueTasks.length} overdue` : ''}.`,
        body,
      )

      const result = await sendMail({
        to: userInfo.email,
        subject: `📚 Daily Digest — ${todayTasks.length} today, ${overdueTasks.length} overdue`,
        html,
      })

      if (result.success) {
        console.log(`[reminderService] ✅ Daily digest sent to ${userInfo.email} (${total} tasks)`)
        totalSent++
      } else {
        console.warn(`[reminderService] ⚠️ Digest failed for ${userInfo.email}:`, result.reason)
      }
    } catch (err) {
      console.error(`[reminderService] Error processing user ${userId}:`, err.message)
    }
  }

  console.log(`[reminderService] Daily digest complete — ${totalSent} emails sent`)
}

// ─────────────────────────────────────────────────────────────────────────────
// 1-HOUR REMINDER — runs every minute, sends one email per task
// ─────────────────────────────────────────────────────────────────────────────
export async function sendHourlyReminders() {
  if (!adminDb || !adminAuth) return

  const now = new Date()
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

  const userIds = await getAllUserIds()

  for (const userId of userIds) {
    try {
      const tasks = await getUserTasks(userId)

      const dueSoon = tasks.filter((t) => {
        if (t.completed) return false
        if (t.reminderSent1h) return false
        const d = new Date(t.deadline)
        return d > now && d <= oneHourFromNow
      })

      if (dueSoon.length === 0) continue

      const userInfo = await getUserInfo(userId)
      if (!userInfo?.email) continue

      for (const task of dueSoon) {
        // Mark first so parallel runs don't double-send
        await task.ref.update({ reminderSent1h: true })

        const body = `
          <p style="margin:0 0 20px;font-size:15px;color:#374151;">
            Hey <strong>${userInfo.name}</strong>, this task is due in <strong>less than 1 hour</strong>!
          </p>
          ${taskRow(task)}
          <p style="margin:16px 0 0;font-size:14px;color:#6b7280;">
            💪 You've got this — stay focused and get it done!
          </p>`

        const html = emailWrap(
          '⏰ Task Due in 1 Hour!',
          `"${task.title}" is due in less than 1 hour. Don't miss it!`,
          body,
        )

        const result = await sendMail({
          to: userInfo.email,
          subject: `⏰ Due Soon: ${task.title}`,
          html,
        })

        if (result.success) {
          console.log(`[reminderService] ✅ 1h reminder sent: "${task.title}" → ${userInfo.email}`)
        } else {
          // Roll back the flag so it can retry
          await task.ref.update({ reminderSent1h: false })
          console.warn(`[reminderService] ⚠️ 1h reminder failed for "${task.title}":`, result.reason)
        }
      }
    } catch (err) {
      console.error(`[reminderService] Error in hourly check for user ${userId}:`, err.message)
    }
  }
}

/**
 * GET /api/deadline-reminder
 *
 * Vercel Cron Job — runs every 15 minutes.
 * Finds tasks whose deadline is between 55–75 minutes from now
 * (the window ensures we catch it in one of the 15-min runs).
 * Sends a "due in ~1 hour" alert email and marks the task so it
 * doesn't get emailed again (sets `reminderSent: true` in Firestore).
 *
 * Cron schedule defined in vercel.json: "* /15 * * * *"  (every 15 min)
 */
import { adminDb, adminAuth } from './_firebaseAdmin.js'
import { sendMail, htmlWrap, taskCardHtml, fmtDate } from './_mailer.js'

function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true
  return req.headers['authorization'] === `Bearer ${cronSecret}`
}

export default async function handler(req, res) {
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (!adminDb) {
    return res.status(500).json({ error: 'Firebase Admin not initialized. Check env vars.' })
  }

  const now        = new Date()
  const windowMin  = new Date(now.getTime() + 55 * 60 * 1000)  // 55 min from now
  const windowMax  = new Date(now.getTime() + 75 * 60 * 1000)  // 75 min from now

  let emailsSent = 0

  try {
    const usersSnap = await adminDb.collection('users').get()

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id

      let userEmail, userName
      try {
        const authUser = await adminAuth.getUser(userId)
        userEmail = authUser.email
        userName  = authUser.displayName || authUser.email?.split('@')[0] || 'there'
      } catch {
        continue
      }

      if (!userEmail) continue

      const tasksSnap = await adminDb
        .collection('users').doc(userId).collection('tasks')
        .get()

      const urgentTasks = tasksSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => {
          if (t.completed || t.reminderSent) return false
          const dl = new Date(t.deadline)
          return dl >= windowMin && dl <= windowMax
        })

      for (const task of urgentTasks) {
        const minutesLeft = Math.round((new Date(task.deadline) - now) / 60000)
        const subject = `⏰ "${task.title}" is due in ~${minutesLeft} minutes!`

        const bodyHtml = `
          <p style="margin:0 0 20px;font-size:15px;color:#374151;">
            Hi <strong>${userName}</strong>, this is your 1-hour reminder:
          </p>
          <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:16px 20px;margin-bottom:16px;">
            <p style="margin:0;font-size:14px;font-weight:700;color:#92400e;">
              ⚡ Due in approximately ${minutesLeft} minutes
            </p>
          </div>
          ${taskCardHtml(task)}
          <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
            Exact deadline: <strong style="color:#ef4444;">${fmtDate(task.deadline)}</strong>
          </p>
          <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">
            Open the app to mark it complete once you're done. 🎯
          </p>`

        const sent = await sendMail({
          to: userEmail,
          subject,
          html: htmlWrap(subject, bodyHtml),
        })

        if (sent) {
          emailsSent++
          // Mark task so we don't send again
          try {
            await adminDb
              .collection('users').doc(userId)
              .collection('tasks').doc(task.id)
              .update({ reminderSent: true })
          } catch (e) {
            console.warn('[deadline-reminder] Could not mark reminderSent:', e.message)
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      emailsSent,
      checkedAt: now.toISOString(),
    })
  } catch (err) {
    console.error('[deadline-reminder] Error:', err)
    return res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/daily-reminder
 *
 * Vercel Cron Job — runs daily at 8:00 AM UTC.
 * Reads every user's tasks from Firestore, finds tasks due today,
 * and sends a summary email to each user who has tasks due today.
 *
 * Cron schedule defined in vercel.json: "0 8 * * *"
 */
import { adminDb, adminAuth } from './_firebaseAdmin.js'
import { sendMail, htmlWrap, taskCardHtml } from '../lib/emailService.js'

// Guard: only allow Vercel's cron runner (or our own secret for manual testing)
function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true // no secret set → allow (dev only)
  return req.headers['authorization'] === `Bearer ${cronSecret}`
}

export default async function handler(req, res) {
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' })

  if (!adminDb) {
    return res.status(500).json({ error: 'Firebase Admin not initialized. Check env vars.' })
  }

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999)

  let emailsSent = 0
  let usersProcessed = 0

  try {
    // Iterate all users
    const usersSnap = await adminDb.collection('users').get()

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id

      // Get user email from Firebase Auth
      let userEmail, userName
      try {
        const authUser = await adminAuth.getUser(userId)
        userEmail = authUser.email
        userName  = authUser.displayName || authUser.email?.split('@')[0] || 'there'
      } catch {
        console.warn(`[daily-reminder] Could not get auth user for ${userId}, skipping.`)
        continue
      }

      if (!userEmail) continue

      // Fetch tasks due today that are not completed
      const tasksSnap = await adminDb
        .collection('users').doc(userId).collection('tasks')
        .get()

      const dueTodayTasks = tasksSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => {
          if (t.completed) return false
          const dl = new Date(t.deadline)
          return dl >= todayStart && dl <= todayEnd
        })
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

      if (dueTodayTasks.length === 0) { usersProcessed++; continue }

      // Build email
      const taskListHtml = dueTodayTasks.map(taskCardHtml).join('')
      const subject = `📅 You have ${dueTodayTasks.length} task${dueTodayTasks.length > 1 ? 's' : ''} due today`

      const bodyHtml = `
        <p style="margin:0 0 20px;font-size:15px;color:#374151;">
          Hi <strong>${userName}</strong>, here's your daily study summary for today:
        </p>
        ${taskListHtml}
        <div style="margin-top:20px;padding:16px;background:#eef2ff;border-radius:12px;">
          <p style="margin:0;font-size:14px;color:#4f46e5;font-weight:600;">
            💡 Tip: Complete your highest-priority tasks first!
          </p>
        </div>`

      const sent = await sendMail({
        to: userEmail,
        subject,
        html: htmlWrap(subject, bodyHtml),
      })

      if (sent) emailsSent++
      usersProcessed++
    }

    return res.status(200).json({
      success: true,
      usersProcessed,
      emailsSent,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[daily-reminder] Error:', err)
    return res.status(500).json({ error: err.message })
  }
}

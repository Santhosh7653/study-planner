const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require('firebase-functions/v2/firestore')
const { onRequest } = require('firebase-functions/v2/https')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const admin = require('firebase-admin')
const { sendReminderEmail } = require('./email')
const { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = require('./calendar')

admin.initializeApp()
const db = admin.firestore()

// ─── Helper: get user profile (email + calendarRefreshToken) ─────────────────
async function getUserProfile(userId) {
  const snap = await db.doc(`users/${userId}/profile/data`).get()
  return snap.exists ? snap.data() : null
}

// ─── 1. Firestore trigger: task CREATED ──────────────────────────────────────
exports.onTaskCreated = onDocumentCreated(
  'users/{userId}/tasks/{taskId}',
  async (event) => {
    const task   = event.data.data()
    const userId = event.params.userId
    const taskId = event.params.taskId

    if (task.completed || !task.deadline) return

    const profile = await getUserProfile(userId)
    if (!profile?.email) return

    // Create Google Calendar event if user has connected Google Calendar
    if (profile.calendarRefreshToken) {
      try {
        const eventId = await createCalendarEvent(profile.calendarRefreshToken, { ...task, id: taskId })
        // Store the calendar event ID on the task so we can update/delete it later
        await db.doc(`users/${userId}/tasks/${taskId}`).update({ calendarEventId: eventId })
      } catch (err) {
        console.error('[Calendar] createCalendarEvent failed:', err.message)
      }
    }
  }
)

// ─── 2. Firestore trigger: task UPDATED ──────────────────────────────────────
exports.onTaskUpdated = onDocumentUpdated(
  'users/{userId}/tasks/{taskId}',
  async (event) => {
    const before = event.data.before.data()
    const after  = event.data.after.data()
    const userId = event.params.userId
    const taskId = event.params.taskId

    // Only act if deadline changed and task is not completed
    const deadlineChanged = before.deadline !== after.deadline
    if (!deadlineChanged || after.completed) return

    const profile = await getUserProfile(userId)
    if (!profile?.calendarRefreshToken) return

    if (after.calendarEventId) {
      try {
        await updateCalendarEvent(profile.calendarRefreshToken, after.calendarEventId, { ...after, id: taskId })
      } catch (err) {
        console.error('[Calendar] updateCalendarEvent failed:', err.message)
      }
    }
  }
)

// ─── 3. Firestore trigger: task DELETED ──────────────────────────────────────
exports.onTaskDeleted = onDocumentDeleted(
  'users/{userId}/tasks/{taskId}',
  async (event) => {
    const task   = event.data.data()
    const userId = event.params.userId

    const profile = await getUserProfile(userId)
    if (!profile?.calendarRefreshToken) return

    if (task.calendarEventId) {
      try {
        await deleteCalendarEvent(profile.calendarRefreshToken, task.calendarEventId)
      } catch (err) {
        console.error('[Calendar] deleteCalendarEvent failed:', err.message)
      }
    }
  }
)

// ─── 4. Scheduled job: send email reminders every 5 minutes ──────────────────
// Checks all tasks across all users for upcoming deadlines
exports.sendScheduledReminders = onSchedule('every 5 minutes', async () => {
  const now         = new Date()
  const in1Hour     = new Date(now.getTime() + 60 * 60 * 1000)
  const in65Minutes = new Date(now.getTime() + 65 * 60 * 1000) // 5-min window

  // Query all tasks due within the next 60–65 minutes that haven't been notified
  const snapshot = await db.collectionGroup('tasks').where('completed', '==', false).get()

  const batch = db.batch()
  const emailJobs = []

  for (const taskDoc of snapshot.docs) {
    const task   = taskDoc.data()
    const pathParts = taskDoc.ref.path.split('/')
    const userId = pathParts[1] // users/{userId}/tasks/{taskId}

    if (!task.deadline) continue

    const deadline = new Date(task.deadline)

    // ── 1-hour email ──────────────────────────────────────────────
    if (!task.emailNotified1h && deadline >= in1Hour && deadline <= in65Minutes) {
      emailJobs.push({ userId, task: { ...task, id: taskDoc.id }, type: '1hour' })
      batch.update(taskDoc.ref, { emailNotified1h: true })
    }

    // ── Daily email (send between 8:00–8:05 AM user's day) ────────
    // Simplified: send once per day if deadline is today and not yet sent
    const todayStr = now.toDateString()
    const deadlineStr = deadline.toDateString()
    if (
      !task.emailNotifiedDaily &&
      deadlineStr === todayStr &&
      now.getHours() === 8 &&
      now.getMinutes() < 5
    ) {
      emailJobs.push({ userId, task: { ...task, id: taskDoc.id }, type: 'daily' })
      batch.update(taskDoc.ref, { emailNotifiedDaily: todayStr })
    }
  }

  await batch.commit()

  // Send emails (fetch user profiles in parallel)
  await Promise.allSettled(
    emailJobs.map(async ({ userId, task, type }) => {
      const profile = await getUserProfile(userId)
      if (!profile?.email) return
      await sendReminderEmail(profile.email, profile.username || 'Student', task, type)
    })
  )
})

// ─── 5. HTTP endpoint: exchange Google OAuth code → store refresh token ───────
exports.connectGoogleCalendar = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return }

    const { code, userId } = req.body
    if (!code || !userId) { res.status(400).json({ error: 'Missing code or userId' }); return }

    const { google } = require('googleapis')
    const { defineString } = require('firebase-functions/params')

    const oauth2Client = new google.auth.OAuth2(
      defineString('GOOGLE_CLIENT_ID').value(),
      defineString('GOOGLE_CLIENT_SECRET').value(),
      'postmessage'
    )

    try {
      const { tokens } = await oauth2Client.getToken(code)
      if (!tokens.refresh_token) {
        res.status(400).json({ error: 'No refresh token returned. Ensure access_type=offline and prompt=consent.' })
        return
      }

      // Store refresh token in user's profile
      await db.doc(`users/${userId}/profile/data`).set(
        { calendarRefreshToken: tokens.refresh_token, calendarConnected: true },
        { merge: true }
      )

      res.json({ success: true })
    } catch (err) {
      console.error('[connectGoogleCalendar]', err)
      res.status(500).json({ error: err.message })
    }
  }
)

// ─── 6. HTTP endpoint: save user email/profile on signup ─────────────────────
exports.saveUserProfile = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return }

    const { userId, email, username } = req.body
    if (!userId || !email) { res.status(400).json({ error: 'Missing userId or email' }); return }

    // Verify the request is from a real Firebase user
    const authHeader = req.headers.authorization || ''
    const idToken = authHeader.replace('Bearer ', '')
    try {
      await admin.auth().verifyIdToken(idToken)
    } catch {
      res.status(401).json({ error: 'Unauthorized' }); return
    }

    await db.doc(`users/${userId}/profile/data`).set(
      { email, username: username || email.split('@')[0] },
      { merge: true }
    )

    res.json({ success: true })
  }
)

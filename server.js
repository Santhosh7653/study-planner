import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import { sendMail, buildEventEmail } from './lib/emailService.js'
import { sendDailyDigest, sendHourlyReminders } from './lib/reminderService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const PORT = process.env.API_PORT || process.env.PORT || 5000

app.use(express.json())
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        /localhost/.test(origin) ||
        /127\.0\.0\.1/.test(origin) ||
        /\.replit\.dev$/.test(origin) ||
        /\.repl\.co$/.test(origin) ||
        /\.replit\.app$/.test(origin)
      ) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

const tasksStore = {}

function getUserTasks(userId) {
  if (!tasksStore[userId]) tasksStore[userId] = []
  return tasksStore[userId]
}

function findTask(userId, taskId) {
  return getUserTasks(userId).find((t) => t.id === taskId)
}

app.get('/api/health', (req, res) => {
  return res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.post('/api/tasks', async (req, res) => {
  try {
    const { userId, userEmail, userName, title, subject, priority, deadline, notes } = req.body
    if (!userId || !title || !deadline) {
      return res.status(400).json({ success: false, error: 'Missing required fields: userId, title, deadline' })
    }
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newTask = {
      id: taskId,
      title,
      subject: subject || '',
      priority: priority || 'medium',
      deadline,
      notes: notes || '',
      completed: false,
      createdAt: new Date().toISOString(),
    }
    getUserTasks(userId).push(newTask)
    if (userEmail) {
      setImmediate(async () => {
        try {
          const { subject: emailSubject, html } = buildEventEmail({
            eventType: 'task_created',
            taskTitle: title,
            priority: newTask.priority,
            dueDate: deadline,
            userName: userName || 'there',
            notes,
          })
          await sendMail({ to: userEmail, subject: emailSubject, html })
        } catch (emailErr) {
          console.error('[api/tasks POST] Email failed:', emailErr.message)
        }
      })
    }
    return res.json({ success: true, task: newTask })
  } catch (err) {
    console.error('[api/tasks POST] Error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to create task' })
  }
})

app.get('/api/tasks', (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' })
    return res.json({ success: true, tasks: getUserTasks(userId) })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to fetch tasks' })
  }
})

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId, userEmail, userName, title, subject, priority, deadline, notes, completed } = req.body
    if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' })
    const existingTask = findTask(userId, id)
    if (!existingTask) return res.status(404).json({ success: false, error: 'Task not found' })
    const changes = {}
    let hasChanges = false
    if (priority && priority !== existingTask.priority) { changes.previousPriority = existingTask.priority; existingTask.priority = priority; hasChanges = true }
    if (deadline && deadline !== existingTask.deadline) { changes.previousDeadline = existingTask.deadline; existingTask.deadline = deadline; hasChanges = true }
    if (title && title !== existingTask.title) { existingTask.title = title; hasChanges = true }
    if (subject !== undefined && subject !== existingTask.subject) { existingTask.subject = subject; hasChanges = true }
    if (notes !== undefined && notes !== existingTask.notes) { existingTask.notes = notes; hasChanges = true }
    if (completed !== undefined) existingTask.completed = completed
    existingTask.updatedAt = new Date().toISOString()
    if (hasChanges && userEmail) {
      setImmediate(async () => {
        try {
          let eventType = 'title_updated'
          if (changes.previousPriority) eventType = 'priority_changed'
          else if (changes.previousDeadline) eventType = 'due_date_changed'
          const { subject: emailSubject, html } = buildEventEmail({
            eventType,
            taskTitle: existingTask.title,
            priority: existingTask.priority,
            dueDate: existingTask.deadline,
            userName: userName || 'there',
            changes,
            notes: existingTask.notes,
          })
          await sendMail({ to: userEmail, subject: emailSubject, html })
        } catch (emailErr) {
          console.error('[api/tasks PUT] Email failed:', emailErr.message)
        }
      })
    }
    return res.json({ success: true, task: existingTask })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to update task' })
  }
})

app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.query
    if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' })
    const userTasks = getUserTasks(userId)
    const taskIndex = userTasks.findIndex((t) => t.id === id)
    if (taskIndex === -1) return res.status(404).json({ success: false, error: 'Task not found' })
    const deletedTask = userTasks.splice(taskIndex, 1)[0]
    return res.json({ success: true, task: deletedTask })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete task' })
  }
})

// ── /api/send-email ───────────────────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  try {
    let body = req.body
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
    if (!body || typeof body !== 'object') body = {}

    console.log('[api/send-email] RAW body:', JSON.stringify(body))

    const emailType    = body.eventType || body.type || ''
    const taskName     = body.taskTitle || body.title || body.task?.title || ''
    const taskDue      = body.dueDate   || body.deadline || body.task?.deadline || ''
    const priority     = body.priority  || body.task?.priority || ''
    const notes        = body.notes     || body.task?.notes || ''
    const changes      = body.changes   || {}
    const userName     = body.userName  || 'there'

    // ✅ Never reject because of missing 'to' — always fall back to env var
    const recipient =
      body.to        ||
      body.userEmail ||
      body.email     ||
      process.env.RECIPIENT_EMAIL ||
      process.env.EMAIL_USER      ||
      process.env.GMAIL_USER      ||
      ''

    console.log('[api/send-email] Resolved:', { emailType, taskName, recipient })

    if (!emailType || !taskName) {
      return res.status(400).json({
        success: false,
        error: `Missing emailType or taskName. Got: ${JSON.stringify({ emailType, taskName })}`,
      })
    }

    if (!recipient) {
      return res.status(500).json({ success: false, error: 'No recipient email configured' })
    }

    const emailBody = buildEventEmail({
      eventType: emailType,
      taskTitle: taskName,
      priority,
      dueDate: taskDue,
      userName,
      changes,
      notes,
    })

    const result = await sendMail({
      to: recipient,
      subject: emailBody.subject,
      html: emailBody.html,
    })

    if (!result.success) {
      return res.status(500).json({ success: false, error: 'Email send failed', reason: result.reason })
    }

    console.log('[api/send-email] ✅ Email sent to:', recipient)
    return res.status(200).json({ success: true, message: 'Email sent' })

  } catch (err) {
    console.error('[api/send-email] Error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
})

// ── Schedulers ────────────────────────────────────────────────────────────────

// Daily digest at 8:00 AM IST = 2:30 AM UTC
cron.schedule('30 2 * * *', async () => {
  console.log('⏰ [cron] Daily digest triggered (8:00 AM IST)')
  try {
    await sendDailyDigest()
  } catch (err) {
    console.error('[cron] Daily digest error:', err.message)
  }
}, { timezone: 'UTC' })

// 1-hour deadline reminder — runs every minute
cron.schedule('* * * * *', async () => {
  try {
    await sendHourlyReminders()
  } catch (err) {
    console.error('[cron] Hourly reminder error:', err.message)
  }
}, { timezone: 'UTC' })

// ── Serve built React app in production ───────────────────────────────────────
const distPath = path.join(__dirname, 'dist')
if (existsSync(distPath)) {
  app.use(express.static(distPath))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// ── Start server ──────────────────────────────────────────────────────────────
const httpServer = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Study Planner server running on port ${PORT}`)
  console.log('📧 Email service ready')
  console.log('⏰ Reminders scheduler active')
})

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`)
    console.log('💡 Run this to free it: npx kill-port 5000')
    process.exit(1)
  } else {
    throw err
  }
})

export default app
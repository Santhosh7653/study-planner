import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import { sendMail, buildEventEmail } from './lib/emailService.js'

const app = express()
const PORT = process.env.PORT || 5000

// ──────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ──────────────────────────────────────────────────────────────────────────────

app.use(express.json())
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
    credentials: true,
  })
)

// ──────────────────────────────────────────────────────────────────────────────
// IN-MEMORY TASK STORE (alternative to Firebase)
// Format: { [userId]: [{ id, title, subject, priority, dueDate, notes, completed, createdAt }] }
// ──────────────────────────────────────────────────────────────────────────────

const tasksStore = {}

// Helper to get user tasks
function getUserTasks(userId) {
  if (!tasksStore[userId]) {
    tasksStore[userId] = []
  }
  return tasksStore[userId]
}

// Helper to find task by id
function findTask(userId, taskId) {
  const tasks = getUserTasks(userId)
  return tasks.find((t) => t.id === taskId)
}

// ──────────────────────────────────────────────────────────────────────────────
// API ROUTES
// ──────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  try {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('[api/health] Error:', err.message)
    return res.json({ status: 'ok', timestamp: new Date().toISOString() })
  }
})

/**
 * POST /api/tasks
 * Create a new task and send confirmation email
 * Body: { userId, userEmail, userName, title, subject, priority, deadline, notes }
 */
app.post('/api/tasks', async (req, res) => {
  try {
    const { userId, userEmail, userName, title, subject, priority, deadline, notes } = req.body

    // Validation
    if (!userId || !title || !deadline) {
      return res.status(400).json({ success: false, error: 'Missing required fields: userId, title, deadline' })
    }

    // Create task object
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

    // Save to store
    const userTasks = getUserTasks(userId)
    userTasks.push(newTask)

    // Send confirmation email asynchronously (non-blocking)
    if (userEmail) {
      setImmediate(async () => {
        try {
          const { subject: emailSubject, html } = buildEventEmail({
            eventType: 'task_created',
            taskTitle: title,
            subject,
            priority: newTask.priority,
            dueDate: deadline,
            userName: userName || 'there',
            notes,
          })
          const result = await sendMail({ to: userEmail, subject: emailSubject, html })
          if (!result.success) {
            console.warn('[api/tasks POST] Email send failed:', result.reason)
          }
        } catch (emailErr) {
          console.error('[api/tasks POST] Email send failed:', emailErr.message)
        }
      })
    }

    return res.json({ success: true, task: newTask })
  } catch (err) {
    console.error('[api/tasks POST] Error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to create task' })
  }
})

/**
 * GET /api/tasks
 * Fetch all tasks for a user
 * Query: userId
 */
app.get('/api/tasks', (req, res) => {
  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId query parameter' })
    }

    const tasks = getUserTasks(userId)
    return res.json({ success: true, tasks })
  } catch (err) {
    console.error('[api/tasks GET] Error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to fetch tasks' })
  }
})

/**
 * PUT /api/tasks/:id
 * Update task (priority, deadline, notes, etc.) and send update email if changed
 * Body: { userId, userEmail, userName, title, subject, priority, deadline, notes, completed }
 */
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId, userEmail, userName, title, subject, priority, deadline, notes, completed } = req.body

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId' })
    }

    const existingTask = findTask(userId, id)
    if (!existingTask) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    // Track what changed
    const changes = {}
    let hasChanges = false

    if (priority && priority !== existingTask.priority) {
      changes.previousPriority = existingTask.priority
      existingTask.priority = priority
      hasChanges = true
    }

    if (deadline && deadline !== existingTask.deadline) {
      changes.previousDeadline = existingTask.deadline
      existingTask.deadline = deadline
      hasChanges = true
    }

    if (title && title !== existingTask.title) {
      existingTask.title = title
      hasChanges = true
    }

    if (subject !== undefined && subject !== existingTask.subject) {
      existingTask.subject = subject
      hasChanges = true
    }

    if (notes !== undefined && notes !== existingTask.notes) {
      existingTask.notes = notes
      hasChanges = true
    }

    if (completed !== undefined && completed !== existingTask.completed) {
      existingTask.completed = completed
    }

    existingTask.updatedAt = new Date().toISOString()

    // Send update email asynchronously if changes were made
    if (hasChanges && userEmail) {
      setImmediate(async () => {
        try {
          let eventType = 'title_updated'
          if (changes.previousPriority) eventType = 'priority_changed'
          else if (changes.previousDeadline) eventType = 'due_date_changed'
          else if (changes.previousNotes) eventType = 'notes_updated'

          const { subject: emailSubject, html } = buildEventEmail({
            eventType,
            taskTitle: existingTask.title,
            subject: existingTask.subject,
            priority: existingTask.priority,
            dueDate: existingTask.deadline,
            userName: userName || 'there',
            changes,
            notes: existingTask.notes,
          })
          await sendMail({ to: userEmail, subject: emailSubject, html })
        } catch (emailErr) {
          console.error('[api/tasks PUT] Email send failed:', emailErr.message)
        }
      })
    }

    return res.json({ success: true, task: existingTask })
  } catch (err) {
    console.error('[api/tasks PUT] Error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to update task' })
  }
})

/**
 * DELETE /api/tasks/:id
 * Delete a task
 * Query: userId
 */
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId query parameter' })
    }

    const userTasks = getUserTasks(userId)
    const taskIndex = userTasks.findIndex((t) => t.id === id)

    if (taskIndex === -1) {
      return res.status(404).json({ success: false, error: 'Task not found' })
    }

    const deletedTask = userTasks.splice(taskIndex, 1)[0]
    return res.json({ success: true, task: deletedTask })
  } catch (err) {
    console.error('[api/tasks DELETE] Error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to delete task' })
  }
})

/**
 * POST /api/send-email
 * Send email notification for task events
 * Body: { to, eventType, taskTitle, subject, priority, dueDate, userName, changes, notes }
 */
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, type, eventType, taskTitle, subject, priority, dueDate, userName, changes, notes, tasks } = req.body
    const emailType = type || eventType

    if (!emailType || !taskTitle) {
      return res.status(400).json({ success: false, error: 'Missing required fields: type or taskTitle' })
    }

    let emailBody
    if (emailType === 'daily_reminder' && tasks) {
      let taskListHtml = ''
      tasks.forEach((task, idx) => {
        taskListHtml += `<div style="margin-bottom:12px;">${idx + 1}. <strong>${task.title}</strong> - Due: ${new Date(task.dueDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>`
      })

      emailBody = buildEventEmail({
        eventType: 'daily_reminder',
        taskTitle: taskListHtml,
        userName,
      })
    } else {
      emailBody = buildEventEmail({
        eventType: emailType,
        taskTitle,
        subject,
        priority,
        dueDate,
        userName,
        changes,
        notes,
      })
    }

    const result = await sendMail({
      to,
      subject: emailBody.subject,
      html: emailBody.html,
    })

    if (!result.success) {
      return res.status(500).json({ success: false, error: 'Email send failed', reason: result.reason })
    }

    return res.status(200).json({ success: true, message: 'Email sent' })
  } catch (err) {
    console.error('[api/send-email] Error:', err.message)
    return res.status(500).json({ success: false, error: 'Email service error', message: err.message })
  }
})

// ──────────────────────────────────────────────────────────────────────────────
// SCHEDULER: Daily reminder at 8:00 AM
// ──────────────────────────────────────────────────────────────────────────────

function initializeDailyReminderScheduler() {
  // Run at 8:00 AM every day
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Daily reminder scheduler triggered')

    try {
      // Iterate through all users and their tasks
      for (const [userId, userTasks] of Object.entries(tasksStore)) {
        const pendingTasks = userTasks.filter((t) => !t.completed)

        if (pendingTasks.length === 0) continue

        // Get email from first task's metadata (we don't have it, so this would need to be passed)
        // For now, we'll log that the scheduler ran
        console.log(`📧 Would send daily reminder for user ${userId} with ${pendingTasks.length} pending tasks`)

        // In a real implementation, you'd fetch user email from a database
        // and send the daily reminder email
      }
    } catch (err) {
      console.error('❌ Daily reminder scheduler error:', err.message)
    }
  })

  console.log('⏰ Daily reminder scheduler active (runs at 8:00 AM)')
}

// ──────────────────────────────────────────────────────────────────────────────
// SCHEDULER: 1-hour before due time check (runs every minute)
// ──────────────────────────────────────────────────────────────────────────────

function initializeOneHourReminderScheduler() {
  // Run every minute to check for tasks due in 1 hour
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date()
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

      // Iterate through all users and their tasks
      for (const [userId, userTasks] of Object.entries(tasksStore)) {
        for (const task of userTasks) {
          if (task.completed) continue

          const deadline = new Date(task.deadline)

          // Check if task is due in approximately 1 hour (within 1 minute window)
          if (deadline > now && deadline <= oneHourFromNow && !task.reminderSent1h) {
            // Mark that we've sent this reminder to avoid duplicates
            task.reminderSent1h = true

            // In a real implementation, you'd fetch user email and send reminder
            console.log(`📧 Would send 1-hour reminder for task: ${task.title}`)

            // Example email send (would need user email):
            // await sendMail({
            //   to: userEmail,
            //   subject: `⏰ 1 Hour Left: ${task.title}`,
            //   html: buildEventEmail({ eventType: 'due_reminder_1h', taskTitle: task.title, ... })
            // })
          }
        }
      }
    } catch (err) {
      console.error('❌ One-hour reminder scheduler error:', err.message)
    }
  })

  console.log('⏰ One-hour reminder scheduler active (checks every minute)')
}

// ──────────────────────────────────────────────────────────────────────────────
// SERVER STARTUP
// ──────────────────────────────────────────────────────────────────────────────

const httpServer = app.listen(PORT, () => {
  console.log(`✅ Study Planner server running on port ${PORT}`)
  console.log('📧 Email service ready')

  // Initialize schedulers
  initializeDailyReminderScheduler()
  initializeOneHourReminderScheduler()
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

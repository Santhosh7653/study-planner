# 🏗️ Architecture & Integration Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BROWSER / USER                                  │
└───────────────────────┬─────────────────────────────────────────────────┘
                        │
                        │ HTTP/WebSocket
                        │
      ┌─────────────────▼──────────────────┐
      │   REACT FRONTEND (Port 5173)       │
      │  - Dashboard                       │
      │  - Task Form                       │
      │  - Task Cards                      │
      │  - Toast Notifications             │
      │  - Dark Mode Toggle                │
      └──────────┬────────────┬────────────┘
                 │            │
        API Calls│            │ Firebase
                 │            │ Firestore
      ┌─────────┴──┐    ┌────┴──────────────┐
      │             │    │                   │
      ▼             │    ▼                   │
   [API PROXY]      │  [FIREBASE SDK]      │
   (Vite)           │  - Auth              │
                    │  - Firestore DB      │
                    │  - Storage           │
      ┌─────────────▼──────────────────────┘
      │
      │ HTTP Requests (/api/*)
      │
      ▼
┌──────────────────────────────────────────┐
│  EXPRESS.JS BACKEND (Port 5000)          │
├──────────────────────────────────────────┤
│ Routes:                                  │
│  • GET    /api/health                    │
│  • POST   /api/tasks                     │
│  • GET    /api/tasks                     │
│  • PUT    /api/tasks/:id                 │
│  • DELETE /api/tasks/:id                 │
│  • POST   /api/send-email                │
├──────────────────────────────────────────┤
│ Middleware:                              │
│  • CORS                                  │
│  • JSON Parser                           │
│  • Error Handler                         │
├──────────────────────────────────────────┤
│ Core Services:                           │
│  • Task Manager                          │
│  • Email Service                         │
│  • Scheduler (node-cron)                 │
└──────┬──────────────┬────────────────────┘
       │              │
       │              │ SMTP (Gmail)
       │              │
   ┌───▼──────┐  ┌────▼──────────────┐
   │ FIRESTORE│  │  GMAIL ACCOUNTS    │
   │  Tasks   │  │  (Nodemailer)      │
   │  Users   │  │  SMTP Server       │
   └──────────┘  └────────────────────┘
                        ▲
                        │
                   Email Events
                   (async send)
                        │
      ┌─────────────────┴──────────────────┐
      │                                    │
      ▼                                    ▼
 [SCHEDULER 1]                        [SCHEDULER 2]
 Daily Reminder                    1-Hour Reminder
 (cron: 0 8 * * *)               (every minute)
 ← Runs at 8:00 AM               ← Checks all tasks
 ← Sends summary email           ← Sends deadline alert
```

---

## Component Integration Flow

### 1️⃣ Task Creation Flow

```
User Types Task Details
         ↓
Form Validates Input
         ↓
onSubmit(form) → useTasks.addTask()
         ↓
addDoc(Firestore) ← Saves to Firebase
         ↓
notifyByEmail() ← Calls /api/send-email
         ↓
Backend: buildEventEmail('task_created')
         ↓
Nodemailer: sendMail(Gmail SMTP)
         ↓
✉️ Email arrives in user's mailbox
         ↓
Toast: "Task created!"
```

### 2️⃣ Email Notification Flow

```
Frontend Event Triggered
    ↓
useTasks.notifyByEmail({
  eventType: 'priority_changed',
  task: {...},
  userEmail: 'user@example.com'
})
    ↓
fetch('/api/send-email', {
  method: 'POST',
  body: JSON.stringify({...})
})
    ↓
Backend Route: POST /api/send-email
    ↓
buildEventEmail({
  eventType,
  taskTitle,
  priority,
  dueDate,
  etc.
})
    ↓
Returns {
  subject: "🔔 Priority Changed: Study Chapter 5",
  html: "<html>...</html>"
}
    ↓
sendMail({
  to: userEmail,
  subject,
  html
})
    ↓
Nodemailer Creates Transporter
  - Uses GMAIL_USER & GMAIL_PASS
  - Connects to Gmail SMTP server
    ↓
transporter.sendMail({...})
    ↓
Gmail API sends email
    ↓
✉️ Email received
    ↓
Return: { success: true }
```

### 3️⃣ Scheduler Reminder Flow

#### Daily Reminder (8:00 AM)

```
cron.schedule('0 8 * * *', async () => {
  ↓
  FOR each user in tasksStore:
    ↓
    Get all pending tasks for that user
    ↓
    Build email with task list
    ↓
    Call sendMail(...)
    ↓
    ✉️ "Good morning! Here are your tasks..."
})
```

#### 1-Hour Before Deadline

```
cron.schedule('* * * * *', async () => {
  ↓ (runs every minute)
  FOR each task:
    ↓
    if (task.deadline <= now + 60 min):
      ↓
      if (not already sent reminder):
        ↓
        sendEmail('⏰ 1 Hour Left: Task Name')
        ↓
        Set task.reminderSent1h = true
})
```

---

## Data Structures

### Task Object

```javascript
{
  id: "task_1705123456789_abc123",
  title: "Study Chapter 5",
  subject: "Physics",
  priority: "high",              // 'high' | 'medium' | 'low'
  deadline: "2025-04-15T14:30",  // ISO string
  notes: "Focus on thermodynamics",
  completed: false,
  reminderSent1h: false,         // Tracks if 1-hour reminder sent
  createdAt: "2025-04-12T08:00:00Z",
  updatedAt: "2025-04-12T09:30:00Z"
}
```

### Email Event Object

```javascript
{
  eventType: 'task_created',     // 'task_created' | 'priority_changed' | ...
  taskTitle: "Study Chapter 5",
  subject: "Physics",
  priority: "high",
  dueDate: "2025-04-15T14:30",
  userName: "John",
  changes: {
    previousPriority: "low",
    previousDeadline: "2025-04-14T14:30"
  },
  notes: "Focus on thermodynamics"
}
```

### Email Response Object

```javascript
{
  subject: "📚 New Task Added: Study Chapter 5",
  html: `<!DOCTYPE html>
    <html>
      <head>...</head>
      <body>
        <table width="100%" ...>
          <!-- Study Planner branded email template -->
        </table>
      </body>
    </html>`
}
```

---

## Frontend → Backend Communication

### Request Flow

```
React Component
    ↓
Hook (useTasks)
    ↓
apiClient.safeFetch()
    ↓
fetch(url, options)
    ↓
[CORS Check]
    ↓
Express Middleware
    • express.json()
    • CORS handler
    ↓
Route Handler
    • Validation
    • Processing
    • Async Email (non-blocking)
    ↓
Response JSON
    ↓
Hook Updates State
    ↓
Component Re-renders
    ↓
Toast Notification
```

### Error Handling

```
Try to send email task
    ↓
catch (err)
    ↓
Log error to console: [emailService] sendMail failed
    ↓
Return false (email failure)
    ↓
**IMPORTANT**: Don't block the API response
    ↓
Frontend gets success response anyway
    ↓
User doesn't see error (silent fail)
    ↓
BUT: Server logs show the error
```

---

## Environment Variable Dependencies

### What Each Variable Does

| Variable | Used By | Purpose |
|----------|---------|---------|
| `GMAIL_USER` | emailService.js | Gmail account for SMTP |
| `GMAIL_PASS` | emailService.js | Gmail app password |
| `RECIPIENT_EMAIL` | .env config | Default email recipient |
| `PORT` | server.js | Backend server port |
| `VITE_FIREBASE_*` | Frontend + Backend | Firebase SDK configuration |
| `VITE_GOOGLE_CLIENT_ID` | Frontend | Google OAuth for calendar |
| `GOOGLE_CLIENT_SECRET` | Backend | Google OAuth secret |

---

## Key Design Decisions

### 1. **Non-Blocking Email Sends**
```javascript
// ✅ GOOD: Email task runs async, API responds immediately
setImmediate(async () => {
  try {
    await sendMail({...})
  } catch (err) {
    console.error('[emailService]', err.message)
    // Don't throw - just log
  }
})

// ❌ BAD: Would block response
// await sendMail({...})
```

### 2. **In-Memory Task Storage (Alternative)**
```javascript
// Tasks can be stored in-memory for simple use cases
const tasksStore = {}  // { userId: [tasks] }

// For production with multiple servers, use Firebase
// The system already uses Firebase for persistence
```

### 3. **CORS Configuration**
```javascript
// Allow requests from local dev servers
cors({
  origin: [
    'http://localhost:5173',    // Vite dev
    'http://localhost:3000',    // Alternate
    'http://127.0.0.1:5173'
  ],
  credentials: true
})
```

### 4. **Email Template Strategy**
- Reusable template wrapper: `htmlWrap(title, bodyHtml)`
- Event-specific content builders: `taskCardHtml()`, etc.
- Supports all email clients and dark mode

---

## Extension Points

### Add New Email Event Type

1. Add to `emailService.js` `buildEventEmail()` function:
```javascript
subjectMap = {
  // ... existing
  task_overdue_final: '🚨 URGENT: Task Overdue'
}
```

2. Add content HTML:
```javascript
if (eventType === 'task_overdue_final') {
  detailHtml = `<p>URGENT: Your task is now ${daysOverdue} days overdue!</p>`
}
```

3. Trigger from frontend:
```javascript
await notifyByEmail({
  eventType: 'task_overdue_final',
  task,
  userEmail,
  userName
})
```

### Add New Scheduler Job

1. In `server.js`, add new cron job:
```javascript
// Run every Monday at 9 AM
cron.schedule('0 9 * * 1', async () => {
  console.log('📧 Weekly summary scheduler triggered')
  // Implementation
})
```

2. Add initialization function:
```javascript
function initializeWeeklyScheduler() {
  cron.schedule('0 9 * * 1', async () => { ... })
  console.log('📅 Weekly scheduler active')
}
```

3. Call in startup:
```javascript
app.listen(PORT, () => {
  initializeDailyReminderScheduler()
  initializeOneHourReminderScheduler()
  initializeWeeklyScheduler()  // ← Add this
})
```

---

## Troubleshooting Architecture Issues

### "API calls not reaching backend"
```
Check:
1. Both servers running? (5173 + 5000)
2. Vite proxy correctly configured? (vite.config.js)
3. CORS headers present? (server.js cors())
4. Network tab shows requests? (DevTools)
```

### "Emails not sending but task creates"
```
Check:
1. Gmail credentials in .env.local correct?
2. 2FA enabled on Gmail account?
3. App password (not regular password)?
4. Server logs show [emailService] error?
5. RECIPIENT_EMAIL set correctly?
```

### "Scheduler not running"
```
Check:
1. Backend server started? (npm run dev:server)
2. Console shows "scheduler active" messages?
3. System time correct?
4. Tasks have been created? (scheduler only checks existing tasks)
5. Check server logs for "scheduler error" messages
```

### "Tasks not saving to Firestore"
```
Check:
1. Firebase credentials in .env.local?
2. Firestore database created in Firebase console?
3. Security rules allow write? (Firebase console)
4. Browser DevTools → Console for Firebase errors?
5. Check useTasks.js addDoc() call
```

---

## Performance Considerations

### Cron Scheduler Limits
- Daily reminder: **Once per day** → Low impact
- 1-hour reminder: **Every minute** → Can grow with task count
  - If 1000+ tasks, consider database query optimization
  - Batch process or add database index

### Email Service Limits
- Gmail: **500 emails/day limit**
  - Fine for single user
  - Production: Consider SendGrid or Resend for higher limits

### Frontend Performance
- React Context used for state
- Firestore real-time listeners (efficient)
- Framer Motion: GPU-accelerated animations
- Tailwind: Utility-first CSS (small bundle)

---

## Security Best Practices Implemented

✅ Environment variables separate from code
✅ CORS restricted to known origins
✅ Email failures don't expose system info
✅ Input validation on all routes
✅ Try-catch blocks prevent crashes
✅ Firebase authentication for user data
✅ Gmail app password (not main password)

---

## Summary

The Study Planner uses a **clean separation of concerns**:

1. **Frontend** (React): User interface, state management, validation
2. **Backend** (Express): API routes, business logic, scheduling
3. **Database** (Firebase): Persistent data storage
4. **Email** (Nodemailer): Notification delivery
5. **Scheduler** (node-cron): Automated reminders

Each layer can be **scaled independently** and **tested in isolation**.

---

**For more details**, see:
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Configuration
- [QUICKSTART.md](./QUICKSTART.md) - Quick reference
- [README.md](./README.md) - Project overview

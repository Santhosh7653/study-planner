# 📚 Study Planner - Full Setup Guide

## Overview

The **Study Planner** is a full-stack learning application that helps students organize tasks with automatic email notifications. The app consists of:

- **Frontend**: React with Tailwind CSS + Framer Motion (Responsive SPA)
- **Backend**: Express.js with Node-cron scheduler
- **Database**: Firebase Firestore (for tasks and user data)
- **Email Service**: Nodemailer with Gmail SMTP
- **Notifications**: Automated emails for task creation, priority changes, due date updates, and reminders

---

## Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** or **yarn**
- **Gmail account** with 2-Factor Authentication enabled (for email service)
- **Firebase project** (already configured in `.env.local`)

---

## 🔧 Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- `express` - Backend server framework
- `cors` - Cross-origin requests
- `nodemailer` - Email sending
- `node-cron` - Task scheduling
- `react` - Frontend framework
- `tailwindcss` - Utility CSS
- `framer-motion` - Animations
- `firebase` - Backend services

### 2. Configure Environment Variables

#### Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

#### Set up Gmail for email notifications:

1. **Enable 2-Factor Authentication**:
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Click "Security" in the left sidebar
   - Enable 2-Step Verification

2. **Generate App Password**:
   - After 2FA is enabled, go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password

3. **Update `.env.local`**:
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=xxxx-xxxx-xxxx-xxxx
   RECIPIENT_EMAIL=your-email@gmail.com
   ```

#### Firebase Configuration (already set up):
The Firebase credentials are already in `.env.local`. These include:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- etc.

#### Google OAuth (for optional Calendar integration):
Already configured in `.env.local` with your Google Client ID.

---

## 🚀 Running the Application

### Development Mode (Frontend only):
```bash
npm run dev:frontend
```
Runs the React frontend on `http://localhost:5173`

### Development Mode (Backend only):
```bash
npm run dev:server
```
Runs the Express server on `http://localhost:5000`

### Full Development Stack (Recommended):

**Terminal 1** - Start the backend:
```bash
npm run dev:server
```

**Terminal 2** - Start the frontend:
```bash
npm run dev:frontend
```

Then visit: [http://localhost:5173](http://localhost:5173)

### Build for Production:
```bash
npm run build
```
Creates optimized `dist/` folder for deployment.

---

## 📧 Email Notification System

### Triggered Events

The app automatically sends emails for:

1. **📚 New Task Added**
   - Sent when a task is created
   - Includes task title, subject, priority, due date, and notes

2. **🔔 Priority Changed**
   - Sent when task priority is updated
   - Shows old vs. new priority

3. **📅 Due Date Updated**
   - Sent when task deadline is modified
   - Shows old vs. new due date

4. **🌅 Daily Reminder** (8:00 AM)
   - Lists all pending tasks for the day
   - Runs automatically via cron scheduler

5. **⏰ 1-Hour Before Due**
   - Sends reminder 60 minutes before task deadline
   - Runs every minute to check upcoming tasks

### Email Templates

All emails feature:
- Study Planner branding and gradient header
- Task details in a formatted card with priority color-coding
- Color-coded priority badges (🔴 High, 🟡 Medium, 🟢 Low)
- Footer with link to open the app
- Professional styling with dark-mode awareness

### Troubleshooting Email Issues

**✗ "Email config missing" error**:
- Ensure `GMAIL_USER` and `GMAIL_PASS` are set in `.env.local`
- Use the 16-character App Password, not your regular Gmail password

**✗ Emails not sending**:
- Check Gmail 2FA is enabled
- Verify the App Password is correct
- Check server logs for error messages: `[emailService]`
- Ensure `.env.local` is loaded (restart the server after changes)

**✗ "Invalid transporter configuration"**:
- Gmail account credentials may be incorrect
- Try generating a new App Password
- Verify no special characters are breaking the config

---

## 📋 API Endpoints

### Health Check
```
GET /api/health
→ { status: "ok", timestamp: "2025-04-12T..." }
```

### Task Management

**Create Task**:
```
POST /api/tasks
Body: {
  userId: "user123",
  userEmail: "user@example.com",
  userName: "John",
  title: "Study Chapter 5",
  subject: "Physics",
  priority: "high",
  deadline: "2025-04-15T10:00",
  notes: "Focus on thermodynamics"
}
→ { success: true, task: {...} }
```

**Get All Tasks**:
```
GET /api/tasks?userId=user123
→ { success: true, tasks: [...] }
```

**Update Task**:
```
PUT /api/tasks/task_123
Body: {
  userId: "user123",
  priority: "medium",
  notes: "Updated notes"
}
→ { success: true, task: {...} }
```

**Delete Task**:
```
DELETE /api/tasks/task_123?userId=user123
→ { success: true, task: {...} }
```

**Send Email Notification**:
```
POST /api/send-email
Body: {
  to: "user@example.com",
  eventType: "priority_changed",
  taskTitle: "Study Chapter 5",
  priority: "high",
  dueDate: "2025-04-15T10:00",
  userName: "John",
  changes: { previousPriority: "low" }
}
→ { success: true, message: "Email sent" }
```

---

## 🎨 Frontend Features

### Dashboard Views

1. **📅 Today** - Tasks due today
2. **⚠️ Overdue** - Past-due incomplete tasks
3. **🗓️ Upcoming** - Tasks due in the future
4. **📋 All Tasks** - All incomplete tasks
5. **✅ Completed** - Finished tasks

### Task Management UI

- **Add Task Form**: Title, Subject, Due Date+Time, Priority, Notes
- **Task Cards**: Shows priority badge, due date, notes preview
- **Edit/Delete Actions**: Modify or remove tasks
- **Status Indicators**: Overdue badges, "Due Today" ribbons
- **Completion Checkbox**: Mark tasks as complete with smooth animation

### Design & Aesthetics

- **Dark Theme**: Deep navy/charcoal background with purple accents
- **Color Coding**: 
  - 🔴 High = Red (#ef4444)
  - 🟡 Medium = Amber (#f59e0b)
  - 🟢 Low = Green (#10b981)
- **Smooth Animations**: Framer Motion for card entrance, hovers, exits
- **Toast Notifications**: Confirmations/errors with auto-dismiss
- **Responsive Design**: Desktop, tablet, and mobile optimized

---

## 🛠️ Scheduler Configuration

### Daily Reminder
```javascript
// Runs at 8:00 AM every day
cron.schedule('0 8 * * *', async () => {
  // Sends email with all pending tasks for the day
})
```

### 1-Hour Before Reminder
```javascript
// Runs every minute
cron.schedule('* * * * *', async () => {
  // Checks all tasks, sends reminder if due in ~1 hour
})
```

### Modifying Schedules

Edit times in `server.js` using [cron syntax](https://crontab.guru):
- `0 8 * * *` = Every day at 8:00 AM
- `0 */2 * * *` = Every 2 hours
- `*/15 * * * *` = Every 15 minutes

---

## 📦 Project Structure

```
study-planner/
├── server.js              ← Express backend + routes + scheduler
├── lib/
│   ├── emailService.js    ← Nodemailer + email templates
│   └── reminderScheduler.js
├── src/
│   ├── App.jsx            ← Main React component
│   ├── main.jsx           ← Entry point
│   ├── firebase.js        ← Firebase config
│   ├── apiClient.js       ← API fetch wrapper
│   ├── components/
│   │   ├── Dashboard.jsx  ← Main task view
│   │   ├── TaskCard.jsx   ← Individual task display
│   │   ├── TaskForm.jsx   ← Add/edit form
│   │   ├── TaskModal.jsx  ← Modal dialog
│   │   └── ...
│   └── hooks/
│       ├── useTasks.js    ← Task management hook
│       ├── useAuth.js     ← Authentication
│       └── ...
├── .env.local             ← Environment variables (git-ignored)
├── .env.example           ← Template
├── vite.config.js         ← Vite + API proxy setup
├── tailwind.config.js     ← Tailwind CSS config
└── package.json           ← Dependencies

```

---

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to git
2. **Gmail App Password**: Use the 16-char app password, not your main Gmail password
3. **Frontend Validation**: All form inputs are validated before submission
4. **Error Handling**: Errors logged server-side, user-friendly messages on frontend
5. **Email Failures**: Non-blocking—email errors won't crash the app

---

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
npm install
```
Reinstall all dependencies.

### "Port 5000 is already in use"
```bash
# Use a different port
PORT=3001 npm run dev:server
```

### Frontend and backend not communicating
- Ensure backend is running on `http://localhost:5000`
- Check vite.config.js proxy is set correctly
- Verify CORS is enabled in server.js
- Open browser DevTools → Network tab to see requests

### Emails not being received
- Check spam folder
- Verify `RECIPIENT_EMAIL` in `.env.local` is correct
- Check server logs for `[emailService]` errors
- Test with `POST /api/send-email` endpoint

### Firebase auth fails
- Ensure Firebase environment variables are set in `.env.local`
- Check Firebase project has authentication enabled
- Verify Firestore database is created and rules allow read/write

---

## 📚 Additional Resources

- **[Firebase Documentation](https://firebase.google.com/docs)**
- **[Nodemailer Guide](https://nodemailer.com/smtp/gmail/)**
- **[Node-cron Syntax](https://crontab.guru)**
- **[Tailwind CSS](https://tailwindcss.com)**
- **[Framer Motion](https://www.framer.com/motion/)**
- **[Express.js Guide](https://expressjs.com)**

---

## 🎯 Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Configure `.env.local` with Gmail credentials
3. ✅ Start backend (`npm run dev:server`)
4. ✅ Start frontend (`npm run dev:frontend`)
5. ✅ Create tasks and receive email notifications!

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Check browser DevTools → Console for frontend errors
4. Verify all environment variables are correctly set

**Happy studying! 🚀**

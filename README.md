# 📚 Study Planner - Full Stack Learning Management App

A modern, feature-rich study planner web application with **automatic email notifications**, built with React, Express.js, Firebase, and Nodemailer.

## ✨ Key Features

- ✅ **Task Management**: Create, edit, delete, and track study tasks
- 📧 **Automated Email Notifications**:
  - New task confirmation
  - Priority change updates
  - Due date change alerts
  - Daily morning reminder (8:00 AM)
  - 1-hour before deadline reminder
- 🎨 **Beautiful UI**: Dark theme with smooth animations
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔐 **Secure Authentication**: Firebase-powered user authentication
- 📊 **Task Organization**: Filter by Today, Overdue, Upcoming, Completed
- 🌙 **Dark Mode Support**: Built-in dark theme

## 🚀 Quick Start

**New to the project?** Start here:

1. **[QUICKSTART.md](./QUICKSTART.md)** - 3-step setup (2 min read)
2. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete configuration guide

### TL;DR:
```bash
npm install
npm run dev:server  # Terminal 1
npm run dev:frontend  # Terminal 2
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite + Tailwind CSS + Framer Motion |
| **Backend** | Express.js + Node-cron |
| **Database** | Firebase/Firestore |
| **Authentication** | Firebase Auth + Google OAuth |
| **Email** | Nodemailer + Gmail SMTP |
| **Calendar** | Google Calendar API (integration) |

## 📋 Core Features Breakdown

### Task Management
- Add tasks with title, subject, priority, due date, and notes
- Edit any task attribute and get notified of changes
- Mark tasks complete with smooth UI updates
- Delete tasks individually
- Filter and search across categories

### Email Notifications
- Triggered on task creation
- Notified on priority changes
- Alerted when due dates change
- Daily summary of pending tasks
- Reminder 1 hour before deadline

### Smart Organization
- **Today**: All tasks due today
- **Overdue**: Past-due incomplete tasks
- **Upcoming**: Future scheduled tasks
- **All**: All incomplete tasks
- **Completed**: Finished tasks with checkmarks

### Visual Design
- 🎨 Dark navy background with purple accents
- 🔴 Red priority badges (High)
- 🟡 Amber for medium priority
- 🟢 Green for low priority
- Smooth fade-in animations
- Hover effects and transitions

## 📁 Project Structure

```
study-planner/
├── server.js                 # Express backend + routes + schedulers
├── lib/
│   └── emailService.js       # Nodemailer + email templates
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx     # Main task view
│   │   ├── TaskCard.jsx      # Task display card
│   │   ├── TaskForm.jsx      # Add/edit form
│   │   └── ...
│   ├── hooks/
│   │   ├── useTasks.js       # Task state management
│   │   ├── useAuth.js        # Authentication
│   │   └── ...
│   ├── App.jsx               # Main app
│   └── firebase.js           # Firebase config
├── SETUP_GUIDE.md            # Comprehensive setup
├── QUICKSTART.md             # Quick reference
└── package.json
```

## 📧 Email Configuration

### Setup Gmail SMTP

1. **Enable 2-Factor Authentication**
   - Visit [myaccount.google.com](https://myaccount.google.com)
   - Security → 2-Step Verification

2. **Generate App Password**
   - Security → App passwords
   - Select Mail & Windows Computer
   - Copy 16-character password

3. **Update `.env.local`**
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=xxxx-xxxx-xxxx-xxxx
   RECIPIENT_EMAIL=your-email@gmail.com
   ```

## 🚀 Available Scripts

```bash
# Development
npm run dev:frontend   # React frontend on 5173
npm run dev:server    # Express backend on 5000
npm run dev           # Start server (use both scripts above in separate terminals)

# Production
npm run build         # Build for deployment
npm run preview       # Preview production build

# Other
npm run lint          # Run ESLint
```

## 🔌 API Endpoints

- `GET /api/health` - Health check
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Fetch all tasks
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/send-email` - Send email notification

[Full API Documentation](./SETUP_GUIDE.md#-api-endpoints)

## 🛡️ Error Handling

- All routes wrapped in try-catch
- Email failures don't crash the app
- User-friendly error messages
- Server-side error logging
- Frontend error boundaries

## 📚 Documentation

- [**QUICKSTART.md**](./QUICKSTART.md) - Quick reference (2 min)
- [**SETUP_GUIDE.md**](./SETUP_GUIDE.md) - Full documentation (10 min)
- [Troubleshooting Guide](./SETUP_GUIDE.md#-troubleshooting)

## 🧪 Testing

### Test Email Sending
```bash
curl -X POST http://localhost:5000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your@email.com",
    "eventType": "task_created",
    "taskTitle": "Test Task",
    "priority": "high",
    "dueDate": "2025-04-15T10:00",
    "userName": "John"
  }'
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

## 🐛 Troubleshooting

**Quick fixes for common issues:**

| Issue | Solution |
|-------|----------|
| Dependencies missing | `npm install` |
| Port in use | `PORT=3001 npm run dev:server` |
| Emails not sending | Check `.env.local` - correct Gmail credentials? |
| Frontend can't reach backend | Both servers running? Check ports 5173 & 5000 |

[Full Troubleshooting](./SETUP_GUIDE.md#-troubleshooting)

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm run build
```
Deploy the `dist/` folder to Vercel.

Backend can run on:
- Vercel Functions (serverless)
- Separate Node.js server
- Heroku/Railway

## 📞 Support

1. Check [Troubleshooting](./SETUP_GUIDE.md#-troubleshooting) section
2. Review server logs for `[emailService]` errors
3. Check browser DevTools → Console
4. Verify all `.env.local` variables are set

## 📄 License

This project is open source - feel free to use and modify!

---

**Happy studying! 🚀** Start with [QUICKSTART.md](./QUICKSTART.md)


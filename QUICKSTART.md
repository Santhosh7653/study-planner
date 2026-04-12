# ⚡ Quick Start - Study Planner

## 🚀 Start Developing in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Email Configuration
Edit `.env.local`:
```env
GMAIL_USER=your@gmail.com
GMAIL_PASS=16-char-app-password
```

### 3. Run Backend + Frontend
```bash
# Terminal 1
npm run dev:server

# Terminal 2 (in same folder)
npm run dev:frontend
```

Visit: **http://localhost:5173**

---

## 🆘 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| `Cannot find module 'express'` | Run `npm install` |
| `Port 5000 already in use` | Kill process or use `PORT=3001 npm run dev:server` |
| `Email config missing` | Check `GMAIL_USER` and `GMAIL_PASS` in `.env.local` |
| `Emails won't send` | Verify Gmail 2FA is enabled and app password is correct |
| `Frontend can't reach backend` | Ensure both servers are running on ports 5173 and 5000 |

---

## 📧 Email Events

Emails automatically trigger when:
- ✅ Task created
- ⚡ Priority changed
- 📅 Due date updated
- 🌅 Daily at 8:00 AM (all pending tasks)
- ⏰ 1 hour before deadline

---

## 🛠️ Common Commands

```bash
# Start frontend only
npm run dev:frontend

# Start backend only
npm run dev:server

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 📁 File Locations

- **Backend Server**: `server.js` (root)
- **Email Service**: `lib/emailService.js`
- **Frontend App**: `src/App.jsx`
- **Task Hook**: `src/hooks/useTasks.js`
- **Env Config**: `.env.local` (create from `.env.example`)

---

## 🔄 Development Workflow

1. Create a new task in the UI
2. Check email for confirmation
3. Edit priority/due date
4. Check email for update notification
5. Watch server logs: lines starting with `[emailService]` show what's happening

---

## 🧪 Test Email Sending

To test email without creating a task:

```bash
curl -X POST http://localhost:5000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your@gmail.com",
    "eventType": "task_created",
    "taskTitle": "Test Task",
    "priority": "high",
    "dueDate": "2025-04-15T10:00",
    "userName": "John"
  }'
```

Expected response:
```json
{"success": true, "message": "Email sent"}
```

---

## 📝 Environment Variables Template

```env
# Backend
PORT=5000

# Email (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=xxxx-xxxx-xxxx-xxxx
RECIPIENT_EMAIL=your-email@gmail.com

# Firebase (pre-configured)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# ... (rest of Firebase vars in .env.local)

# Google OAuth (pre-configured)
VITE_GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## 📊 Architecture Overview

```
User Browser
    ↓
[React Frontend] (5173)
    ↓ (api calls)
[Express Backend] (5000)
    ├→ [Firestore] (Tasks, Users)
    ├→ [Nodemailer] (Gmail SMTP)
    └→ [Node-cron] (Schedulers)
```

---

## 🚢 Deploy to Production

1. Build: `npm run build`
2. Output in `dist/` folder
3. Deploy to Vercel, Netlify, or similar
4. Set environment variables in hosting dashboard
5. Backend can run on Vercel Functions or separate Node server

---

**Need more help?** See `SETUP_GUIDE.md` for comprehensive documentation.

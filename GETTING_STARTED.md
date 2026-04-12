# ✅ Getting Started Checklist

Use this checklist to track your progress getting the Study Planner running!

---

## 📋 Pre-Setup (5 min)

- [ ] You have Node.js 18+ installed (`node --version`)
- [ ] You have npm installed (`npm --version`)
- [ ] You have a Gmail account with 2FA enabled
- [ ] You have a text editor (VS Code recommended)
- [ ] You've cloned/downloaded the Study Planner repo
- [ ] You're in the project directory: `cd study-planner`

---

## 🔧 Setup (3 min)

- [ ] Install dependencies: `npm install`
  - Watch for "added X packages"
  - Should complete without errors

- [ ] Copy environment variables:
  ```bash
  cp .env.example .env.local
  ```
  - Or manually create `.env.local` from `.env.example`

---

## 📧 Configure Gmail (5 min)

Follow these exact steps:

- [ ] Go to [myaccount.google.com](https://myaccount.google.com)
- [ ] Click "Security" in left sidebar
- [ ] Enable "2-Step Verification" (if not already)
  - Google will guide you through SMS/authenticator
- [ ] Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- [ ] Select "Mail" and "Windows Computer"
- [ ] Copy the 16-character password (looks like: `xxxx-xxxx-xxxx-xxxx`)

Edit `.env.local`:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=xxxx-xxxx-xxxx-xxxx
RECIPIENT_EMAIL=your-email@gmail.com
```

- [ ] Save `.env.local`
- [ ] **Restart your terminal** after saving `.env.local`

---

## 🚀 Start the Servers (2 min)

### Terminal Tab 1 - Backend
```bash
npm run dev:server
```

- [ ] Wait for messages:
  - ✅ "Study Planner server running on port 5000"
  - 📧 "Email service ready"
  - ⏰ "Daily reminder scheduler active"
  - ⏰ "One-hour reminder scheduler active"

### Terminal Tab 2 - Frontend
```bash
npm run dev:frontend
```

- [ ] Wait for message:
  - ✨ "VITE v... ready in ... ms"

---

## 🌐 Access the App (1 min)

- [ ] Open browser
- [ ] Go to: **http://localhost:5173**
- [ ] You should see the Study Planner dashboard
- [ ] Verify dark theme is active

---

## 📝 Create Your First Task (2 min)

- [ ] Click "Add New Task" button
- [ ] Fill in form:
  - Title: "Study Chapter 5"
  - Subject: "Physics"
  - Due Date+Time: Pick a time soon (e.g., 10 min from now)
  - Priority: "High"
  - Notes: "Focus on thermodynamics"
- [ ] Click "Add Task"
- [ ] You should see:
  - ✅ Task appears in dashboard
  - 💬 Toast notification "Task created"
  - ✉️ (Wait 5 seconds) Email arrives in your inbox!

---

## 📧 Verify Email (2 min)

- [ ] Check your email (check folder: [Inbox](https://mail.google.com/mail/u/0))
- [ ] Look for email titled: **"📚 New Task Added: Study Chapter 5"**
- [ ] Email should contain:
  - Task title, subject, priority, due date
  - Study Planner branding
  - Purple gradient header
- [ ] ✅ If you got the email, it's working!

---

## 🎨 Test Dashboard Features (5 min)

- [ ] **View Today**: Create task due today
- [ ] **View Overdue**: Create task due in past
- [ ] **View Upcoming**: Create task due next week
- [ ] **View Completed**: Click checkbox on a task
- [ ] **Edit Priority**: Change a task priority
  - [ ] Verify priority change email arrives
- [ ] **Edit Due Date**: Change task deadline
  - [ ] Verify due date change email arrives
- [ ] **Delete Task**: Remove a task
- [ ] **Search**: Use search box to filter tasks
- [ ] **Dark Mode**: Toggle dark/light mode (top right)

---

## 🔧 Verify Backend API (Optional)

Test the API directly:

```bash
curl http://localhost:5000/api/health
```

- [ ] Should return: `{"status":"ok","timestamp":"<date>"}`

Test email sending:

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

- [ ] Should return: `{"success":true,"message":"Email sent"}`
- [ ] Test email should arrive

---

## 📚 Read Documentation

Now that it's working, learn how to use it:

- [ ] **Quick Reference**: Read [QUICKSTART.md](./QUICKSTART.md) (2 min)
- [ ] **Understand Setup**: Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) (20 min)
- [ ] **System Design**: Read [ARCHITECTURE.md](./ARCHITECTURE.md) (10 min)
- [ ] **Deploy to Cloud**: Bookmark [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎓 Next Steps

### Want to Customize?
- [ ] Learn React basics
- [ ] Edit `src/components/TaskForm.jsx` to add fields
- [ ] Edit `lib/emailService.js` to change email templates
- [ ] Add new cron tasks in `server.js`

### Want to Deploy?
- [ ] Read [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ ] Choose deployment platform (Vercel/Railway/Heroku)
- [ ] Set up environment variables
- [ ] Deploy!

### Want to Add Features?
- [ ] See [ARCHITECTURE.md - Extension Points](./ARCHITECTURE.md#extension-points)
- [ ] Add new email event types
- [ ] Add new scheduler jobs
- [ ] Add new API endpoints

---

## 🆘 Troubleshooting

### "Can't install dependencies"
```bash
npm cache clean --force
npm install
```

### "Backend won't start"
- [ ] Check port 5000 isn't in use: `lsof -i :5000`
- [ ] Kill existing process: `kill -9 <pid>`
- [ ] Try different port: `PORT=3001 npm run dev:server`

### "Email not sending"
- [ ] Check `.env.local` has correct Gmail credentials
- [ ] Check Gmail 2FA is enabled
- [ ] Check App Password (16 chars) is used, not regular password
- [ ] Restart terminal after editing `.env.local`
- [ ] Check server logs for `[emailService]` error message
- [ ] Try from cmd/bash directly (not WSL)

### "Frontend shows blank page"
- [ ] Check browser console (F12 → Console tab)
- [ ] Check DevTools → Network tab for failed requests
- [ ] Verify backend is running on `:5000`
- [ ] Clear browser cache: Ctrl+Shift+Delete

### "Tasks not appearing"
- [ ] Check Firebase is configured (check `.env.local`)
- [ ] Check browser console for Firebase errors
- [ ] Try creating a task and checking server logs

**More help**: [DOCUMENTATION.md](./DOCUMENTATION.md) → Troubleshooting

---

## ✨ You're Done! 🎉

If you've checked all boxes above, your Study Planner is:
- ✅ Running locally
- ✅ Creating tasks
- ✅ Sending emails
- ✅ Managing reminders

**Congratulations! Start using it!**

---

## 📞 Next Resources

- **Start Using**: Study Planner is ready on http://localhost:5173
- **Learn More**: [README.md](./README.md)
- **Quick Reference**: [QUICKSTART.md](./QUICKSTART.md)
- **Complete Guide**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Deploy**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 💡 Quick Tips

💡 **Keep servers running** - Don't close either terminal while using the app
💡 **Check spam folder** - Emails might end up there at first
💡 **Watch server logs** - Great for debugging issues
💡 **Read docs** - 90% of questions answered there
💡 **Have fun!** - You built something awesome 🚀

---

**Happy studying with Study Planner! 📚✨**

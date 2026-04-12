# 📖 Documentation Guide

Welcome! Here's how to navigate the Study Planner documentation.

---

## 🎯 Start Here (Pick Your Path)

### 🏃 **"I just want to get it running!"**
→ Read: **[QUICKSTART.md](./QUICKSTART.md)** (2 min)
- 3-step installation
- Start the dev servers
- Verify it works

### 🏗️ **"I want to understand the architecture"**
→ Read: **[ARCHITECTURE.md](./ARCHITECTURE.md)** (10 min)
- System design overview
- Component flows
- Data structures
- How everything connects

### 🚀 **"I want to deploy to production"**
→ Read: **[DEPLOYMENT.md](./DEPLOYMENT.md)** (15 min)
- Deployment checklist
- Platform-specific steps
- Security & performance
- Launch day guide

### 📚 **"I want the complete reference"**
→ Read: **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** (20 min)
- Detailed configuration
- API documentation
- Email system explanation
- Troubleshooting guide

---

## 📑 All Documentation Files

| File | Purpose | Time | Audience |
|------|---------|------|----------|
| [README.md](./README.md) | Project overview & features | 3 min | Everyone |
| [QUICKSTART.md](./QUICKSTART.md) | Fast setup guide | 2 min | New users |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Complete configuration | 20 min | Developers |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design & flows | 10 min | Technical leads |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment | 15 min | DevOps/Leads |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | What was built | 5 min | Project managers |
| [Documentation Guide](./DOCUMENTATION.md) | This file | 2 min | Everyone |

---

## 🔍 Find Answers by Topic

### ⚙️ Setup & Configuration
- **Getting started?** → [QUICKSTART.md](./QUICKSTART.md#-start-developing-in-3-steps)
- **Gmail setup?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#-%E2%9C%89-email-service-setup)
- **Environment variables?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#-initial-setup)
- **Project structure?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#-file-structure)

### 📧 Email & Notifications
- **How emails work?** → [ARCHITECTURE.md](./ARCHITECTURE.md#2%EF%B8%8F%E2%83%A3-email-notification-flow)
- **Email templates?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#-email-notifications-triggered-automatically)
- **Email troubleshooting?** → [QUICKSTART.md](./QUICKSTART.md#-common-issues--fixes)
- **Add new email event?** → [ARCHITECTURE.md](./ARCHITECTURE.md#add-new-email-event-type)

### 🔌 API & Backend
- **API endpoints?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#-api-endpoints-express-backend)
- **API examples?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#-api-endpoints-express-backend)
- **Backend structure?** → [ARCHITECTURE.md](./ARCHITECTURE.md#system-architecture)
- **Running backend?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#-running-the-application)

### ⏰ Scheduling & Reminders
- **How schedulers work?** → [ARCHITECTURE.md](./ARCHITECTURE.md#3%EF%B8%8F%E2%83%A3-scheduler-reminder-flow)
- **Modify schedules?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#-scheduler-configuration)
- **Add new scheduler?** → [ARCHITECTURE.md](./ARCHITECTURE.md#add-new-scheduler-job)
- **Scheduler not running?** → [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting-architecture-issues)

### 🎨 Frontend & UI
- **Frontend features?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#-frontend-react)
- **Component structure?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#-file-structure)
- **Dark mode?** → [README.md](./README.md#-design-aesthetic)
- **Task management?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#-frontend-features)

### 🚀 Deployment & Production
- **Deploy to Vercel?** → [DEPLOYMENT.md](./DEPLOYMENT.md#option-1-vercel-recommended)
- **Deploy to Heroku?** → [DEPLOYMENT.md](./DEPLOYMENT.md#option-3-heroku)
- **Docker deployment?** → [DEPLOYMENT.md](./DEPLOYMENT.md#option-4-docker--manual-server)
- **Security checklist?** → [DEPLOYMENT.md](./DEPLOYMENT.md#-security-checklist)
- **Performance checklist?** → [DEPLOYMENT.md](./DEPLOYMENT.md#-performance-checklist)

### 🔧 Troubleshooting
- **Quick fixes?** → [QUICKSTART.md](./QUICKSTART.md#-common-issues--fixes)
- **Detailed troubleshooting?** → [SETUP_GUIDE.md](./SETUP_GUIDE.md#-troubleshooting)
- **Architecture issues?** → [ARCHITECTURE.md](./ARCHITECTURE.md#troubleshooting-architecture-issues)

### 📊 Development
- **Project overview?** → [README.md](./README.md)
- **What was built?** → [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Next steps?** → [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md#-next-steps)
- **Extension points?** → [ARCHITECTURE.md](./ARCHITECTURE.md#extension-points)

---

## ✨ Common Tasks

### "I want to create a task and get an email"
1. Start both servers: [QUICKSTART.md](./QUICKSTART.md#3-run-backend--frontend)
2. Visit http://localhost:5173
3. Fill out the task form
4. Check your email (Gmail)
5. See it work! ✅

**Detailed guide:** [SETUP_GUIDE.md](./SETUP_GUIDE.md#-email-notifications-triggered-automatically)

### "Something isn't working!"
1. Check [QUICKSTART.md troubleshooting](./QUICKSTART.md#-common-issues--fixes)
2. Check [SETUP_GUIDE.md troubleshooting](./SETUP_GUIDE.md#-troubleshooting)
3. Check [ARCHITECTURE.md troubleshooting](./ARCHITECTURE.md#troubleshooting-architecture-issues)

### "I'm ready to go live"
1. Pre-deployment: [DEPLOYMENT.md checklist](./DEPLOYMENT.md#-%E2%9C%85-pre-deployment-verification)
2. Choose platform: [DEPLOYMENT.md platforms](./DEPLOYMENT.md#-deployment-platforms)
3. Security: [DEPLOYMENT.md security](./DEPLOYMENT.md#-security-checklist)
4. Launch: [DEPLOYMENT.md launch](./DEPLOYMENT.md#-%E2%9C%A8-launch-day-checklist)

### "I want to add a new feature"
1. Understand architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Find extension point: [ARCHITECTURE.md extensions](./ARCHITECTURE.md#extension-points)
3. Implement & test
4. Deploy: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📋 Quick Command Reference

```bash
# Install
npm install

# Development
npm run dev:server        # Backend only
npm run dev:frontend      # Frontend only

# Production
npm run build             # Build for deployment
npm run preview           # Preview build locally

# Linting
npm run lint              # Check code quality
```

See: [SETUP_GUIDE.md - Running](./SETUP_GUIDE.md#-running-the-application)

---

## 🎓 Learning Path

### For Non-Technical Users
1. [README.md](./README.md) - Understand features
2. [QUICKSTART.md](./QUICKSTART.md) - Get it running

### For Developers
1. [README.md](./README.md) - Overview
2. [QUICKSTART.md](./QUICKSTART.md) - Setup
3. [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Configuration
4. [ARCHITECTURE.md](./ARCHITECTURE.md) - Deep dive
5. [DEPLOYMENT.md](./DEPLOYMENT.md) - Production

### For DevOps/Infrastructure
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
2. [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment options
3. [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Configuration management

### For Project Managers
1. [README.md](./README.md) - Features overview
2. [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What was built
3. [DEPLOYMENT.md](./DEPLOYMENT.md) - Launch checklist

---

## 🔗 External Resources

### Gmail SMTP Setup
- [Gmail App Password Guide](https://myaccount.google.com/apppasswords)
- [Nodemailer Gmail Setup](https://nodemailer.com/smtp/gmail/)

### Scheduling
- [Node-cron Documentation](https://github.com/kelektiv/node-cron)
- [Cron Syntax Guide](https://crontab.guru)

### Deployment Platforms
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://railway.app/docs)
- [Heroku Documentation](https://devcenter.heroku.com)

### Technologies
- [Express.js Guide](https://expressjs.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## 🆘 Getting Help

### Issues?
1. **Check relevant documentation** using this guide
2. **Search error message** in docs
3. **Review troubleshooting sections**
4. **Check server logs** for detailed errors

### Still stuck?
- Check browser DevTools → Console
- Check server logs for `[emailService]` or other prefixes
- Review `.env.local` configuration
- Verify both servers are running

---

## 📞 Support Resources

**Email Problems:**
→ [SETUP_GUIDE.md - Troubleshooting Email](./SETUP_GUIDE.md#troubleshooting-email-issues)

**API Issues:**
→ [SETUP_GUIDE.md - API Documentation](./SETUP_GUIDE.md#-api-endpoints-express-backend)

**Deployment Issues:**
→ [DEPLOYMENT.md - Troubleshooting](./DEPLOYMENT.md#-common-issues--quick-fixes)

**Architecture Questions:**
→ [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## ✅ You're All Set!

Start with the appropriate guide above for your use case. 

**Most common:** [QUICKSTART.md](./QUICKSTART.md) → [SETUP_GUIDE.md](./SETUP_GUIDE.md)

**Happy coding! 🚀**

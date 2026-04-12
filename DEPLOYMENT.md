# ✅ Deployment Checklist

Use this checklist when preparing to deploy Study Planner to production.

---

## 📋 Pre-Deployment Verification

### Environment Configuration
- [ ] `.env.local` has all required variables (Gmail, Firebase, Google OAuth)
- [ ] `GMAIL_USER` and `GMAIL_PASS` are correct and tested
- [ ] `RECIPIENT_EMAIL` is set
- [ ] All `VITE_FIREBASE_*` variables are configured
- [ ] `VITE_GOOGLE_CLIENT_ID` is valid
- [ ] `PORT` environment variable is set (or defaults to 5000)

### Code Quality
- [ ] Run `npm run lint` - no errors
- [ ] All console.error logs are intentional
- [ ] No hardcoded credentials in source files
- [ ] No TODO comments left in production code
- [ ] API endpoints return valid JSON responses

### Testing
- [ ] [ ] Create a task and verify email is sent
- [ ] [ ] Edit task priority and verify notification email
- [ ] [ ] Change due date and verify update email
- [ ] [ ] Mark task complete
- [ ] [ ] Delete a task
- [ ] [ ] Test with Gmail account
- [ ] [ ] Check email formatting on mobile

### Frontend Build
- [ ] Run `npm run build` - no errors
- [ ] `dist/` folder created successfully
- [ ] Check `dist/` file sizes (reasonable?)
- [ ] Static assets are minified

### Backend Testing
- [ ] [ ] Test GET /api/health endpoint
- [ ] [ ] Test POST /api/tasks endpoint
- [ ] [ ] Test GET /api/tasks endpoint
- [ ] [ ] Test PUT /api/tasks/:id endpoint
- [ ] [ ] Test DELETE /api/tasks/:id endpoint
- [ ] [ ] Test POST /api/send-email endpoint

---

## 🌐 Deployment Platforms

### Option 1: Vercel (Recommended)

#### Frontend
- [ ] Push code to GitHub
- [ ] Link GitHub repo to Vercel
- [ ] Set environment variables:
  ```
  VITE_FIREBASE_API_KEY = ...
  VITE_FIREBASE_AUTH_DOMAIN = ...
  VITE_FIREBASE_PROJECT_ID = ...
  VITE_FIREBASE_STORAGE_BUCKET = ...
  VITE_FIREBASE_MESSAGING_SENDER_ID = ...
  VITE_FIREBASE_APP_ID = ...
  VITE_GOOGLE_CLIENT_ID = ...
  ```
- [ ] Deploy `npm run build` → `dist/` folder

#### Backend
- [ ] Create separate Vercel project for server.js
- [ ] Set environment variables:
  ```
  GMAIL_USER = ...
  GMAIL_PASS = ...
  RECIPIENT_EMAIL = ...
  PORT = 3000 (or use Vercel Functions)
  ```
- [ ] Deploy as Vercel Function or standalone Node

### Option 2: Railway.app

- [ ] Create Railway account
- [ ] Connect GitHub repo
- [ ] Set environment variables
- [ ] Deploy
- [ ] Get public URL

### Option 3: Heroku

- [ ] Create Heroku account
- [ ] `npm install -g heroku-cli`
- [ ] `heroku login`
- [ ] `heroku create study-planner-app`
- [ ] `heroku config:set GMAIL_USER=...`
- [ ] `git push heroku main`

### Option 4: Docker + Manual Server

- [ ] Create `Dockerfile`:
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  RUN npm run build
  EXPOSE 5000
  CMD ["npm", "run", "dev:server"]
  ```
- [ ] Build: `docker build -t study-planner .`
- [ ] Deploy to any cloud provider (AWS, GCP, DigitalOcean, etc.)

---

## 🔐 Security Checklist

- [ ] Remove `.env.local` from git (check `.gitignore`)
- [ ] Use HTTPS in production URLs
- [ ] Enable Firebase Firestore security rules
- [ ] Test CORS configuration (only allow needed origins)
- [ ] Validate all API inputs
- [ ] Set Gmail App Password (not main password)
- [ ] Enable 2FA on Gmail account
- [ ] Monitor server logs for errors
- [ ] Set up error reporting (Sentry, LogRocket, etc.)

---

## 📊 Performance Checklist

- [ ] Frontend bundle size < 500KB
- [ ] Enable gzip compression on server
- [ ] Set up CDN for static assets (optional)
- [ ] Configure cache headers properly
  ```javascript
  // In Express
  app.use(express.static('dist', {
    maxAge: '1d',
    etag: false
  }))
  ```
- [ ] Run Lighthouse audit
- [ ] Test on slow 3G connection
- [ ] Optimize images in `public/` folder

---

## 📧 Email Production Setup

- [ ] Test Gmail sending with 100+ emails
- [ ] Monitor Gmail account for "unusual activity" warnings
- [ ] Consider upgrading to SendGrid/Resend for higher limits
- [ ] Set up email error handling/logging
- [ ] Monitor bounce rates
- [ ] Add unsubscribe link (if applicable)
- [ ] Test email templates on Outlook, Gmail, Apple Mail

### Gmail Limits
- **500 emails/day** for regular accounts
- **2000 emails/day** if you upgrade to Workspace

---

## 🕐 Scheduler Production Considerations

- [ ] Verify daily reminder runs at correct time
- [ ] Check 1-hour reminder accuracy
- [ ] Monitor for scheduled task failures
- [ ] Set up alerts if scheduler crashes
- [ ] Consider adding database for task history
- [ ] Add scheduler logs to monitoring dashboard

**Production-Grade Scheduler Options:**
- [ ] Bull (Redis-based task queue)
- [ ] AWS EventBridge
- [ ] Google Cloud Scheduler
- [ ] Firebase Cloud Functions

---

## 📱 Cross-Device Testing

- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on iPad (landscape/portrait)
- [ ] Test on desktop (Chrome, Firefox, Safari, Edge)
- [ ] Test form inputs on mobile
- [ ] Test task card scrolling
- [ ] Test dark mode on all devices

---

## 🔗 API Configuration Updates

### Update API URL in Frontend
If backend is on different domain:

Edit `src/apiClient.js`:
```javascript
export const apiBase = 'https://api.yourdomain.com'

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return apiBase + normalizedPath
}
```

### Update CORS Origins
In `server.js`:
```javascript
cors({
  origin: [
    'https://yourfrontend.com',
    'https://www.yourfrontend.com'
  ],
  credentials: true
})
```

---

## 📝 Final Deployment Steps

1. **Build & Test Locally**
   ```bash
   npm run build
   npm run dev:server
   npm run preview  # or serve dist/ folder
   ```

2. **Push to Production Repository**
   ```bash
   git add .
   git commit -m "chore: production deployment"
   git push origin main
   ```

3. **Deploy Frontend**
   - Vercel: Auto-deploys on push
   - Manual: Upload `dist/` folder

4. **Deploy Backend**
   - Set all environment variables
   - Update API URLs
   - Start server

5. **Verify Production**
   - [ ] Visit production URL
   - [ ] Create test task
   - [ ] Check for email
   - [ ] Monitor server logs
   - [ ] Check error reporting

6. **Post-Deployment**
   - [ ] Monitor server health
   - [ ] Check email delivery
   - [ ] Monitor user activity
   - [ ] Collect feedback

---

## 🚨 Emergency Rollback

If issues occur in production:

```bash
# Stop current deployment
# Revert to last working version
git revert <commit-hash>

# Redeploy
git push origin main
```

### Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| Emails not sending | Check `.env` variables, Gmail 2FA |
| Tasks not saving | Check Firebase rules, network |
| Frontend errors | Check browser console, API URL |
| Backend crashes | Check server logs, memory usage |
| Scheduler not running | Restart server, check system time |

---

## 📈 Post-Launch Monitoring

### Tools to Set Up

- **Error Tracking**: Sentry, LogRocket, or Rollbar
- **Uptime Monitoring**: UptimeRobot, Healthchecks.io
- **Performance**: New Relic, DataDog
- **Logging**: ELK Stack, Papertrail, LogDNA
- **Analytics**: Google Analytics, Mixpanel

### Key Metrics to Monitor

- [ ] Page load time (target: < 2s)
- [ ] API response time (target: < 200ms)
- [ ] Error rate (target: < 0.1%)
- [ ] Email delivery rate (target: > 99%)
- [ ] Scheduler execution time
- [ ] Active users count
- [ ] Task creation rate

---

## ✨ Launch Day Checklist

- [ ] All team members notified
- [ ] Monitoring tools active
- [ ] Support channel ready
- [ ] Backup systems tested
- [ ] Rollback plan documented
- [ ] Status page ready
- [ ] Team on standby for first 24 hours

---

## 📞 Support Contacts

- **Production Issues**: [on-call team]
- **Email Problems**: Gmail support
- **Firebase Issues**: Firebase support
- **Server Down**: Infrastructure team

---

**🎉 Deployment Complete!**

Monitor the logs and celebrate! 🚀

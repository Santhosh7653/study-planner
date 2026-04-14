# Study Planner

A React + Vite frontend with an Express.js backend, originally built for Vercel and migrated to Replit.

## Architecture

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Framer Motion
- **Backend**: Express.js API server (`server.js`)
- **Auth & DB**: Firebase (Firestore + Auth)
- **Email**: Nodemailer via Gmail SMTP
- **Scheduler**: node-cron for deadline reminders

## Port Setup (Replit)

| Service | Port |
|---|---|
| Vite dev server (webview) | 5000 |
| Express API server | 3001 |

Vite proxies `/api/*` requests to `http://localhost:3001`.

## Running the App

```bash
npm run dev
```

This concurrently starts:
1. `node server.js` — Express API on port 3001
2. `vite --host 0.0.0.0 --port 5000` — React dev server on port 5000

## Required Environment Secrets

Set these in the Replit Secrets panel:

| Secret | Purpose |
|---|---|
| `GMAIL_USER` | Gmail address for sending emails |
| `GMAIL_PASS` | Gmail App Password (16-char) |
| `RECIPIENT_EMAIL` | Default email recipient for reminders |
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

Email functionality gracefully degrades if `GMAIL_USER`/`GMAIL_PASS` are not set.

## Notes

- CORS is configured to accept `*.replit.dev`, `*.repl.co`, and `*.replit.app` origins
- `vercel.json` remains for reference but is not used in Replit

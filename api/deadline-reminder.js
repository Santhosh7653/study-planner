/**
 * GET /api/deadline-reminder
 *
 * Vercel Cron Job — runs every 15 minutes.
 * Checks for tasks due in ~1 hour or due now and sends reminder emails.
 * Records `reminderSent` and `alertSent` flags to prevent duplicate alerts.
 */
import { runReminderScheduler } from '../lib/reminderScheduler.js'

function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true
  return req.headers['authorization'] === `Bearer ${cronSecret}`
}

export default async function handler(req, res) {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const result = await runReminderScheduler()
    return res.status(200).json(result)
  } catch (err) {
    console.error('[deadline-reminder] Error:', err)
    return res.status(500).json({ error: err.message })
  }
}

const { google } = require('googleapis')
const { defineString } = require('firebase-functions/params')

const GOOGLE_CLIENT_ID     = defineString('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = defineString('GOOGLE_CLIENT_SECRET')

/**
 * Build an OAuth2 client from a stored refresh token.
 * The refresh token is saved in Firestore when the user connects Google Calendar.
 */
function buildOAuthClient(refreshToken) {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID.value(),
    GOOGLE_CLIENT_SECRET.value(),
    'postmessage' // redirect_uri used for token exchange from the frontend
  )
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  return oauth2Client
}

/**
 * Create a Google Calendar event for a task.
 * @param {string} refreshToken  — user's stored OAuth refresh token
 * @param {{ id: string, title: string, deadline: string, priority: string, notes?: string }} task
 * @returns {Promise<string>} eventId
 */
async function createCalendarEvent(refreshToken, task) {
  const auth     = buildOAuthClient(refreshToken)
  const calendar = google.calendar({ version: 'v3', auth })

  const start = new Date(task.deadline)
  const end   = new Date(start.getTime() + 60 * 60 * 1000) // 1-hour block

  const priorityLabel = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' }[task.priority] || task.priority

  const event = {
    summary: `📚 ${task.title}`,
    description: [
      `Priority: ${priorityLabel}`,
      task.notes ? `Notes: ${task.notes}` : '',
      '',
      'Created by Study Planner',
    ].filter(Boolean).join('\n'),
    start: { dateTime: start.toISOString() },
    end:   { dateTime: end.toISOString() },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },  // 1 hour before
        { method: 'email', minutes: 60 },  // email 1 hour before
        { method: 'popup', minutes: 10 },  // 10 min before
      ],
    },
    colorId: task.priority === 'high' ? '11' : task.priority === 'medium' ? '5' : '2',
    // 11=tomato(red), 5=banana(yellow), 2=sage(green)
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  })

  return response.data.id
}

/**
 * Update an existing calendar event when a task is edited.
 */
async function updateCalendarEvent(refreshToken, eventId, task) {
  const auth     = buildOAuthClient(refreshToken)
  const calendar = google.calendar({ version: 'v3', auth })

  const start = new Date(task.deadline)
  const end   = new Date(start.getTime() + 60 * 60 * 1000)

  await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    resource: {
      summary: `📚 ${task.title}`,
      start: { dateTime: start.toISOString() },
      end:   { dateTime: end.toISOString() },
    },
  })
}

/**
 * Delete a calendar event when a task is deleted.
 */
async function deleteCalendarEvent(refreshToken, eventId) {
  const auth     = buildOAuthClient(refreshToken)
  const calendar = google.calendar({ version: 'v3', auth })

  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  })
}

module.exports = { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent }

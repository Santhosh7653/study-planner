const BASE_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

// Format a datetime string for the Google Calendar API.
// Uses the browser's local timezone automatically.
function formatDateTime(dateString) {
  return {
    dateTime: new Date(dateString).toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

// Build a Calendar event object from a task.
// Supports both `deadline` (TaskModal) and `date` field names.
function buildEvent(task) {
  const start = task.deadline || task.date
  if (!start) throw new Error('Task has no deadline/date — cannot create Calendar event.')
  return {
    summary: task.title,
    description: task.notes || task.description || '',
    start: formatDateTime(start),
    end: formatDateTime(new Date(new Date(start).getTime() + 60 * 60 * 1000)), // +1 hour
  }
}

// 🟢 CREATE — adds a new event and returns the created event object (contains .id)
export async function createCalendarEvent(task, accessToken) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildEvent(task)),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('[Calendar] createCalendarEvent failed:', data)
    // Token expired — clear it so the user is prompted to reconnect
    if (res.status === 401) localStorage.removeItem('googleAccessToken')
    throw new Error(data?.error?.message || 'Failed to create Calendar event.')
  }

  return data // data.id is the Google Calendar event ID
}

// 🟡 UPDATE — replaces an existing event
export async function updateCalendarEvent(eventId, task, accessToken) {
  const res = await fetch(`${BASE_URL}/${eventId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildEvent(task)),
  })

  if (!res.ok) {
    const data = await res.json()
    console.error('[Calendar] updateCalendarEvent failed:', data)
    if (res.status === 401) localStorage.removeItem('googleAccessToken')
    throw new Error(data?.error?.message || 'Failed to update Calendar event.')
  }

  return res.json()
}

// 🔴 DELETE — removes an event (204 No Content on success)
export async function deleteCalendarEvent(eventId, accessToken) {
  const res = await fetch(`${BASE_URL}/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok && res.status !== 404) {
    // 404 means already deleted — treat as success
    if (res.status === 401) localStorage.removeItem('googleAccessToken')
    throw new Error('Failed to delete Calendar event.')
  }

  return true
}

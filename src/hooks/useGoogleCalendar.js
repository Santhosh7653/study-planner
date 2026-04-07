import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../firebase'

const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_URL || 'https://us-central1-study-planner-af5b2.cloudfunctions.net'
const CLIENT_ID      = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export function useGoogleCalendar(userId) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')

  // Listen to the user's profile for calendarConnected flag
  useEffect(() => {
    if (!userId) return
    const ref = doc(db, 'users', userId, 'profile', 'data')
    const unsub = onSnapshot(ref, (snap) => {
      setConnected(snap.exists() && !!snap.data()?.calendarConnected)
    })
    return unsub
  }, [userId])

  const connect = () => {
    if (!CLIENT_ID) {
      setError('VITE_GOOGLE_CLIENT_ID is not set in .env')
      return
    }

    setConnecting(true)
    setError('')

    // redirect_uri must be the exact URL registered in Google Cloud Console
    const redirectUri = `${window.location.origin}/oauth-callback.html`

    // Open Google OAuth consent screen in a popup
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/calendar.events',
        'openid',
        'email',
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
    })

    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      'google-oauth',
      'width=500,height=600,scrollbars=yes'
    )

    // Listen for the auth code from the popup
    const handler = async (event) => {
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'GOOGLE_OAUTH_CODE') return

      window.removeEventListener('message', handler)
      popup?.close()

      try {
        const idToken = await auth.currentUser?.getIdToken()
        const res = await fetch(`${FUNCTIONS_BASE}/connectGoogleCalendar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ code: event.data.code, userId }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to connect')
        setConnected(true)
      } catch (err) {
        setError(err.message)
      } finally {
        setConnecting(false)
      }
    }

    window.addEventListener('message', handler)
  }

  return { connected, connecting, error, connect }
}

import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export function useGoogleCalendar(userId) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')

  // Fast local check on mount
  useEffect(() => {
    if (localStorage.getItem('googleAccessToken')) setConnected(true)
  }, [])

  // Firestore listener for cross-device connected state
  useEffect(() => {
    if (!userId) return
    const ref = doc(db, 'users', userId, 'profile', 'data')
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists() && snap.data()?.calendarConnected) {
        setConnected(true)
      }
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

    // Implicit flow: Google returns access_token in the URL hash of the redirect page.
    // No server-side code exchange needed.
    const redirectUri = `${window.location.origin}/oauth-callback.html`

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'https://www.googleapis.com/auth/calendar.events email openid',
      include_granted_scopes: 'true',
    })

    const popup = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      'google-calendar-oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    )

    if (!popup) {
      setError('Popup was blocked. Please allow popups for this site and try again.')
      setConnecting(false)
      return
    }

    const handler = async (event) => {
      // Only accept messages from our own origin
      if (event.origin !== window.location.origin) return
      if (event.data?.type !== 'GOOGLE_OAUTH_TOKEN') return

      window.removeEventListener('message', handler)
      clearInterval(pollClosed)
      popup?.close()

      try {
        const { access_token } = event.data
        if (!access_token) throw new Error('No access token received from Google.')

        localStorage.setItem('googleAccessToken', access_token)
        setConnected(true)

        // Persist connected state in Firestore for cross-device awareness
        if (userId) {
          await setDoc(
            doc(db, 'users', userId, 'profile', 'data'),
            { calendarConnected: true },
            { merge: true }
          )
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setConnecting(false)
      }
    }

    window.addEventListener('message', handler)

    // Detect if user closes the popup without completing OAuth
    const pollClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollClosed)
        window.removeEventListener('message', handler)
        setConnecting(false)
      }
    }, 500)
  }

  const disconnect = async () => {
    localStorage.removeItem('googleAccessToken')
    setConnected(false)
    if (userId) {
      try {
        await setDoc(
          doc(db, 'users', userId, 'profile', 'data'),
          { calendarConnected: false },
          { merge: true }
        )
      } catch (err) {
        console.warn('[useGoogleCalendar] disconnect Firestore update failed:', err.message)
      }
    }
  }

  return { connected, connecting, error, connect, disconnect }
}

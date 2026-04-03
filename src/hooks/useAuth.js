import { useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase'

const FUNCTIONS_BASE = import.meta.env.VITE_FUNCTIONS_URL || 'https://us-central1-study-planner-af5b2.cloudfunctions.net'

async function saveProfile(user, username) {
  try {
    const idToken = await user.getIdToken()
    await fetch(`${FUNCTIONS_BASE}/saveUserProfile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ userId: user.uid, email: user.email, username }),
    })
  } catch (err) {
    console.warn('[useAuth] saveProfile failed (non-critical):', err.message)
  }
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null) // null = resolving, false = logged out
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      console.error('[useAuth] Firebase is not configured. Check your .env file.')
      setAuthLoading(false)
      setCurrentUser(false)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setCurrentUser(
          firebaseUser
            ? {
                id: firebaseUser.uid,
                username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                email: firebaseUser.email,
              }
            : false
        )
        setAuthLoading(false)
      },
      (err) => {
        console.error('[useAuth] onAuthStateChanged error:', err)
        setCurrentUser(false)
        setAuthLoading(false)
      }
    )
    return unsubscribe
  }, [])

  const signup = async ({ username, email, password }) => {
    if (!isFirebaseConfigured) {
      return { error: 'Firebase is not configured. Add your VITE_FIREBASE_* keys to .env.' }
    }
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName: username })
      await saveProfile(user, username) // persist email for Cloud Functions
      return { success: true }
    } catch (err) {
      console.error('[useAuth] signup error:', err.code, err.message)
      return { error: friendlyError(err.code, err.message) }
    }
  }

  const login = async ({ email, password }) => {
    if (!isFirebaseConfigured) {
      return { error: 'Firebase is not configured. Add your VITE_FIREBASE_* keys to .env.' }
    }
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      await saveProfile(user, user.displayName) // refresh profile on each login
      return { success: true }
    } catch (err) {
      console.error('[useAuth] login error:', err.code, err.message)
      return { error: friendlyError(err.code, err.message) }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('[useAuth] logout error:', err)
    }
  }

  return { currentUser, authLoading, login, signup, logout }
}

function friendlyError(code, message = '') {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try signing in instead.'
    case 'auth/invalid-email':
      return 'Invalid email format. Please check and try again.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.'
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Firebase API key is invalid. Check your .env configuration.'
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection and try again.'
    case 'auth/app-not-authorized':
      return 'This app is not authorized to use Firebase Authentication.'
    default:
      // Surface the raw code in the message so it's actionable
      return `Authentication error (${code || 'unknown'}). Check the browser console for details.`
  }
}

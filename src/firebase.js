import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// ── Debug: log all VITE_ env vars so you can verify them in the browser console
// Remove this line once confirmed working in production
console.log('[Firebase] env check:', import.meta.env)

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k)

if (missingKeys.length > 0) {
  console.error(
    '[Firebase] Missing config keys:', missingKeys.join(', '),
    '\nIf this is production, add these as Environment Variables in your Vercel project dashboard.',
    '\nVercel Dashboard → Project → Settings → Environment Variables',
  )
}

export const isFirebaseConfigured = missingKeys.length === 0

// Always initialize — Firebase handles missing keys gracefully enough
// for the app to render; auth/db calls will fail with clear errors
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

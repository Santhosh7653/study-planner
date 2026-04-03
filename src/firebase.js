import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// ─── Config ────────────────────────────────────────────────────────────────
// Option A (recommended): set these in a .env file at the project root:
//   VITE_FIREBASE_API_KEY=AIza...
//   VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
//   VITE_FIREBASE_PROJECT_ID=your-app
//   VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
//   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
//   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
//
// Option B (quick test): replace the empty strings below directly.
// ───────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "",
}

// Warn loudly in the console if any key is missing so it's easy to spot
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k)

if (missingKeys.length > 0) {
  console.error(
    '[Firebase] Missing config keys:',
    missingKeys.join(', '),
    '\nAdd them to your .env file as VITE_FIREBASE_* variables.',
  )
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const isFirebaseConfigured = missingKeys.length === 0

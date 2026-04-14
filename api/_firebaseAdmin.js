/**
 * Shared Firebase Admin SDK initializer.
 * Safe to import from multiple serverless functions — initializes only once.
 */
import admin from 'firebase-admin'

if (!admin.apps.length) {
  let privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (privateKey) {
    // Strip surrounding quotes added by some secret managers
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1)
    }
    // Unescape any level of escaped newlines (\\n → \n → real newline)
    privateKey = privateKey.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n')
  }

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    console.error('[firebaseAdmin] Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY env vars.')
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId:   process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      })
      console.log('[firebaseAdmin] Firebase Admin initialized successfully')
    } catch (err) {
      console.error('[firebaseAdmin] Failed to initialize Firebase Admin:', err.message)
    }
  }
}

export const adminDb   = admin.apps.length ? admin.firestore() : null
export const adminAuth = admin.apps.length ? admin.auth()      : null
export default admin

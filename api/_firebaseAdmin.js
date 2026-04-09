/**
 * Shared Firebase Admin SDK initializer.
 * Safe to import from multiple serverless functions — initializes only once.
 */
import admin from 'firebase-admin'

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    console.error('[firebaseAdmin] Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY env vars.')
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    })
  }
}

export const adminDb   = admin.apps.length ? admin.firestore() : null
export const adminAuth = admin.apps.length ? admin.auth()      : null
export default admin

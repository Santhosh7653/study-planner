import admin from 'firebase-admin';
import { google } from 'googleapis';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines with actual newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { credential, userId } = req.body;
    if (!credential || !userId) return res.status(400).send('Missing credential or userId');

    const oauth2Client = new google.auth.OAuth2(
      process.env.VITE_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'postmessage'
    );

    // Exchange the credential code for tokens
    const { tokens } = await oauth2Client.getToken({ code: credential });
    if (!tokens.refresh_token) {
      return res.status(400).send('No refresh token returned. Make sure Calendar scope is included.');
    }

    // Save refresh token in Firestore
    await db.collection('users').doc(userId).set(
      { googleRefreshToken: tokens.refresh_token },
      { merge: true }
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error saving Google token:', err);
    return res.status(500).json({ error: 'Failed to save Google token' });
  }
}
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const { google } = require('googleapis')

admin.initializeApp()
const db = admin.firestore()

// Use environment variables for your Client ID/Secret
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

/**
 * Cloud Function endpoint to save Google refresh token
 * Receives: { credential, userId } from frontend
 */
exports.saveGoogleToken = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

    const { credential, userId } = req.body
    if (!credential || !userId) return res.status(400).send('Missing credential or userId')

    // Build OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      'postmessage'
    )

    // Exchange the credential code for tokens
    const { tokens } = await oauth2Client.getToken({ code: credential })
    if (!tokens.refresh_token) {
      return res.status(400).send('No refresh token returned. Make sure scope includes calendar access.')
    }

    // Save refresh token in Firestore under users/{userId}/tokens
    await db.collection('users').doc(userId).set(
      { googleRefreshToken: tokens.refresh_token },
      { merge: true }
    )

    return res.status(200).send({ success: true })
  } catch (err) {
    console.error('Error saving Google token:', err)
    return res.status(500).send({ error: 'Failed to save Google token' })
  }
})
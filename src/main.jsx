import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerServiceWorker } from './registerSW'

// Register PWA service worker
//registerServiceWorker()

// No GoogleOAuthProvider here — Google sign-in is handled via Firebase signInWithPopup
// in useAuth.js, which avoids duplicate GSI initialization warnings entirely.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

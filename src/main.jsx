import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TimeProvider } from './context/TimeContext.jsx'

async function unregisterServiceWorkers() {
  if (!('serviceWorker' in navigator)) return
  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((registration) => registration.unregister()))
}

unregisterServiceWorkers()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TimeProvider>
      <App />
    </TimeProvider>
  </StrictMode>,
)

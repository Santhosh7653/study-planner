// All frontend API calls should use the same-origin /api path.
// This keeps dev and production environments consistent.
export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return normalizedPath
}

export const apiBase = ''

/**
 * A safe fetch wrapper that catches network/API errors and returns null
 * instead of throwing, so the app renders even if the API is unavailable.
 */
export async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options)
    if (!res.ok) {
      console.warn(`[apiClient] ${options?.method || 'GET'} ${url} → ${res.status}`)
    }
    return res
  } catch (err) {
    console.warn(`[apiClient] fetch failed for ${url}:`, err.message)
    return null
  }
}
export async function sendEmailNotification(type, payload) {
  try {
    const body = JSON.stringify({ eventType: type, ...payload })
    console.log('[apiClient] Sending to /api/send-email:', body)
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body,
    })

    const text = await response.text()
    console.log('[apiClient] Raw response:', response.status, text)
    
    let data
    try { data = JSON.parse(text) } catch { data = { success: false, raw: text } }
    
    if (!response.ok) {
      console.warn('[apiClient] Email API error:', response.status, data)
      return { success: false, reason: data?.error || text }
    }
    
    return data
  } catch (err) {
    console.warn('[apiClient] fetch failed:', err.message)
    return { success: false, reason: err.message }
  }
}
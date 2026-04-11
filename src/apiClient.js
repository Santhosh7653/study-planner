// In development (`vercel dev`): Vercel owns port 3000 and proxies /api/* to serverless functions.
// In development (`npm run dev` only, no Vercel): API calls go to http://localhost:3000.
// In production: API calls use relative /api paths (same origin).
const localApiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const prodApiBase = ''
export const apiBase = import.meta.env.DEV ? localApiBase : prodApiBase

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${apiBase}${normalizedPath}`
}

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

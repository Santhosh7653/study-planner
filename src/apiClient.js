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

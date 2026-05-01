const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ngrok free tier shows an interstitial page unless this header is present
const NGROK_HEADER = API_BASE_URL?.includes('ngrok') ? { 'ngrok-skip-browser-warning': '1' } : {}

let isRefreshing = false

function toQueryString(query = {}) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

async function tryRefresh() {
  if (isRefreshing) return false
  isRefreshing = true
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { ...NGROK_HEADER },
    })
    return res.ok
  } catch {
    return false
  } finally {
    isRefreshing = false
  }
}

export async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('Missing VITE_API_BASE_URL environment variable')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...NGROK_HEADER,
      ...(options.headers ?? {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  if (response.status === 401 && path !== '/auth/refresh' && path !== '/auth/me') {
    const refreshed = await tryRefresh()
    if (refreshed) {
      const retry = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method ?? 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...NGROK_HEADER,
          ...(options.headers ?? {})
        },
        body: options.body ? JSON.stringify(options.body) : undefined
      })
      if (retry.status === 401) {
        window.location.href = '/login'
        throw new Error('Session expired')
      }
      if (retry.status === 204) return null
      const retryPayload = await retry.json().catch(() => null)
      if (!retry.ok) throw new Error(retryPayload?.message ?? 'Request failed')
      return retryPayload
    } else {
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  if (response.status === 204) {
    return null
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload?.message ?? 'Request failed'
    throw new Error(message)
  }

  return payload
}

export { toQueryString }
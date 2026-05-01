/* eslint-disable react-refresh/only-export-components -- context files intentionally export both provider and hook */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { apiRequest } from '../../lib/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading, null = unauthenticated
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiRequest('/auth/me')
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch {
      // ignore errors — always clear local state and redirect
    }
    setUser(null)
    window.location.href = '/login'
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

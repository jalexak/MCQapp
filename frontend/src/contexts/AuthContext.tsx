import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

interface User {
  id: string
  email: string
  name: string | null
  role: 'user' | 'admin'
  subscriptionStatus: string
  subscriptionEnd: string | null
  createdAt: string
  updatedAt: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'frcr_access_token'
const REFRESH_KEY = 'frcr_refresh_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const getAccessToken = () => localStorage.getItem(TOKEN_KEY)
  const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)

  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_KEY, refreshToken)
  }

  const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
  }

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAccessToken()
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }

    let response = await fetch(url, { ...options, headers })

    // If token expired, try to refresh
    if (response.status === 401 && getRefreshToken()) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        const newToken = getAccessToken()
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`
          }
        })
      }
    }

    return response
  }

  const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem(TOKEN_KEY, data.accessToken)
        return true
      } else {
        clearTokens()
        setUser(null)
        return false
      }
    } catch {
      clearTokens()
      setUser(null)
      return false
    }
  }

  const fetchCurrentUser = async () => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await fetchWithAuth(`${API_URL}/auth/me`)
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        clearTokens()
        setUser(null)
      }
    } catch {
      clearTokens()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Login failed')
    }

    const data = await response.json()
    setTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
  }

  const register = async (email: string, password: string, name?: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Registration failed')
    }

    const data = await response.json()
    setTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
  }

  const logout = async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        })
      } catch {
        // Ignore logout errors
      }
    }
    clearTokens()
    setUser(null)
  }

  const refreshUser = async () => {
    await fetchCurrentUser()
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Export fetchWithAuth for use in other components
export function useAuthFetch() {
  const getAccessToken = () => localStorage.getItem(TOKEN_KEY)
  const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAccessToken()
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }

    let response = await fetch(url, { ...options, headers })

    // If token expired, try to refresh
    if (response.status === 401 && getRefreshToken()) {
      const refreshToken = getRefreshToken()
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })

      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        localStorage.setItem(TOKEN_KEY, data.accessToken)
        const newToken = data.accessToken
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`
          }
        })
      }
    }

    return response
  }

  return fetchWithAuth
}

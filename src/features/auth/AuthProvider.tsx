import { useEffect, useState, type ReactNode } from 'react'
import { getCurrentUser, login } from './auth.api'
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from './auth.storage'
import { AuthContext, type AuthContextValue } from './auth.context'
import type { AuthUser } from '../../types/auth'
import type { CurrentUser } from '../../types/user'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setToken] = useState<string | null>(getAccessToken())
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeSession = async () => {
      const token = getAccessToken()

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await getCurrentUser()
        setToken(token)
        setUser(currentUser)
      } catch {
        clearAccessToken()
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void initializeSession()
  }, [])

  const handleLogin = async (
    email: string,
    password: string,
  ): Promise<AuthUser> => {
    setIsLoading(true)

    try {
      const response = await login({
        email,
        password,
      })

      setAccessToken(response.accessToken)
      setToken(response.accessToken)

      const currentUser = await getCurrentUser()
      setUser(currentUser)

      return response.user
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearAccessToken()
    setToken(null)
    setUser(null)
  }

  const value: AuthContextValue = {
    user,
    accessToken,
    isAuthenticated: Boolean(accessToken) && user !== null,
    isLoading,
    login: handleLogin,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

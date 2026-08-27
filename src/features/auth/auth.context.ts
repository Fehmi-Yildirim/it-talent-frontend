import { createContext } from 'react'
import type { AuthUser } from '../../types/auth'
import type { CurrentUser } from '../../types/user'

export interface AuthContextValue {
  user: CurrentUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

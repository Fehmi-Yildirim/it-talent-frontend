import type { UserRole, UserStatus } from './user'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  status: UserStatus
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
}

export interface RegisterRequest {
  email: string
  password: string
  role: 'CANDIDATE' | 'RECRUITER'
}

export interface LoginRequest {
  email: string
  password: string
}

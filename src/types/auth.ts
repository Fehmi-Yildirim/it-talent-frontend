import type { UserRole, UserStatus } from './user'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  status: UserStatus
  isDemo: boolean
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'CANDIDATE' | 'RECRUITER'
}

export interface RegisterResponse {
  user: AuthUser
  message: string
}

export interface LoginRequest {
  email: string
  password: string
}
import { apiClient } from '../../services/api/apiClient'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../../types/auth'
import type { CurrentUser } from '../../types/user'

export function register(data: RegisterRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/auth/register', data)
}

export function login(data: LoginRequest): Promise<AuthResponse> {
  return apiClient.post<AuthResponse>('/auth/login', data)
}

export function getCurrentUser(): Promise<CurrentUser> {
  return apiClient.get<CurrentUser>('/users/me')
}

export interface UpdateUserRequest {
  firstName: string
  lastName: string
}

export function updateCurrentUser(
  data: UpdateUserRequest,
): Promise<CurrentUser> {
  return apiClient.patch<CurrentUser>('/users/me', data)
}
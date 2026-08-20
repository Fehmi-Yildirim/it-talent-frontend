import { apiClient } from '../../services/api/apiClient'
import type { AuthResponse } from './auth.types'

export interface RegisterRequest {
    email: string
    password: string
}

export interface LoginRequest {
    email: string
    password: string
}

export function register(
    data: RegisterRequest,
): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data)
}

export function login(
    data: LoginRequest,
): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', data)
}
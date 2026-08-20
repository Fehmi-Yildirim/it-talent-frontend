export type AuthUserStatus = 'PENDING' | 'ACTIVE'

export interface AuthUser {
    id: string
    email: string
    role: string
    status: string
}

export interface AuthResponse {
    user: AuthUser
    accessToken: string
}
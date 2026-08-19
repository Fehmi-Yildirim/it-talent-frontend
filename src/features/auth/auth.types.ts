export interface AuthUser {
    id: string
    email: string
    role: string
}

export interface AuthResponse {
    user: AuthUser
    accessToken: string
}
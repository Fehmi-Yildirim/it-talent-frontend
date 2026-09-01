import { getAccessToken } from '../auth/auth.storage'
import type { User, UserRole, UserStatus } from '../../types/user'

const API_BASE_URL = '/api/v1'

interface UpdateUserRequest {
    email?: string
    role?: UserRole
    status?: UserStatus
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getAccessToken()

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    })

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
    }

    if (response.status === 204) {
        return undefined as T
    }

    return response.json() as Promise<T>
}

export async function getUsers(): Promise<User[]> {
    return apiRequest<User[]>('/users')
}

export async function getUser(id: string): Promise<User> {
    return apiRequest<User>(`/users/${id}`)
}

export async function updateUser(
    id: string,
    data: UpdateUserRequest,
): Promise<User> {
    return apiRequest<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    })
}

export async function deleteUser(id: string): Promise<void> {
    await apiRequest<void>(`/users/${id}`, {
        method: 'DELETE',
    })
}

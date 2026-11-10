import { apiClient } from '../../services/api/apiClient'
import type { User, UserRole, UserStatus } from '../../types/user'

export interface UpdateUserRequest {
    email?: string
    role?: UserRole
    status?: UserStatus
}

export async function getUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/users')
}

export async function getUser(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`)
}

export async function updateUser(
    id: string,
    data: UpdateUserRequest,
): Promise<User> {
    return apiClient.patch<User>(`/users/${id}`, data)
}

export async function deleteUser(id: string): Promise<void> {
    await apiClient.delete<void>(`/users/${id}`)
}

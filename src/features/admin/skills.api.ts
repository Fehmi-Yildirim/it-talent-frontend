import { getAccessToken } from '../auth/auth.storage'
import type { Skill } from '../../types/candidate'

const API_BASE_URL = '/api/v1'

interface SkillInput {
    name: string
    slug: string
    category: string
    description?: string | null
}

interface ApiError {
    message?: string
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
        let message = `API request failed: ${response.status}`

        try {
            const error = (await response.json()) as ApiError

            if (error.message) {
                message = error.message
            }
        } catch {
            // Keep the default HTTP error message.
        }

        throw new Error(message)
    }

    if (response.status === 204) {
        return undefined as T
    }

    return response.json() as Promise<T>
}

export async function getSkills(search?: string): Promise<Skill[]> {
    const query = search
        ? `?search=${encodeURIComponent(search)}`
        : ''

    return apiRequest<Skill[]>(`/skills${query}`)
}

export async function createSkill(
    data: SkillInput,
): Promise<Skill> {
    return apiRequest<Skill>('/skills', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export async function updateSkill(
    id: string,
    data: SkillInput,
): Promise<Skill> {
    return apiRequest<Skill>(`/skills/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    })
}

export async function deleteSkill(id: string): Promise<void> {
    await apiRequest<void>(`/skills/${id}`, {
        method: 'DELETE',
    })
}

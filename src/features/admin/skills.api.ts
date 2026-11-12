
import { apiClient } from '../../services/api/apiClient'
import type { Skill } from '../../types/candidate'

interface SkillInput {
    name: string
    category: string
    description?: string | null
}

export async function getSkills(search?: string): Promise<Skill[]> {
    const query = search
        ? `?search=${encodeURIComponent(search)}`
        : ''

    return apiClient.get<Skill[]>(`/skills${query}`)
}

export async function createSkill(
    data: SkillInput,
): Promise<Skill> {
    return apiClient.post<Skill>('/skills', data)
}

export async function updateSkill(
    id: string,
    data: SkillInput,
): Promise<Skill> {
    return apiClient.patch<Skill>(`/skills/${id}`, data)
}

export async function deleteSkill(id: string): Promise<void> {
    await apiClient.delete<void>(`/skills/${id}`)
}

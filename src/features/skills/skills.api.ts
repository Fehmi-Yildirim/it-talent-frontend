import { apiClient } from '../../services/api/apiClient'

import type { Skill } from '../../types/job'

export function getSkills(search?: string): Promise<Skill[]> {
    const query = search
        ? `?search=${encodeURIComponent(search)}`
        : ''

    return apiClient.get<Skill[]>(`/skills${query}`)
}

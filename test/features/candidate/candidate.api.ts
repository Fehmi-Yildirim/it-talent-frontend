import { apiClient } from '../../../src/services/api/apiClient'

export interface CandidateProfile {
    id: string
    userId: string
    headline: string | null
    summary: string | null
    location: string | null
    salaryMin: number | null
    salaryMax: number | null
    currency: string | null
    availabilityDate: string | null
    remotePreference: string | null
    createdAt: string
    updatedAt: string
}

export interface CandidateProfileInput {
    headline?: string
    summary?: string
    location?: string
    salaryMin?: number
    salaryMax?: number
    currency?: string
    availabilityDate?: string
    remotePreference?: string
}

export interface CandidateSkill {
    id: string
    name: string
    slug: string
    category: string | null
    description: string | null
}


export async function getMyCandidateProfile(): Promise<CandidateProfile> {
    return apiClient.get<CandidateProfile>('/candidates/me')
}

export async function createCandidateProfile(
    data: CandidateProfileInput,
): Promise<CandidateProfile> {
    return apiClient.post<CandidateProfile>('/candidates', data)
}

export async function updateCandidateProfile(
    data: CandidateProfileInput,
): Promise<CandidateProfile> {
    return apiClient.patch<CandidateProfile>('/candidates/me', data)
}

export async function getSkills(
    search?: string,
): Promise<CandidateSkill[]> {
    const params = new URLSearchParams()

    if (search?.trim()) {
        params.set('search', search.trim())
    }

    const query = params.toString()

    return apiClient.get<CandidateSkill[]>(
        `/skills${query ? `?${query}` : ''}`,
    )
}
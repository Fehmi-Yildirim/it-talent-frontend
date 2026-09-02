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
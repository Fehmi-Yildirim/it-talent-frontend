import { apiClient } from '../../services/api/apiClient'
import type {
    RecruiterProfile,
    RecruiterProfileInput,
} from '../../types/recruiter'

export function getRecruiterProfile(): Promise<RecruiterProfile> {
    return apiClient.get<RecruiterProfile>('/recruiters/me')
}

export function updateRecruiterProfile(
    input: RecruiterProfileInput,
): Promise<RecruiterProfile> {
    return apiClient.patch<RecruiterProfile>('/recruiters/me', input)
}
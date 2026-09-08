import { apiClient } from '../../services/api/apiClient'
import type {
    CandidateDashboard,
    RecruiterDashboard,
} from '../../types/dashboard'

export function getCandidateDashboard(): Promise<CandidateDashboard> {
    return apiClient.get<CandidateDashboard>(
        '/candidates/me/dashboard',
    )
}

export function getRecruiterDashboard(): Promise<RecruiterDashboard> {
    return apiClient.get<RecruiterDashboard>(
        '/recruiters/me/dashboard',
    )
}
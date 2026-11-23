import { apiClient } from '../../services/api/apiClient'
import type {
    CandidateMatch,
    MatchingQuery,
    MatchingResponse,
    RecruiterCandidateMatch,
} from '../../types/matching'

function buildMatchingQuery(query: MatchingQuery = {}): string {
    const params = new URLSearchParams()

    if (query.page !== undefined) {
        params.set('page', String(query.page))
    }

    if (query.limit !== undefined) {
        params.set('limit', String(query.limit))
    }

    const serialized = params.toString()
    return serialized ? `?${serialized}` : ''
}

export function getMyMatches(
    query: MatchingQuery = {},
): Promise<MatchingResponse<CandidateMatch>> {
    return apiClient.get<MatchingResponse<CandidateMatch>>(
        `/matches/me${buildMatchingQuery(query)}`,
    )
}

export function getCandidatesForJob(
    jobId: string,
    query: MatchingQuery = {},
): Promise<MatchingResponse<RecruiterCandidateMatch>> {
    return apiClient.get<MatchingResponse<RecruiterCandidateMatch>>(
        `/matches/jobs/${encodeURIComponent(jobId)}/candidates${buildMatchingQuery(query)}`,
    )
}

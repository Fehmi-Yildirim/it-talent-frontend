import { apiClient } from '../../services/api/apiClient'
import type {
    CandidateMatch,
    MatchRecord,
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

    if (query.scoreRange !== undefined) {
        params.set('scoreRange', query.scoreRange)
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

export function getMyMatchForJob(
    jobId: string,
): Promise<{ data: MatchRecord | null }> {
    return apiClient.get<{ data: MatchRecord | null }>(
        `/matches/me/jobs/${encodeURIComponent(jobId)}`,
    )
}
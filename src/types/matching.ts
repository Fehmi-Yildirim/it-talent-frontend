import type { CandidateJob } from './job'

export interface MatchSkillDetail {
    skill: string
    candidateLevel: number | null
    requiredLevel: number
    required: boolean
}

export interface MatchExplanation {
    algorithm: string
    strengths: MatchSkillDetail[]
    gaps: MatchSkillDetail[]
    requirementsCount: number
}

export interface MatchRecord {
    id: string
    candidateId: string
    jobId: string
    overallScore: number | string
    skillScore: number | string | null
    experienceScore: number | string | null
    locationScore: number | string | null
    salaryScore: number | string | null
    availabilityScore: number | string | null
    preferenceScore: number | string | null
    explanation: MatchExplanation | null
    calculatedAt: string
    createdAt: string
    updatedAt: string
}

export interface CandidateMatch extends MatchRecord {
    job: CandidateJob
}

export interface MatchedCandidateSkill {
    id: string
    skillId: string
    proficiencyLevel: number
    yearsOfExperience: number | string | null
    source: string
    skill: {
        name: string
    }
}

export interface MatchedCandidate {
    id: string
    headline: string | null
    summary: string | null
    location: string | null
    salaryMin: number | string | null
    salaryMax: number | string | null
    currency: string | null
    availabilityDate: string | null
    remotePreference: string | null
    user: {
        firstName: string
        lastName: string
    }
    candidateSkills: MatchedCandidateSkill[]
}

export interface RecruiterCandidateMatch extends MatchRecord {
    candidate: MatchedCandidate
}

export interface MatchingMeta {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface MatchingResponse<TMatch> {
    data: TMatch[]
    meta: MatchingMeta
}

export interface MatchingQuery {
    page?: number
    limit?: number
}

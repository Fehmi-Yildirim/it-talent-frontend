export type UserRole =
    | 'CANDIDATE'
    | 'RECRUITER'
    | 'ADMIN'

export type UserStatus =
    | 'ACTIVE'
    | 'PENDING'
    | 'SUSPENDED'
    | 'DELETED'

export interface User {
    id: string
    email: string
    role: UserRole
    status: UserStatus
    createdAt: string
    updatedAt: string
}

export interface CurrentUser extends User {
    candidate: CandidateSummary | null
    recruiter: RecruiterSummary | null
}

export interface CandidateSummary {
    id: string
    headline: string | null
    summary: string | null
    location: string | null
    salaryMin: string | null
    salaryMax: string | null
    currency: string | null
    availabilityDate: string | null
    remotePreference: string | null
    createdAt: string
    updatedAt: string
}

export interface RecruiterSummary {
    id: string
    companyId: string | null
    jobTitle: string | null
    createdAt: string
    updatedAt: string
}
export interface RecruiterProfile {
    id: string
    userId: string
    companyId: string | null
    jobTitle: string | null
    createdAt: string
    updatedAt: string
}

export interface RecruiterProfileInput {
    jobTitle?: string
}
export type ApplicationStatus =
    | 'PENDING'
    | 'REVIEWING'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'WITHDRAWN'

export interface ApplicationJob {
    id: string
    title: string
    location: string | null
    workMode: string
    employmentType: string
    company: ApplicationCompany
}

export interface ApplicationCompany {
    id: string
    name: string
}

export interface ApplicationCandidate {
    id: string
    firstName: string
    lastName: string
}

export interface CandidateApplication {
    id: string
    jobId: string
    candidateId: string
    coverLetter: string | null
    status: ApplicationStatus
    createdAt: string
    updatedAt: string
    job: ApplicationJob
}

export interface CandidateApplicationDetail extends CandidateApplication {
    candidate: ApplicationCandidate
}

export interface RecruiterApplication {
    id: string
    jobId: string
    candidateId: string
    coverLetter: string | null
    status: ApplicationStatus
    createdAt: string
    updatedAt: string
    job: ApplicationJob
    candidate: ApplicationCandidate
}

export interface RecruiterApplicationDetail extends RecruiterApplication {
    company: ApplicationCompany
}

export interface CreateApplicationRequest {
    coverLetter?: string
}

export interface UpdateApplicationStatusRequest {
    status: ApplicationStatus
}

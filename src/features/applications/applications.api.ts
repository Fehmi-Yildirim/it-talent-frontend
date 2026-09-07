import { apiClient } from '../../services/api/apiClient'
import type {
    CandidateApplication,
    CandidateApplicationDetail,
    CreateApplicationRequest,
    RecruiterApplication,
    RecruiterApplicationDetail,
    UpdateApplicationStatusRequest,
} from '../../types/application'

export function createApplication(
    jobId: string,
    data: CreateApplicationRequest = {},
): Promise<CandidateApplication> {
    return apiClient.post<CandidateApplication>(
        `/jobs/${jobId}/applications`,
        data,
    )
}

export function getMyApplications(): Promise<CandidateApplication[]> {
    return apiClient.get<CandidateApplication[]>('/applications')
}

export function getMyApplication(
    applicationId: string,
): Promise<CandidateApplicationDetail> {
    return apiClient.get<CandidateApplicationDetail>(
        `/applications/${applicationId}`,
    )
}

export function withdrawApplication(
    applicationId: string,
): Promise<CandidateApplication> {
    return apiClient.patch<CandidateApplication>(
        `/applications/${applicationId}/withdraw`,
        {},
    )
}

export function getRecruiterApplications(): Promise<RecruiterApplication[]> {
    return apiClient.get<RecruiterApplication[]>('/recruiter/applications')
}

export function getRecruiterApplication(
    applicationId: string,
): Promise<RecruiterApplicationDetail> {
    return apiClient.get<RecruiterApplicationDetail>(
        `/recruiter/applications/${applicationId}`,
    )
}

export function updateApplicationStatus(
    applicationId: string,
    data: UpdateApplicationStatusRequest,
): Promise<RecruiterApplicationDetail> {
    return apiClient.patch<RecruiterApplicationDetail>(
        `/recruiter/applications/${applicationId}/status`,
        data,
    )
}

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
    const formData = new FormData()
    if (data.coverLetter) formData.append('coverLetter', data.coverLetter)
    if (data.cv) formData.append('cv', data.cv)
    formData.append('cvRetentionConsent', String(Boolean(data.cv && data.cvRetentionConsent)))

    return apiClient.post<CandidateApplication>(
        `/jobs/${jobId}/applications`,
        formData,
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

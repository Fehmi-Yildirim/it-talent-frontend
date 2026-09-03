import { apiClient } from '../../services/api/apiClient'

import type {
  CreateJobRequest,
  CreateJobRequirementRequest,
  Job,
  JobRequirement,
  RemoveJobRequirementResponse,
  UpdateJobRequest,
  UpdateJobRequirementsRequest,
  UpdateJobRequirementRequest,
} from '../../types/job'

export function getJobs(): Promise<Job[]> {
  return apiClient.get<Job[]>('/jobs')
}

export function getJobById(
  jobId: string,
): Promise<Job> {
  return apiClient.get<Job>(
    `/jobs/${jobId}`,
  )
}

export function createJob(
  data: CreateJobRequest,
): Promise<Job> {
  return apiClient.post<Job>(
    '/jobs',
    data,
  )
}

export function updateJob(
  jobId: string,
  data: UpdateJobRequest,
): Promise<Job> {
  return apiClient.patch<Job>(
    `/jobs/${jobId}`,
    data,
  )
}

export function publishJob(
  jobId: string,
): Promise<Job> {
  return apiClient.post<Job>(
    `/jobs/${jobId}/publish`,
  )
}

export function closeJob(
  jobId: string,
): Promise<Job> {
  return apiClient.post<Job>(
    `/jobs/${jobId}/close`,
  )
}

export function getJobRequirements(
  jobId: string,
): Promise<JobRequirement[]> {
  return apiClient.get<JobRequirement[]>(
    `/jobs/${jobId}/requirements`,
  )
}

export function updateJobRequirements(
  jobId: string,
  data: UpdateJobRequirementsRequest,
): Promise<JobRequirement[]> {
  return apiClient.patch<JobRequirement[]>(
    `/jobs/${jobId}/requirements`,
    data,
  )
}

export function createJobRequirement(
  jobId: string,
  data: CreateJobRequirementRequest,
): Promise<JobRequirement> {
  return apiClient.post<JobRequirement>(
    `/jobs/${jobId}/requirements`,
    data,
  )
}

export function updateJobRequirement(
  jobId: string,
  requirementId: string,
  data: UpdateJobRequirementRequest,
): Promise<JobRequirement> {
  return apiClient.patch<JobRequirement>(
    `/jobs/${jobId}/requirements/${requirementId}`,
    data,
  )
}

export function removeJobRequirement(
  jobId: string,
  skillId: string,
): Promise<RemoveJobRequirementResponse> {
  return apiClient.delete<RemoveJobRequirementResponse>(
    `/jobs/${jobId}/requirements/${skillId}`,
  )
}

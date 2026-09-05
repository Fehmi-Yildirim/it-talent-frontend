import { apiClient } from '../../services/api/apiClient'

import type {
  CandidateJob,
  CreateJobRequest,
  CreateJobRequirementRequest,
  Job,
  JobDiscoveryQuery,
  JobDiscoveryResponse,
  JobRequirement,
  RemoveJobRequirementResponse,
  UpdateJobRequest,
  UpdateJobRequirementsRequest,
  UpdateJobRequirementRequest,
} from '../../types/job'

function buildJobDiscoveryQuery(query: JobDiscoveryQuery): string {
  const params = new URLSearchParams()

  if (query.q?.trim()) {
    params.set('q', query.q.trim())
  }

  if (query.location?.trim()) {
    params.set('location', query.location.trim())
  }

  if (query.workMode) {
    params.set('workMode', query.workMode)
  }

  if (query.employmentType) {
    params.set('employmentType', query.employmentType)
  }

  if (query.salaryMin !== undefined) {
    params.set('salaryMin', String(query.salaryMin))
  }

  if (query.salaryMax !== undefined) {
    params.set('salaryMax', String(query.salaryMax))
  }

  if (query.skillIds && query.skillIds.length > 0) {
    params.set('skillIds', query.skillIds.join(','))
  }

  if (query.sort) {
    params.set('sort', query.sort)
  }

  if (query.page !== undefined) {
    params.set('page', String(query.page))
  }

  if (query.limit !== undefined) {
    params.set('limit', String(query.limit))
  }

  const serialized = params.toString()

  return serialized ? `?${serialized}` : ''
}

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

export function getCandidateJobs(
  query: JobDiscoveryQuery = {},
): Promise<JobDiscoveryResponse> {
  return apiClient.get<JobDiscoveryResponse>(
    `/jobs${buildJobDiscoveryQuery(query)}`,
  )
}

export function getCandidateJobById(
  jobId: string,
): Promise<CandidateJob> {
  return apiClient.get<CandidateJob>(
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
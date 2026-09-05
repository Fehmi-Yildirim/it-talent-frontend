export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'FREELANCE'
  | 'INTERNSHIP'

export type WorkMode =
  | 'ONSITE'
  | 'HYBRID'
  | 'REMOTE'
  | 'FLEXIBLE'

export type JobStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'CLOSED'

export interface Skill {
  id: string
  name: string
}

export interface JobRequirement {
  id: string
  jobId: string
  skillId: string
  required: boolean
  minimumLevel: number
  skill: Skill
}

export interface Company {
  id: string
  name: string
  slug: string
  website: string | null
  description: string | null
  location: string | null
}

export interface Job {
  id: string
  companyId: string
  createdByRecruiterId: string
  title: string
  description: string
  location: string | null
  employmentType: EmploymentType
  workMode: WorkMode
  salaryMin: string | number | null
  salaryMax: string | number | null
  currency: string | null
  expiresAt: string | null
  status: JobStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  requirements: JobRequirement[]
}

export interface CandidateJob extends Job {
  company: Company
}

export interface JobDiscoveryQuery {
  q?: string
  location?: string
  workMode?: WorkMode
  employmentType?: EmploymentType
  salaryMin?: number
  salaryMax?: number
  skillIds?: string[]
  sort?: 'newest' | 'salary' | 'title'
  page?: number
  limit?: number
}

export interface JobDiscoveryResponse {
  items: CandidateJob[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CreateJobRequest {
  title: string
  description: string
  location?: string
  employmentType: EmploymentType
  workMode: WorkMode
  salaryMin?: number
  salaryMax?: number
  currency?: string
  expiresAt?: string
  requiredSkillIds?: string[]
  preferredSkillIds?: string[]
}

export interface UpdateJobRequest {
  title?: string
  description?: string
  location?: string
  employmentType?: EmploymentType
  workMode?: WorkMode
  salaryMin?: number
  salaryMax?: number
  currency?: string
  expiresAt?: string
  requiredSkillIds?: string[]
  preferredSkillIds?: string[]
}

export interface UpdateJobRequirementsRequest {
  requiredSkillIds?: string[]
  preferredSkillIds?: string[]
}

export interface CreateJobRequirementRequest {
  skillId: string
  required: boolean
  minimumLevel: number
}

export interface UpdateJobRequirementRequest {
  required?: boolean
  minimumLevel?: number
}

export interface RemoveJobRequirementResponse {
  message: string
}
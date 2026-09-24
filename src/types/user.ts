export const USER_ROLES = {
  CANDIDATE: 'CANDIDATE',
  RECRUITER: 'RECRUITER',
  ADMIN: 'ADMIN',
} as const

export const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]
export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES]

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
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

export interface CandidateProfile {
  id: string
  userId: string
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

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

export interface CandidateProfileInput {
  headline?: string
  summary?: string
  location?: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  availabilityDate?: string
  remotePreference?: string
}

export interface CandidateSkill {
  id: string
  skillId: string
  proficiencyLevel: number
  yearsOfExperience: number
  source: string
  skill: {
    id: string
    name: string
    slug: string
    category: string
    description: string | null
  }
}

export interface CandidateSkillInput {
  skillId: string
  proficiencyLevel: number
  yearsOfExperience: number
}

export interface CandidateSkillUpdateInput {
  proficiencyLevel?: number
  yearsOfExperience?: number
}

export interface Skill {
  id: string
  name: string
  slug: string
  category: string
  description: string | null
  createdAt: string
  updatedAt: string
}
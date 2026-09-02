import { apiClient } from '../../services/api/apiClient'
import type {
  CandidateProfile,
  CandidateProfileInput,
  CandidateSkill,
  CandidateSkillInput,
  CandidateSkillUpdateInput,
  Skill,
} from '../../types/candidate'

export function getCandidateProfile(): Promise<CandidateProfile> {
  return apiClient.get<CandidateProfile>('/candidates/me')
}

export function createCandidateProfile(
  input: CandidateProfileInput,
): Promise<CandidateProfile> {
  return apiClient.post<CandidateProfile>('/candidates', input)
}

export function updateCandidateProfile(
  input: CandidateProfileInput,
): Promise<CandidateProfile> {
  return apiClient.patch<CandidateProfile>('/candidates/me', input)
}

export function getCandidateSkills(): Promise<CandidateSkill[]> {
  return apiClient.get<CandidateSkill[]>('/candidates/me/skills')
}

export function createCandidateSkill(
  input: CandidateSkillInput,
): Promise<CandidateSkill> {
  return apiClient.post<CandidateSkill>('/candidates/me/skills', input)
}

export function updateCandidateSkill(
  id: string,
  input: CandidateSkillUpdateInput,
): Promise<CandidateSkill> {
  return apiClient.patch<CandidateSkill>(
    `/candidates/me/skills/${id}`,
    input,
  )
}

export function deleteCandidateSkill(id: string): Promise<void> {
  return apiClient.delete<void>(`/candidates/me/skills/${id}`)
}

export function getSkills(search?: string): Promise<Skill[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''

  return apiClient.get<Skill[]>(`/skills${query}`)
}
import { apiClient } from '../../services/api/apiClient'
import type { CandidateProfile } from '../../types/candidate'

export function getCandidateProfile(): Promise<CandidateProfile> {
  return apiClient.get<CandidateProfile>('/users/me/candidate')
}

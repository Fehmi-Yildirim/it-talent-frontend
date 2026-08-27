import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import ProfilePage from '../../src/pages/ProfilePage'
import { useAuth } from '../../src/features/auth/useAuth'
import { getCandidateProfile } from '../../src/features/candidate/candidate.api'

vi.mock('../../src/features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../src/features/candidate/candidate.api', () => ({
  getCandidateProfile: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)
const mockedGetCandidateProfile = vi.mocked(getCandidateProfile)

const candidateUser = {
  id: 'candidate-user-id',
  email: 'candidate@example.com',
  role: 'CANDIDATE' as const,
  status: 'ACTIVE' as const,
  candidate: null,
  recruiter: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const recruiterUser = {
  id: 'recruiter-user-id',
  email: 'recruiter@example.com',
  role: 'RECRUITER' as const,
  status: 'ACTIVE' as const,
  candidate: null,
  recruiter: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const candidateProfile = {
  id: 'candidate-profile-id',
  userId: 'candidate-user-id',
  headline: 'Senior TypeScript Developer',
  summary: 'Experienced backend and frontend developer.',
  location: 'Amsterdam',
  salaryMin: '5000',
  salaryMax: '7000',
  currency: 'EUR',
  remotePreference: 'HYBRID',
  availabilityDate: '2026-09-01',
  createdAt: '2026-01-01T12:00:00.000Z',
  updatedAt: '2026-08-25T12:00:00.000Z',
}

function renderProfilePage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockedGetCandidateProfile.mockResolvedValue(candidateProfile)
  })

  it('should display authenticated candidate account information', () => {
    mockedUseAuth.mockReturnValue({
      user: candidateUser,
      accessToken: 'candidate-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderProfilePage()

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByText('candidate@example.com')).toBeInTheDocument()
    expect(screen.getByText('CANDIDATE')).toBeInTheDocument()
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })

  it('should load and display the candidate profile', async () => {
    mockedUseAuth.mockReturnValue({
      user: candidateUser,
      accessToken: 'candidate-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderProfilePage()

    expect(screen.getByText('Loading candidate profile...')).toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.getByText('Senior TypeScript Developer'),
      ).toBeInTheDocument()

      expect(
        screen.getByText('Experienced backend and frontend developer.'),
      ).toBeInTheDocument()
    })

    expect(mockedGetCandidateProfile).toHaveBeenCalledTimes(1)
  })

  it('should display an error when the candidate profile cannot be loaded', async () => {
    mockedUseAuth.mockReturnValue({
      user: candidateUser,
      accessToken: 'candidate-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    mockedGetCandidateProfile.mockRejectedValueOnce(
      new Error('Candidate profile not found'),
    )

    renderProfilePage()

    const alert = await waitFor(() => screen.getByRole('alert'))

    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Unable to load your candidate profile.')
  })

  it('should handle nullable candidate profile fields', async () => {
    mockedUseAuth.mockReturnValue({
      user: candidateUser,
      accessToken: 'candidate-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    mockedGetCandidateProfile.mockResolvedValueOnce({
      ...candidateProfile,
      salaryMin: null,
      salaryMax: null,
      currency: null,
      availabilityDate: null,
    })

    renderProfilePage()

    await waitFor(() => {
      expect(screen.getAllByText('Not specified')).toHaveLength(2)
    })

    expect(screen.getByText('Senior TypeScript Developer')).toBeInTheDocument()

    expect(screen.getByText('Amsterdam')).toBeInTheDocument()
    expect(screen.getByText('HYBRID')).toBeInTheDocument()
  })

  it('should not load the candidate profile for a recruiter', async () => {
    mockedUseAuth.mockReturnValue({
      user: recruiterUser,
      accessToken: 'recruiter-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderProfilePage()

    expect(screen.getByText('recruiter@example.com')).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', {
        name: 'Candidate profile',
      }),
    ).not.toBeInTheDocument()

    await waitFor(() => {
      expect(mockedGetCandidateProfile).not.toHaveBeenCalled()
    })
  })
})

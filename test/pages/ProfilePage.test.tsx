import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import ProfilePage from '../../src/pages/ProfilePage'
import { useAuth } from '../../src/features/auth/useAuth'
import {
  createCandidateProfile,
  getCandidateProfile,
  updateCandidateProfile,
} from '../../src/features/candidate/candidate.api'
import { ApiError } from '../../src/services/api/apiError'

vi.mock('../../src/features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../src/features/candidate/candidate.api', () => ({
  getCandidateProfile: vi.fn(),
  createCandidateProfile: vi.fn(),
  updateCandidateProfile: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)
const mockedGetCandidateProfile = vi.mocked(getCandidateProfile)
const mockedCreateCandidateProfile = vi.mocked(createCandidateProfile)
const mockedUpdateCandidateProfile = vi.mocked(updateCandidateProfile)

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

function mockCandidateAuth() {
  mockedUseAuth.mockReturnValue({
    user: candidateUser,
    accessToken: 'candidate-token',
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockedGetCandidateProfile.mockResolvedValue(candidateProfile)
    mockedCreateCandidateProfile.mockResolvedValue(candidateProfile)
    mockedUpdateCandidateProfile.mockResolvedValue(candidateProfile)
  })

  it('should display authenticated candidate account information', () => {
    mockCandidateAuth()

    renderProfilePage()

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByText('candidate@example.com')).toBeInTheDocument()
    expect(screen.getByText('CANDIDATE')).toBeInTheDocument()
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })

  it('should load and display the candidate profile', async () => {
    mockCandidateAuth()

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

  it('should enter edit mode and update the candidate profile', async () => {
    mockCandidateAuth()

    renderProfilePage()

    await waitFor(() => {
      expect(
        screen.getByText('Senior TypeScript Developer'),
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }))

    fireEvent.change(screen.getByLabelText('Headline'), {
      target: { value: 'Lead TypeScript Developer' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }))

    await waitFor(() => {
      expect(mockedUpdateCandidateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          headline: 'Lead TypeScript Developer',
        }),
      )
    })

    expect(
      screen.getByText('Profile updated successfully.'),
    ).toBeInTheDocument()
  })

  it('should cancel profile editing without saving', async () => {
    mockCandidateAuth()

    renderProfilePage()

    await waitFor(() => {
      expect(
        screen.getByText('Senior TypeScript Developer'),
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }))

    fireEvent.change(screen.getByLabelText('Headline'), {
      target: { value: 'Changed headline' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByText('Senior TypeScript Developer')).toBeInTheDocument()
    expect(screen.queryByLabelText('Headline')).not.toBeInTheDocument()
    expect(mockedUpdateCandidateProfile).not.toHaveBeenCalled()
  })

  it('should display an error when the candidate profile cannot be loaded', async () => {
    mockCandidateAuth()

    mockedGetCandidateProfile.mockRejectedValueOnce(
      new ApiError(500, 'Server error'),
    )

    renderProfilePage()

    const alert = await waitFor(() => screen.getByRole('alert'))

    expect(alert).toHaveTextContent(
      'Unable to load your candidate profile.',
    )
  })

  it('should display an error when updating the profile fails', async () => {
    mockCandidateAuth()

    mockedUpdateCandidateProfile.mockRejectedValueOnce(
      new Error('Update failed'),
    )

    renderProfilePage()

    await waitFor(() => {
      expect(
        screen.getByText('Senior TypeScript Developer'),
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }))

    fireEvent.change(screen.getByLabelText('Headline'), {
      target: { value: 'Updated headline' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Unable to update your candidate profile.',
      )
    })
  })

  it('should display the create form when the candidate profile does not exist', async () => {
    mockCandidateAuth()

    mockedGetCandidateProfile.mockRejectedValueOnce(
      new ApiError(404, 'Candidate profile not found'),
    )

    renderProfilePage()

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Create candidate profile',
        }),
      ).toBeInTheDocument()
    })

    expect(
      screen.getByRole('button', { name: 'Create profile' }),
    ).toBeInTheDocument()
  })

  it('should create a candidate profile', async () => {
    mockCandidateAuth()

    mockedGetCandidateProfile.mockRejectedValueOnce(
      new ApiError(404, 'Candidate profile not found'),
    )

    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText('Headline')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Headline'), {
      target: { value: 'Frontend Developer' },
    })

    fireEvent.change(screen.getByLabelText('Location'), {
      target: { value: 'Amsterdam' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create profile' }))

    await waitFor(() => {
      expect(mockedCreateCandidateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          headline: 'Frontend Developer',
          location: 'Amsterdam',
        }),
      )
    })

    expect(
      screen.getByText('Profile created successfully.'),
    ).toBeInTheDocument()
  })

  it('should handle nullable candidate profile fields', async () => {
    mockCandidateAuth()

    mockedGetCandidateProfile.mockResolvedValueOnce({
      ...candidateProfile,
      headline: null,
      summary: null,
      location: null,
      salaryMin: null,
      salaryMax: null,
      currency: null,
      remotePreference: null,
      availabilityDate: null,
    })

    renderProfilePage()

    await waitFor(() => {
      expect(screen.getAllByText('Not specified')).toHaveLength(6)
    })
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
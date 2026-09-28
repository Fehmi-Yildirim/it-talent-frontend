import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '../test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import ProfilePage from '../../src/pages/ProfilePage'
import { useAuth } from '../../src/features/auth/useAuth'
import {
  createCandidateProfile,
  getCandidateProfile,
  updateCandidateProfile,
} from '../../src/features/candidate/candidate.api'
import {
  getRecruiterProfile,
  updateRecruiterProfile,
} from '../../src/features/recruiter/recruiter.api'
import { ApiError } from '../../src/services/api/apiError'

vi.mock('../../src/features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../src/features/candidate/candidate.api', () => ({
  createCandidateProfile: vi.fn(),
  getCandidateProfile: vi.fn(),
  updateCandidateProfile: vi.fn(),
}))

vi.mock('../../src/features/candidate/CandidateSkills', () => ({
  default: () => <div>Candidate skills</div>,
}))

vi.mock('../../src/features/recruiter/recruiter.api', () => ({
  getRecruiterProfile: vi.fn(),
  updateRecruiterProfile: vi.fn(),
}))

const candidateUser = {
  id: 'user-1',
  email: 'candidate@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'CANDIDATE' as const,
  status: 'ACTIVE' as const,
  candidate: null,
  recruiter: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

const candidateProfile = {
  id: 'profile-1',
  userId: 'user-1',
  headline: 'Frontend Developer',
  summary: 'Experienced developer',
  location: 'Amsterdam',
  salaryMin: '50000',
  salaryMax: '70000',
  currency: 'EUR',
  availabilityDate: '2026-02-01',
  remotePreference: 'HYBRID',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}


const recruiterUser = {
  id: 'user-2',
  email: 'recruiter@example.com',
  firstName: 'Robert',
  lastName: 'Cook',
  role: 'RECRUITER' as const,
  status: 'ACTIVE' as const,
  candidate: null,
  recruiter: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

const recruiterProfile = {
  id: 'recruiter-profile-1',
  userId: 'user-2',
  companyId: 'company-1',
  jobTitle: 'Technical Recruiter',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

const mockedUseAuth = vi.mocked(useAuth)
const mockedGetCandidateProfile = vi.mocked(getCandidateProfile)
const mockedCreateCandidateProfile = vi.mocked(
  createCandidateProfile,
)
const mockedUpdateCandidateProfile = vi.mocked(
  updateCandidateProfile,
)
const mockedGetRecruiterProfile = vi.mocked(
  getRecruiterProfile,
)
const mockedUpdateRecruiterProfile = vi.mocked(
  updateRecruiterProfile,
)

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

    mockedUseAuth.mockReturnValue({
      user: candidateUser,
      accessToken: 'test-access-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    })

    mockedGetCandidateProfile.mockResolvedValue(
      candidateProfile,
    )
    mockedCreateCandidateProfile.mockResolvedValue(
      candidateProfile,
    )
    mockedUpdateCandidateProfile.mockResolvedValue(
      candidateProfile,
    )

    mockedGetRecruiterProfile.mockResolvedValue(
      recruiterProfile,
    )
    mockedUpdateRecruiterProfile.mockResolvedValue(
      recruiterProfile,
    )
  })

  it('shows loading state', () => {
    mockedGetCandidateProfile.mockReturnValue(
      new Promise(() => undefined),
    )

    renderProfilePage()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading candidate profile...',
    )
  })

  it('loads and displays the candidate profile', async () => {
    renderProfilePage()

    expect(
      await screen.findByText('Frontend Developer'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Experienced developer'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Amsterdam'),
    ).toBeInTheDocument()
  })

  it('shows an error when loading the profile fails', async () => {
    mockedGetCandidateProfile.mockRejectedValue(
      new Error('Request failed'),
    )

    renderProfilePage()

    expect(
      await screen.findByRole('heading', {
        name: 'Profile unavailable',
      }),
    ).toBeInTheDocument()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Unable to load your candidate profile.',
    )

    expect(
      screen.getByRole('button', {
        name: 'Try again',
      }),
    ).toBeInTheDocument()
  })

  it('retries loading the candidate profile', async () => {
    mockedGetCandidateProfile
      .mockRejectedValueOnce(
        new Error('Request failed'),
      )
      .mockResolvedValueOnce(candidateProfile)

    renderProfilePage()

    expect(
      await screen.findByRole('heading', {
        name: 'Profile unavailable',
      }),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Try again',
      }),
    )

    await waitFor(() => {
      expect(
        mockedGetCandidateProfile,
      ).toHaveBeenCalledTimes(2)
    })

    expect(
      await screen.findByText('Frontend Developer'),
    ).toBeInTheDocument()
  })

  it('handles a missing candidate profile as an empty state', async () => {
    mockedGetCandidateProfile.mockRejectedValue(
      new ApiError(404, 'Profile not found'),
    )

    renderProfilePage()

    expect(
      await screen.findByRole('heading', {
        name: 'Create candidate profile',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('alert'),
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Create profile',
      }),
    ).toBeInTheDocument()
  })

  it('creates a candidate profile', async () => {
    mockedGetCandidateProfile.mockRejectedValue(
      new ApiError(404, 'Profile not found'),
    )

    const createdProfile = {
      ...candidateProfile,
      headline: 'New Frontend Developer',
    }

    mockedCreateCandidateProfile.mockResolvedValue(
      createdProfile,
    )

    renderProfilePage()

    const headline = await screen.findByLabelText(
      'Headline',
    )

    fireEvent.change(headline, {
      target: {
        value: 'New Frontend Developer',
      },
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create profile',
      }),
    )

    await waitFor(() => {
      expect(
        mockedCreateCandidateProfile,
      ).toHaveBeenCalledWith({
        headline: 'New Frontend Developer',
      })
    })

    expect(
      await screen.findByText(
        'Profile created successfully.',
      ),
    ).toBeInTheDocument()
  })

  it('updates the candidate profile', async () => {
    renderProfilePage()

    const candidateHeading = await screen.findByRole('heading', {
      name: 'Candidate profile',
    })

    const candidateSection = candidateHeading.closest('section')

    if (!candidateSection) {
      throw new Error('Candidate section not found')
    }

    fireEvent.click(
      within(candidateSection).getByRole('button', {
        name: 'Edit profile',
      }),
    )

    const headline = screen.getByDisplayValue(
      'Frontend Developer',
    )

    fireEvent.change(headline, {
      target: {
        value: 'Senior Frontend Developer',
      },
    })

    fireEvent.click(
      within(candidateSection).getByRole('button', {
        name: 'Save profile',
      }),
    )

    await waitFor(() => {
      expect(
        mockedUpdateCandidateProfile,
      ).toHaveBeenCalledWith({
        headline: 'Senior Frontend Developer',
        summary: 'Experienced developer',
        location: 'Amsterdam',
        salaryMin: 50000,
        salaryMax: 70000,
        currency: 'EUR',
        availabilityDate: '2026-02-01',
        remotePreference: 'HYBRID',
      })
    })

    expect(
      await screen.findByText(
        'Profile updated successfully.',
      ),
    ).toBeInTheDocument()
  })

  it('shows an error when creating the profile fails', async () => {
    mockedGetCandidateProfile.mockRejectedValue(
      new ApiError(404, 'Profile not found'),
    )

    mockedCreateCandidateProfile.mockRejectedValue(
      new Error('Request failed'),
    )

    renderProfilePage()

    await screen.findByRole('heading', {
      name: 'Create candidate profile',
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create profile',
      }),
    )

    expect(
      await screen.findByText(
        'Unable to create your candidate profile.',
      ),
    ).toBeInTheDocument()
  })

  it('shows an error when updating the profile fails', async () => {
    mockedUpdateCandidateProfile.mockRejectedValue(
      new Error('Request failed'),
    )

    renderProfilePage()

    const candidateHeading = await screen.findByRole('heading', {
      name: 'Candidate profile',
    })

    const candidateSection = candidateHeading.closest('section')

    if (!candidateSection) {
      throw new Error('Candidate section not found')
    }

    fireEvent.click(
      within(candidateSection).getByRole('button', {
        name: 'Edit profile',
      }),
    )

    fireEvent.change(
      screen.getByDisplayValue(
        'Frontend Developer',
      ),
      {
        target: {
          value: 'Senior Frontend Developer',
        },
      },
    )

    fireEvent.click(
      within(candidateSection).getByRole('button', {
        name: 'Save profile',
      }),
    )

    expect(
      await screen.findByText(
        'Unable to update your candidate profile.',
      ),
    ).toBeInTheDocument()
  })

  it('loads and displays the recruiter profile', async () => {
    mockedUseAuth.mockReturnValue({
      user: recruiterUser,
      accessToken: 'test-access-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    })

    renderProfilePage()

    expect(
      await screen.findByText('Technical Recruiter'),
    ).toBeInTheDocument()

    expect(
      mockedGetRecruiterProfile,
    ).toHaveBeenCalledTimes(1)
  })

  it('does not load the candidate profile for recruiters', async () => {
    mockedUseAuth.mockReturnValue({
      user: recruiterUser,
      accessToken: 'test-access-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    })

    renderProfilePage()

    expect(
      await screen.findByText('Technical Recruiter'),
    ).toBeInTheDocument()

    expect(
      mockedGetCandidateProfile,
    ).not.toHaveBeenCalled()
  })

  it('updates the recruiter profile', async () => {
    const updateUser = vi.fn().mockResolvedValue(undefined)

    mockedUseAuth.mockReturnValue({
      user: recruiterUser,
      accessToken: 'test-access-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser,
    })

    renderProfilePage()

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Edit profile',
      }),
    )

    const jobTitle = screen.getByDisplayValue(
      'Technical Recruiter',
    )

    fireEvent.change(jobTitle, {
      target: {
        value: 'Senior Technical Recruiter',
      },
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Save profile',
      }),
    )

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith(
        'Robert',
        'Cook',
      )
    })

    expect(
      mockedUpdateRecruiterProfile,
    ).toHaveBeenCalledWith({
      jobTitle: 'Senior Technical Recruiter',
    })
  })

  it('shows a success message after updating the recruiter profile', async () => {
    const updateUser = vi.fn().mockResolvedValue(undefined)

    mockedUseAuth.mockReturnValue({
      user: recruiterUser,
      accessToken: 'test-access-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser,
    })

    renderProfilePage()

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Edit profile',
      }),
    )

    fireEvent.change(
      screen.getByDisplayValue(
        'Technical Recruiter',
      ),
      {
        target: {
          value: 'Senior Technical Recruiter',
        },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Save profile',
      }),
    )

    expect(
      await screen.findByText(
        'Profile updated successfully.',
      ),
    ).toBeInTheDocument()
  })

  it('shows an error when loading the recruiter profile fails', async () => {
    mockedUseAuth.mockReturnValue({
      user: recruiterUser,
      accessToken: 'test-access-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    })

    mockedGetRecruiterProfile.mockRejectedValue(
      new Error('Request failed'),
    )

    renderProfilePage()

    expect(
      await screen.findByRole('heading', {
        name: 'Recruiter profile unavailable',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('alert'),
    ).toHaveTextContent(
      'Unable to load recruiter profile.',
    )

    expect(
      screen.getByRole('button', {
        name: 'Try again',
      }),
    ).toBeInTheDocument()
  })

  it('retries loading the recruiter profile', async () => {
    mockedUseAuth.mockReturnValue({
      user: recruiterUser,
      accessToken: 'test-access-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    })

    mockedGetRecruiterProfile
      .mockRejectedValueOnce(
        new Error('Request failed'),
      )
      .mockResolvedValueOnce(recruiterProfile)

    renderProfilePage()

    expect(
      await screen.findByRole('heading', {
        name: 'Recruiter profile unavailable',
      }),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Try again',
      }),
    )

    await waitFor(() => {
      expect(
        mockedGetRecruiterProfile,
      ).toHaveBeenCalledTimes(2)
    })

    expect(
      await screen.findByText(
        'Technical Recruiter',
      ),
    ).toBeInTheDocument()
  })

})
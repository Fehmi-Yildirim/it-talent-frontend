import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '../test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import DashboardPage from '../../src/pages/DashboardPage'
import { AuthProvider } from '../../src/features/auth/AuthProvider'
import { getCurrentUser } from '../../src/features/auth/auth.api'
import { getAccessToken } from '../../src/features/auth/auth.storage'
import {
  getCandidateDashboard,
  getRecruiterDashboard,
} from '../../src/features/dashboard/dashboard.api'

vi.mock('../../src/features/auth/auth.api', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('../../src/features/auth/auth.storage', () => ({
  getAccessToken: vi.fn(),
}))

vi.mock('../../src/features/dashboard/dashboard.api', () => ({
  getCandidateDashboard: vi.fn(),
  getRecruiterDashboard: vi.fn(),
}))

const mockedGetCurrentUser = vi.mocked(getCurrentUser)
const mockedGetAccessToken = vi.mocked(getAccessToken)
const mockedGetCandidateDashboard = vi.mocked(getCandidateDashboard)
const mockedGetRecruiterDashboard = vi.mocked(getRecruiterDashboard)

function renderDashboardPage() {
  render(
    <MemoryRouter>
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

const candidateDashboard = {
  profile: {
    status: 'ACTIVE' as const,
    completionPercentage: 75,
    headline: 'Frontend Developer',
    summary: 'Experienced React developer',
    location: 'Amsterdam',
    salaryMin: '4000',
    salaryMax: '5500',
    currency: 'EUR',
    availabilityDate: null,
    remotePreference: 'HYBRID',
  },
  applications: {
    total: 3,
    byStatus: {
      PENDING: 1,
      REVIEWING: 1,
      ACCEPTED: 1,
      REJECTED: 0,
      WITHDRAWN: 0,
    },
    recent: [
      {
        id: 'application-1',
        status: 'PENDING' as const,
        createdAt: '2026-09-01T10:00:00.000Z',
        job: {
          id: 'job-1',
          title: 'Frontend Developer',
          company: {
            id: 'company-1',
            name: 'Tech Company',
          },
        },
      },
    ],
  },
  jobs: {
    recommendedCount: 2,
    availableCount: 10,
    recent: [
      {
        id: 'job-1',
        title: 'Frontend Developer',
        location: 'Amsterdam',
        employmentType: 'FULL_TIME',
        workMode: 'HYBRID',
        publishedAt: '2026-09-01T10:00:00.000Z',
        company: {
          id: 'company-1',
          name: 'Tech Company',
        },
      },
    ],
  },
  skills: {
    total: 4,
    items: [],
  },
}

const recruiterDashboard = {
  profile: {
    status: 'ACTIVE' as const,
    jobTitle: 'Senior Recruiter',
    company: {
      id: 'company-1',
      name: 'Tech Company',
      slug: 'tech-company',
    },
  },
  jobs: {
    total: 4,
    published: 2,
    draft: 1,
    closed: 1,
    recent: [
      {
        id: 'job-1',
        title: 'Frontend Developer',
        status: 'PUBLISHED',
        publishedAt: '2026-09-01T10:00:00.000Z',
        createdAt: '2026-09-01T10:00:00.000Z',
      },
    ],
  },
  applications: {
    total: 6,
    byStatus: {
      PENDING: 2,
      REVIEWING: 2,
      ACCEPTED: 1,
      REJECTED: 1,
      WITHDRAWN: 0,
    },
    recent: [
      {
        id: 'application-1',
        status: 'REVIEWING' as const,
        createdAt: '2026-09-01T10:00:00.000Z',
        job: {
          id: 'job-1',
          title: 'Frontend Developer',
        },
        candidate: {
          id: 'candidate-1',
          headline: 'React Developer',
          location: 'Amsterdam',
        },
      },
    ],
  },
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockedGetAccessToken.mockReturnValue('test-token')

    mockedGetCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      role: 'CANDIDATE',
      status: 'ACTIVE',
      candidate: null,
      recruiter: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    mockedGetCandidateDashboard.mockResolvedValue(candidateDashboard)
    mockedGetRecruiterDashboard.mockResolvedValue(recruiterDashboard)
  })

  it('renders the candidate dashboard', async () => {
    renderDashboardPage()

    expect(
      await screen.findByRole('heading', {
        name: 'Dashboard',
      }),
    ).toBeInTheDocument()

    expect(
      await screen.findByText('75% complete'),
    ).toBeInTheDocument()
  })

  it('loads the candidate dashboard endpoint for candidates', async () => {
    renderDashboardPage()

    await screen.findByText('75% complete')

    expect(mockedGetCandidateDashboard).toHaveBeenCalledTimes(1)
    expect(mockedGetRecruiterDashboard).not.toHaveBeenCalled()
  })

  it('displays candidate dashboard statistics and recent data', async () => {
    renderDashboardPage()

    expect(
      await screen.findByText('Total applications'),
    ).toBeInTheDocument()

    expect(screen.getByText('Available jobs')).toBeInTheDocument()
    expect(screen.getByText('Skills')).toBeInTheDocument()
    expect(screen.getAllByText('Frontend Developer')).toHaveLength(2)
    expect(screen.getAllByText('Tech Company')).toHaveLength(2)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('displays candidate empty states', async () => {
    mockedGetCandidateDashboard.mockResolvedValue({
      ...candidateDashboard,
      applications: {
        ...candidateDashboard.applications,
        total: 0,
        recent: [],
      },
      jobs: {
        ...candidateDashboard.jobs,
        availableCount: 0,
        recent: [],
      },
      skills: {
        total: 0,
        items: [],
      },
    })

    renderDashboardPage()

    expect(
      await screen.findByText(
        'You have not submitted any applications yet.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText('No published jobs are currently available.'),
    ).toBeInTheDocument()
  })

  it('shows an error and allows retrying', async () => {
    mockedGetCandidateDashboard
      .mockRejectedValueOnce(new Error('Request failed'))
      .mockResolvedValueOnce(candidateDashboard)

    renderDashboardPage()

    expect(
      await screen.findByRole('heading', {
        name: 'Dashboard unavailable',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Unable to load the dashboard. Please try again.',
      ),
    ).toBeInTheDocument()

    screen.getByRole('button', { name: 'Retry' }).click()

    await waitFor(() => {
      expect(mockedGetCandidateDashboard).toHaveBeenCalledTimes(2)
    })

    expect(
      await screen.findByText('75% complete'),
    ).toBeInTheDocument()
  })

  it('renders the recruiter dashboard for recruiters', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 'recruiter-1',
      email: 'recruiter@example.com',
      role: 'RECRUITER',
      status: 'ACTIVE',
      candidate: null,
      recruiter: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    renderDashboardPage()

    expect(
      await screen.findByText('Tech Company'),
    ).toBeInTheDocument()

    expect(screen.getByText('Senior Recruiter')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('Total applications')).toBeInTheDocument()
    expect(screen.getByText('React Developer')).toBeInTheDocument()
  })

  it('loads the recruiter dashboard endpoint for recruiters', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 'recruiter-1',
      email: 'recruiter@example.com',
      role: 'RECRUITER',
      status: 'ACTIVE',
      candidate: null,
      recruiter: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    renderDashboardPage()

    await screen.findByText('Senior Recruiter')

    expect(mockedGetRecruiterDashboard).toHaveBeenCalledTimes(1)
    expect(mockedGetCandidateDashboard).not.toHaveBeenCalled()
  })

  it('renders recruiter empty states', async () => {
    mockedGetCurrentUser.mockResolvedValue({
      id: 'recruiter-1',
      email: 'recruiter@example.com',
      role: 'RECRUITER',
      status: 'ACTIVE',
      candidate: null,
      recruiter: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    mockedGetRecruiterDashboard.mockResolvedValue({
      ...recruiterDashboard,
      profile: {
        ...recruiterDashboard.profile,
        company: null,
      },
      jobs: {
        ...recruiterDashboard.jobs,
        total: 0,
        published: 0,
        draft: 0,
        closed: 0,
        recent: [],
      },
      applications: {
        ...recruiterDashboard.applications,
        total: 0,
        recent: [],
      },
    })

    renderDashboardPage()

    expect(await screen.findByText('No company')).toBeInTheDocument()
    expect(
      screen.getByText('No applications have been received yet.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('No jobs have been created yet.'),
    ).toBeInTheDocument()
  })

  it('keeps the existing account navigation', async () => {
    renderDashboardPage()

    expect(
      await screen.findByRole('link', {
        name: 'View profile',
      }),
    ).toHaveAttribute('href', '/profile')

    expect(await screen.findByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('CANDIDATE')).toBeInTheDocument()
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })
})

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { router } from '../../src/app/routes'
import { AuthProvider } from '../../src/features/auth/AuthProvider'
import { getCurrentUser } from '../../src/features/auth/auth.api'
import { getAccessToken } from '../../src/features/auth/auth.storage'
import {
  getCandidateDashboard,
  getRecruiterDashboard,
} from '../../src/features/dashboard/dashboard.api'

vi.mock('../../src/features/auth/auth.api', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
}))

vi.mock('../../src/features/auth/auth.storage', () => ({
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
}))

vi.mock('../../src/features/dashboard/dashboard.api', () => ({
  getCandidateDashboard: vi.fn(),
  getRecruiterDashboard: vi.fn(),
}))

const mockedGetCurrentUser = vi.mocked(getCurrentUser)
const mockedGetAccessToken = vi.mocked(getAccessToken)
const mockedGetCandidateDashboard = vi.mocked(getCandidateDashboard)
const mockedGetRecruiterDashboard = vi.mocked(getRecruiterDashboard)

beforeEach(() => {
  vi.clearAllMocks()
  mockedGetAccessToken.mockReturnValue(null)
})

describe('application routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetAccessToken.mockReturnValue(null)
  })

  it('renders the landing page at /', async () => {
    mockedGetAccessToken.mockReturnValue(null)

    await router.navigate('/')

    render(
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'IT Talent',
      }),
    ).toBeInTheDocument()
  })

  it('renders the login page at /login', async () => {
    mockedGetAccessToken.mockReturnValue(null)

    await router.navigate('/login')

    render(
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Login',
      }),
    ).toBeInTheDocument()
  })

  it('renders the register page at /register', async () => {
    mockedGetAccessToken.mockReturnValue(null)

    await router.navigate('/register')

    render(
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Register',
      }),
    ).toBeInTheDocument()
  })

  it('redirects unauthenticated users from /dashboard to /login', async () => {
    mockedGetAccessToken.mockReturnValue(null)

    await router.navigate('/dashboard')

    render(
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Login',
      }),
    ).toBeInTheDocument()
  })

  it('redirects unauthenticated users from /profile to /login', async () => {
    mockedGetAccessToken.mockReturnValue(null)

    await router.navigate('/profile')

    render(
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Login',
      }),
    ).toBeInTheDocument()
  })

  it('renders dashboard for authenticated users', async () => {
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

    mockedGetCandidateDashboard.mockResolvedValue({
      profile: {
        status: 'ACTIVE',
        completionPercentage: 75,
        headline: 'Backend Developer',
        summary: 'Experienced developer',
        location: 'Amsterdam',
        salaryMin: '4000',
        salaryMax: '6000',
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
        recent: [],
      },
      jobs: {
        recommendedCount: 2,
        availableCount: 10,
        recent: [],
      },
      skills: {
        total: 4,
        items: [],
      },
    })

    await router.navigate('/dashboard')

    render(
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Dashboard',
      }),
    ).toBeInTheDocument()

    expect(
      await screen.findByText('75% complete'),
    ).toBeInTheDocument()

    expect(
      await screen.findByText('Total applications'),
    ).toBeInTheDocument()

    expect(mockedGetCandidateDashboard).toHaveBeenCalledTimes(1)
    expect(mockedGetRecruiterDashboard).not.toHaveBeenCalled()
  })

  it('renders profile for authenticated users', async () => {
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

    await router.navigate('/profile')

    render(
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Profile',
      }),
    ).toBeInTheDocument()
  })

  it('renders the not-found page for unknown routes', async () => {
    mockedGetAccessToken.mockReturnValue(null)

    await router.navigate('/this-route-does-not-exist')

    render(
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Page not found',
      }),
    ).toBeInTheDocument()
  })
})

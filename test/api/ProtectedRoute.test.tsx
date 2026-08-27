import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

import ProtectedRoute from '../../src/app/ProtectedRoute'
import { AuthProvider } from '../../src/features/auth/AuthProvider'
import { getCurrentUser } from '../../src/features/auth/auth.api'

vi.mock('../../src/features/auth/auth.api', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
}))

const mockedGetCurrentUser = vi.mocked(getCurrentUser)

const currentUser = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'CANDIDATE' as const,
  status: 'ACTIVE' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  candidate: {
    id: 'candidate-1',
    headline: null,
    summary: null,
    location: null,
    salaryMin: null,
    salaryMax: null,
    currency: null,
    availabilityDate: null,
    remotePreference: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  recruiter: null,
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders protected content when an access token exists', async () => {
    localStorage.setItem('it-talent-access-token', 'test-token')

    mockedGetCurrentUser.mockResolvedValue(currentUser)

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Dashboard content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(screen.queryByText('Dashboard content')).not.toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Dashboard content')).toBeInTheDocument()
    })

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
  })

  it('clears an invalid session and redirects to login', async () => {
    localStorage.setItem('it-talent-access-token', 'expired-token')

    mockedGetCurrentUser.mockRejectedValue(new Error('Unauthorized'))

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Dashboard content</div>} />
            </Route>

            <Route path="/login" element={<div>Login page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Login page')).toBeInTheDocument()
    })

    expect(localStorage.getItem('it-talent-access-token')).toBeNull()

    expect(screen.queryByText('Dashboard content')).not.toBeInTheDocument()

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
  })

  it('redirects unauthenticated users to login', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Dashboard content</div>} />
            </Route>

            <Route path="/login" element={<div>Login page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(screen.getByText('Login page')).toBeInTheDocument()

    expect(screen.queryByText('Dashboard content')).not.toBeInTheDocument()

    expect(mockedGetCurrentUser).not.toHaveBeenCalled()
  })
})

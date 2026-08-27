import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Layout from '../../src/components/Layout'
import { useAuth } from '../../src/features/auth/useAuth'

vi.mock('../../src/features/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)

const candidateUser = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'CANDIDATE' as const,
  status: 'ACTIVE' as const,
  candidate: null,
  recruiter: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<div>Dashboard content</div>} />
          <Route path="/login" element={<div>Login page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows authenticated navigation when the user is authenticated', () => {
    mockedUseAuth.mockReturnValue({
      user: candidateUser,
      accessToken: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderLayout()

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()

    expect(
      screen.queryByRole('link', { name: 'Login' }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('link', { name: 'Register' }),
    ).not.toBeInTheDocument()
  })

  it('shows public navigation when the user is not authenticated', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    })

    renderLayout()

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument()

    expect(
      screen.queryByRole('link', { name: 'Dashboard' }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('link', { name: 'Profile' }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: 'Logout' }),
    ).not.toBeInTheDocument()
  })

  it('logs out and navigates to login', async () => {
    const user = userEvent.setup()
    const logout = vi.fn()

    mockedUseAuth.mockReturnValue({
      user: candidateUser,
      accessToken: 'test-token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout,
    })

    renderLayout()

    await user.click(screen.getByRole('button', { name: 'Logout' }))

    expect(logout).toHaveBeenCalledOnce()

    await waitFor(() => {
      expect(screen.getByText('Login page')).toBeInTheDocument()
    })
  })
})

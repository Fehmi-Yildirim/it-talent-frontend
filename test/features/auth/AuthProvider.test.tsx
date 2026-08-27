import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from '../../../src/features/auth/AuthProvider'
import { useAuth } from '../../../src/features/auth/useAuth'

import { getCurrentUser, login } from '../../../src/features/auth/auth.api'

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../../../src/features/auth/auth.storage'

vi.mock('../../../src/features/auth/auth.api', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
}))

vi.mock('../../../src/features/auth/auth.storage', () => ({
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
}))

const mockedGetCurrentUser = vi.mocked(getCurrentUser)
const mockedLogin = vi.mocked(login)
const mockedGetAccessToken = vi.mocked(getAccessToken)
const mockedSetAccessToken = vi.mocked(setAccessToken)
const mockedClearAccessToken = vi.mocked(clearAccessToken)

function TestConsumer() {
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    logout,
  } = useAuth()

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>

      <div data-testid="authenticated">
        {isAuthenticated ? 'authenticated' : 'unauthenticated'}
      </div>

      <div data-testid="token">{accessToken ?? 'no-token'}</div>

      <div data-testid="user">{user?.email ?? 'no-user'}</div>

      <button
        type="button"
        onClick={() => void handleLogin('test@example.com', 'password123')}
      >
        Login
      </button>

      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  )
}

const currentUser = {
  id: 'user-1',
  email: 'test@example.com',
  role: 'CANDIDATE' as const,
  status: 'ACTIVE' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  candidate: null,
  recruiter: null,
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockedGetAccessToken.mockReturnValue(null)
    mockedGetCurrentUser.mockReset()
    mockedLogin.mockReset()
    mockedSetAccessToken.mockReset()
    mockedClearAccessToken.mockReset()
  })

  it('starts unauthenticated when no access token exists', async () => {
    renderAuthProvider()

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    expect(screen.getByTestId('authenticated')).toHaveTextContent(
      'unauthenticated',
    )

    expect(screen.getByTestId('token')).toHaveTextContent('no-token')

    expect(screen.getByTestId('user')).toHaveTextContent('no-user')

    expect(mockedGetCurrentUser).not.toHaveBeenCalled()
  })

  it('initializes the authenticated session using the current user endpoint', async () => {
    mockedGetAccessToken.mockReturnValue('existing-token')

    mockedGetCurrentUser.mockResolvedValue(currentUser)

    renderAuthProvider()

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent(
        'authenticated',
      )
    })

    expect(screen.getByTestId('token')).toHaveTextContent('existing-token')

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
  })

  it('clears an invalid session when current user initialization fails', async () => {
    mockedGetAccessToken.mockReturnValue('expired-token')

    mockedGetCurrentUser.mockRejectedValue(new Error('Unauthorized'))

    renderAuthProvider()

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent(
        'unauthenticated',
      )
    })

    expect(screen.getByTestId('token')).toHaveTextContent('no-token')

    expect(screen.getByTestId('user')).toHaveTextContent('no-user')

    expect(mockedClearAccessToken).toHaveBeenCalledTimes(1)
  })

  it('logs in and initializes the current user', async () => {
    const user = userEvent.setup()

    mockedLogin.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
      accessToken: 'new-token',
    })

    mockedGetCurrentUser.mockResolvedValue(currentUser)

    renderAuthProvider()

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    })

    await user.click(
      screen.getByRole('button', {
        name: 'Login',
      }),
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent(
        'authenticated',
      )
    })

    expect(mockedLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(mockedLogin).toHaveBeenCalledTimes(1)

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)

    expect(mockedSetAccessToken).toHaveBeenCalledWith('new-token')

    expect(screen.getByTestId('token')).toHaveTextContent('new-token')

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')

    expect(screen.getByTestId('authenticated')).toHaveTextContent(
      'authenticated',
    )
  })

  it('logs out and clears the authentication state', async () => {
    const user = userEvent.setup()

    mockedGetAccessToken.mockReturnValue('existing-token')

    mockedGetCurrentUser.mockResolvedValue(currentUser)

    renderAuthProvider()

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent(
        'authenticated',
      )
    })

    expect(screen.getByTestId('token')).toHaveTextContent('existing-token')

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')

    await user.click(
      screen.getByRole('button', {
        name: 'Logout',
      }),
    )

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent(
        'unauthenticated',
      )
    })

    expect(screen.getByTestId('token')).toHaveTextContent('no-token')

    expect(screen.getByTestId('user')).toHaveTextContent('no-user')

    expect(mockedClearAccessToken).toHaveBeenCalledTimes(1)
  })
})

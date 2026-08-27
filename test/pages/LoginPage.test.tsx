import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom/vitest'
import LoginPage from '../../src/pages/LoginPage'
import { login } from '../../src/features/auth/auth.api'
import { AuthProvider } from '../../src/features/auth/AuthProvider'

vi.mock('../../src/features/auth/auth.api', () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
}))

const mockedLogin = vi.mocked(login)

function renderLoginPage() {
  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders the login form', () => {
    renderLoginPage()

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('uses browser validation for an invalid email', async () => {
    const user = userEvent.setup()

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'invalid-email')

    expect(screen.getByLabelText('Email')).toBeInvalid()
    expect(mockedLogin).not.toHaveBeenCalled()
  })

  it('shows validation error for a short password', async () => {
    const user = userEvent.setup()

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Password must be at least 8 characters.',
    )
    expect(mockedLogin).not.toHaveBeenCalled()
  })

  it('submits valid login data', async () => {
    const user = userEvent.setup()

    mockedLogin.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
      accessToken: 'test-token',
    })

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), '  test@example.com  ')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    expect(mockedLogin).toHaveBeenCalledTimes(1)
  })

  it('shows an API error when login fails', async () => {
    const user = userEvent.setup()

    mockedLogin.mockRejectedValue(new Error('Invalid credentials'))

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid credentials',
    )
  })

  it('shows an error for pending users', async () => {
    const user = userEvent.setup()

    mockedLogin.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'CANDIDATE',
        status: 'PENDING',
      },
      accessToken: 'test-token',
    })

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Account is not active.',
    )
  })
})

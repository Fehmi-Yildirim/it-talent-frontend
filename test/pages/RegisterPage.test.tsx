import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom/vitest'
import RegisterPage from '../../src/pages/RegisterPage'
import { register } from '../../src/features/auth/auth.api'

vi.mock('../../src/features/auth/auth.api', () => ({
  register: vi.fn(),
}))

const mockedRegister = vi.mocked(register)

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the registration form', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Register' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument()
  })

  it('uses browser validation for an invalid email', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email'), 'invalid-email')

    expect(screen.getByLabelText('Email')).toBeInvalid()
    expect(mockedRegister).not.toHaveBeenCalled()
  })

  it('submits recruiter registration data', async () => {
    const user = userEvent.setup()

    mockedRegister.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'recruiter@example.com',
        role: 'RECRUITER',
        status: 'PENDING',
      },
      accessToken: 'test-token',
    })

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(
      screen.getByLabelText('Email'),
      'recruiter@example.com',
    )
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.selectOptions(screen.getByLabelText('Account type'), 'RECRUITER')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => {
      expect(mockedRegister).toHaveBeenCalledWith({
        email: 'recruiter@example.com',
        password: 'password123',
        role: 'RECRUITER',
      })
    })
  })

  it('shows validation error for a short password', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Password must be at least 8 characters.',
    )
    expect(mockedRegister).not.toHaveBeenCalled()
  })

  it('submits valid registration data', async () => {
    const user = userEvent.setup()

    mockedRegister.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'CANDIDATE',
        status: 'PENDING',
      },
      accessToken: 'test-token',
    })

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email'), '  test@example.com  ')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => {
      expect(mockedRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        role: 'CANDIDATE',
      })
    })

    expect(mockedRegister).toHaveBeenCalledTimes(1)
  })

  it('redirects pending users to login without storing the access token', async () => {
    const user = userEvent.setup()

    mockedRegister.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'CANDIDATE',
        status: 'PENDING',
      },
      accessToken: 'test-token',
    })

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() => {
      expect(mockedRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        role: 'CANDIDATE',
      })
    })
  })

  it('shows an API error when registration fails', async () => {
    const user = userEvent.setup()

    mockedRegister.mockRejectedValue(new Error('Unable to create account'))

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Register' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to create account',
    )
  })
})

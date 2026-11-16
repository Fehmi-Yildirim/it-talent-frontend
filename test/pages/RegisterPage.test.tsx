
import {
  render,
  screen,
  waitFor,
} from '../test-utils'
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

const registrationResponse = {
  user: {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'CANDIDATE' as const,
    status: 'PENDING' as const,
    isDemo: false,
  },
  message: 'Registration received',
}

async function fillRegistrationForm(
  user: ReturnType<typeof userEvent.setup>,
  options: {
    firstName?: string
    lastName?: string
    email?: string
    password?: string
  } = {},
) {
  const firstName = options.firstName ?? 'Test'
  if (firstName) {
    await user.type(screen.getByLabelText('First name'), firstName)
  }
  await user.type(
    screen.getByLabelText('Last name'),
    options.lastName ?? 'User',
  )
  await user.type(
    screen.getByLabelText('Email'),
    options.email ?? 'test@example.com',
  )
  await user.type(
    screen.getByLabelText('Password'),
    options.password ?? 'password123',
  )
}

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
    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Account type'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Register' }),
    ).toBeInTheDocument()
  })

  it('submits recruiter registration data', async () => {
    const user = userEvent.setup()
    mockedRegister.mockResolvedValue({
      ...registrationResponse,
      user: {
        ...registrationResponse.user,
        role: 'RECRUITER',
      },
    })

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await fillRegistrationForm(user, {
      email: 'recruiter@example.com',
    })

    await user.selectOptions(
      screen.getByLabelText('Account type'),
      'RECRUITER',
    )

    await user.click(
      screen.getByRole('button', { name: 'Register' }),
    )

    await waitFor(() => {
      expect(mockedRegister).toHaveBeenCalledWith({
        firstName: 'Test',
        lastName: 'User',
        email: 'recruiter@example.com',
        password: 'password123',
        role: 'RECRUITER',
      })
    })
  })

  it('submits valid candidate registration data', async () => {
    const user = userEvent.setup()
    mockedRegister.mockResolvedValue(registrationResponse)

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await fillRegistrationForm(user, {
      firstName: '  Test  ',
      lastName: '  User  ',
      email: '  test@example.com  ',
    })

    await user.click(
      screen.getByRole('button', { name: 'Register' }),
    )

    await waitFor(() => {
      expect(mockedRegister).toHaveBeenCalledWith({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        role: 'CANDIDATE',
      })
    })

    expect(mockedRegister).toHaveBeenCalledTimes(1)
  })

  it('shows an error when the first name is missing', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await fillRegistrationForm(user, {
      firstName: '',
    })

    await user.click(
      screen.getByRole('button', { name: 'Register' }),
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'First name is required.',
    )
    expect(mockedRegister).not.toHaveBeenCalled()
  })

  it('shows an error for an invalid email', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await fillRegistrationForm(user, {
      email: 'invalid-email',
    })

    await user.click(
      screen.getByRole('button', { name: 'Register' }),
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a valid email address.',
    )
    expect(mockedRegister).not.toHaveBeenCalled()
  })

  it('shows a validation error for a short password', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await fillRegistrationForm(user, {
      password: 'short',
    })

    await user.click(
      screen.getByRole('button', { name: 'Register' }),
    )

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Password must be at least 8 characters.',
    )
    expect(mockedRegister).not.toHaveBeenCalled()
  })

  it('shows the pending approval confirmation without logging in', async () => {
    const user = userEvent.setup()
    mockedRegister.mockResolvedValue(registrationResponse)

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await fillRegistrationForm(user)

    await user.click(
      screen.getByRole('button', { name: 'Register' }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Registration received',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/awaiting administrator approval/i),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'Back to login' }),
    ).toHaveAttribute('href', '/login')

    expect(
      screen.queryByRole('heading', { name: 'Register' }),
    ).not.toBeInTheDocument()

    expect(mockedRegister).toHaveBeenCalledTimes(1)
  })

  it('shows an API error when registration fails', async () => {
    const user = userEvent.setup()

    mockedRegister.mockRejectedValue(
      new Error('Unable to create account'),
    )

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await fillRegistrationForm(user)

    await user.click(
      screen.getByRole('button', { name: 'Register' }),
    )

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Registration failed.')
  })
})

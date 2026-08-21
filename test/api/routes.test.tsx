import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { router } from '../../src/app/routes'
import { AuthProvider } from '../../src/features/auth/AuthProvider'
import { getCurrentUser } from '../../src/features/auth/auth.api'
import { getAccessToken } from '../../src/features/auth/auth.storage'

vi.mock('../../src/features/auth/auth.api', () => ({
    getCurrentUser: vi.fn(),
    login: vi.fn(),
}))

vi.mock('../../src/features/auth/auth.storage', () => ({
    getAccessToken: vi.fn(),
    setAccessToken: vi.fn(),
    clearAccessToken: vi.fn(),
}))

const mockedGetCurrentUser = vi.mocked(getCurrentUser)
const mockedGetAccessToken = vi.mocked(getAccessToken)

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
    })

    it('renders profile for authenticated users', async () => {
        mockedGetAccessToken.mockReturnValue('test-token')
        mockedGetCurrentUser.mockResolvedValue({
            id: 'user-1',
            email: 'test@example.com',
            role: 'CANDIDATE',
            status: 'ACTIVE',
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
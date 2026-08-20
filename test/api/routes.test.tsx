import React from 'react'
import { render, screen } from '@testing-library/react'
import { RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { router } from '../../src/app/routes'

vi.mock('../../src/features/auth/auth.storage', () => ({
    getAccessToken: vi.fn(),
}))

import { getAccessToken } from '../../src/features/auth/auth.storage'

const mockedGetAccessToken = vi.mocked(getAccessToken)

describe('application routes', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the landing page at /', async () => {
        mockedGetAccessToken.mockReturnValue(null)

        await router.navigate('/')

        render(<RouterProvider router={router} />)

        expect(
            await screen.findByRole('heading', {
                name: 'IT Talent',
            }),
        ).toBeInTheDocument()
    })

    it('renders the login page at /login', async () => {
        mockedGetAccessToken.mockReturnValue(null)

        await router.navigate('/login')

        render(<RouterProvider router={router} />)

        expect(
            await screen.findByRole('heading', {
                name: 'Login',
            }),
        ).toBeInTheDocument()
    })

    it('renders the register page at /register', async () => {
        mockedGetAccessToken.mockReturnValue(null)

        await router.navigate('/register')

        render(<RouterProvider router={router} />)

        expect(
            await screen.findByRole('heading', {
                name: 'Register',
            }),
        ).toBeInTheDocument()
    })

    it('redirects unauthenticated users from /dashboard to /login', async () => {
        mockedGetAccessToken.mockReturnValue(null)

        await router.navigate('/dashboard')

        render(<RouterProvider router={router} />)

        expect(
            await screen.findByRole('heading', {
                name: 'Login',
            }),
        ).toBeInTheDocument()
    })

    it('redirects unauthenticated users from /profile to /login', async () => {
        mockedGetAccessToken.mockReturnValue(null)

        await router.navigate('/profile')

        render(<RouterProvider router={router} />)

        expect(
            await screen.findByRole('heading', {
                name: 'Login',
            }),
        ).toBeInTheDocument()
    })

    it('renders dashboard for authenticated users', async () => {
        mockedGetAccessToken.mockReturnValue('test-token')

        await router.navigate('/dashboard')

        render(<RouterProvider router={router} />)

        expect(
            await screen.findByRole('heading', {
                name: 'Dashboard',
            }),
        ).toBeInTheDocument()
    })

    it('renders profile for authenticated users', async () => {
        mockedGetAccessToken.mockReturnValue('test-token')

        await router.navigate('/profile')

        render(<RouterProvider router={router} />)

        expect(
            await screen.findByRole('heading', {
                name: 'Profile',
            }),
        ).toBeInTheDocument()
    })

    it('renders the not-found page for unknown routes', async () => {
        mockedGetAccessToken.mockReturnValue(null)

        await router.navigate('/this-route-does-not-exist')

        render(<RouterProvider router={router} />)

        expect(
            await screen.findByRole('heading', {
                name: 'Page not found',
            }),
        ).toBeInTheDocument()
    })
})
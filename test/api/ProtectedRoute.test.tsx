import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import ProtectedRoute from '../../src/app/ProtectedRoute'
import { AuthProvider } from '../../src/features/auth/AuthProvider'
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { getCurrentUser } from '../../src/features/auth/auth.api'

const mockedGetCurrentUser = vi.mocked(getCurrentUser)

vi.mock('../../src/features/auth/auth.api', () => ({
    getCurrentUser: vi.fn(),
    login: vi.fn(),
}))
vi.mocked(getCurrentUser).mockResolvedValue({
    id: 'user-1',
    email: 'test@example.com',
    role: 'CANDIDATE',
    status: 'ACTIVE',
})
describe('ProtectedRoute', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('renders protected content when an access token exists', async () => {
        localStorage.setItem(
            'it-talent-access-token',
            'test-token',
        )

        mockedGetCurrentUser.mockResolvedValue({
            id: 'user-1',
            email: 'test@example.com',
            role: 'CANDIDATE',
            status: 'ACTIVE',
        })

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/dashboard']}>
                    <Routes>
                        <Route element={<ProtectedRoute />}>
                            <Route
                                path="/dashboard"
                                element={<div>Dashboard content</div>}
                            />
                        </Route>
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        )

        expect(
            screen.queryByText('Dashboard content'),
        ).not.toBeInTheDocument()

        await waitFor(() => {
            expect(
                screen.getByText('Dashboard content'),
            ).toBeInTheDocument()
        })
    })

    it('clears an invalid session and redirects to login', async () => {
        localStorage.setItem(
            'it-talent-access-token',
            'expired-token',
        )

        mockedGetCurrentUser.mockRejectedValue(
            new Error('Unauthorized'),
        )

        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/dashboard']}>
                    <Routes>
                        <Route element={<ProtectedRoute />}>
                            <Route
                                path="/dashboard"
                                element={<div>Dashboard content</div>}
                            />
                        </Route>

                        <Route
                            path="/login"
                            element={<div>Login page</div>}
                        />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Login page'),
            ).toBeInTheDocument()
        })

        expect(
            localStorage.getItem('it-talent-access-token'),
        ).toBeNull()

        expect(
            screen.queryByText('Dashboard content'),
        ).not.toBeInTheDocument()
    })

    it('redirects unauthenticated users to login', () => {
        render(
            <AuthProvider>
                <MemoryRouter initialEntries={['/dashboard']}>
                    <Routes>
                        <Route element={<ProtectedRoute />}>
                            <Route
                                path="/dashboard"
                                element={<div>Dashboard content</div>}
                            />
                        </Route>

                        <Route
                            path="/login"
                            element={<div>Login page</div>}
                        />
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        )

        expect(
            screen.getByText('Login page'),
        ).toBeInTheDocument()

        expect(
            screen.queryByText('Dashboard content'),
        ).not.toBeInTheDocument()
    })
})
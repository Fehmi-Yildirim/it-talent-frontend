import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import ProtectedRoute from '../../src/app/ProtectedRoute'
import { AuthProvider } from '../../src/features/auth/AuthProvider'
import '@testing-library/jest-dom/vitest'

describe('ProtectedRoute', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('renders protected content when an access token exists', () => {
        localStorage.setItem(
            'it-talent-access-token',
            'test-token',
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
                    </Routes>
                </MemoryRouter>
            </AuthProvider>,
        )

        expect(
            screen.getByText('Dashboard content'),
        ).toBeInTheDocument()
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
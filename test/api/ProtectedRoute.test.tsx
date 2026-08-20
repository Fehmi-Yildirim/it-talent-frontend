import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProtectedRoute from '../../src/app/ProtectedRoute'
import '@testing-library/jest-dom/vitest'

vi.mock('../../src/features/auth/auth.storage', () => ({
    getAccessToken: vi.fn(),
}))

import { getAccessToken } from '../../src/features/auth/auth.storage'

const mockedGetAccessToken = vi.mocked(getAccessToken)

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders protected content when an access token exists', () => {
        mockedGetAccessToken.mockReturnValue('test-token')

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route
                            path="/dashboard"
                            element={<div>Dashboard content</div>}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>,
        )

        expect(
            screen.getByText('Dashboard content'),
        ).toBeInTheDocument()
    })

    it('redirects unauthenticated users to login', () => {
        mockedGetAccessToken.mockReturnValue(null)

        render(
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
            </MemoryRouter>,
        )

        expect(screen.getByText('Login page')).toBeInTheDocument()
        expect(
            screen.queryByText('Dashboard content'),
        ).not.toBeInTheDocument()
    })
})
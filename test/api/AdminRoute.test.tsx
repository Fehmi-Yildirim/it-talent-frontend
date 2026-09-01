import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminRoute from '../../src/app/AdminRoute'

const mockUseAuth = vi.fn()

vi.mock('../../src/features/auth/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}))

function renderAdminRoute() {
    return render(
        <MemoryRouter initialEntries={['/admin/users']}>
            <Routes>
                <Route element={<AdminRoute />}>
                    <Route path="/admin/users" element={<div>Admin Users</div>} />
                </Route>

                <Route path="/login" element={<div>Login</div>} />
                <Route path="/dashboard" element={<div>Dashboard</div>} />
            </Routes>
        </MemoryRouter>,
    )
}

describe('AdminRoute', () => {
    it('should render nothing while authentication is loading', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoading: true,
        })

        const { container } = renderAdminRoute()

        expect(container.innerHTML).toBe('')
    })

    it('should redirect unauthenticated users to login', () => {
        mockUseAuth.mockReturnValue({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        })

        renderAdminRoute()

        expect(screen.getByText('Login')).toBeTruthy()
    })

    it('should redirect candidates to dashboard', () => {
        mockUseAuth.mockReturnValue({
            user: { role: 'CANDIDATE' },
            isAuthenticated: true,
            isLoading: false,
        })

        renderAdminRoute()

        expect(screen.getByText('Dashboard')).toBeTruthy()
    })

    it('should redirect recruiters to dashboard', () => {
        mockUseAuth.mockReturnValue({
            user: { role: 'RECRUITER' },
            isAuthenticated: true,
            isLoading: false,
        })

        renderAdminRoute()

        expect(screen.getByText('Dashboard')).toBeTruthy()
    })

    it('should allow admins to access the admin route', () => {
        mockUseAuth.mockReturnValue({
            user: { role: 'ADMIN' },
            isAuthenticated: true,
            isLoading: false,
        })

        renderAdminRoute()

        expect(screen.getByText('Admin Users')).toBeTruthy()
    })
})

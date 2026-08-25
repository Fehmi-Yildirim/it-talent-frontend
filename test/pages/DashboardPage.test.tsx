import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom/vitest'
import DashboardPage from '../../src/pages/DashboardPage'
import { AuthProvider } from '../../src/features/auth/AuthProvider'
import { getCurrentUser } from '../../src/features/auth/auth.api'
import { getAccessToken } from '../../src/features/auth/auth.storage'

vi.mock('../../src/features/auth/auth.api', () => ({
    getCurrentUser: vi.fn(),
}))

vi.mock('../../src/features/auth/auth.storage', () => ({
    getAccessToken: vi.fn(),
}))

const mockedGetCurrentUser = vi.mocked(getCurrentUser)
const mockedGetAccessToken = vi.mocked(getAccessToken)

function renderDashboardPage() {
    render(
        <MemoryRouter>
            <AuthProvider>
                <DashboardPage />
            </AuthProvider>
        </MemoryRouter>,
    )
}

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockedGetAccessToken.mockReturnValue('test-token')

        mockedGetCurrentUser.mockResolvedValue({
            id: 'user-1',
            email: 'test@example.com',
            role: 'CANDIDATE',
            status: 'ACTIVE',
        })
    })

    it('renders the dashboard', async () => {
        renderDashboardPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Dashboard',
            }),
        ).toBeInTheDocument()
    })

    it('displays the current user information', async () => {
        renderDashboardPage()

        expect(
            await screen.findByText('test@example.com'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('CANDIDATE'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('ACTIVE'),
        ).toBeInTheDocument()
    })

    it('provides navigation to the profile page', async () => {
        renderDashboardPage()

        const profileLink = await screen.findByRole('link', {
            name: 'View profile',
        })

        expect(profileLink).toHaveAttribute(
            'href',
            '/profile',
        )
    })
})
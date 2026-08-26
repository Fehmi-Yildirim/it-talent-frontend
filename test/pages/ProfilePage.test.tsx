import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import ProfilePage from '../../src/pages/ProfilePage'
import { useAuth } from '../../src/features/auth/AuthProvider'
import {
    getCandidateProfile,
    type CandidateProfile,
} from '../../src/features/candidate/candidate.api'

vi.mock('../../src/features/auth/AuthProvider', () => ({
    useAuth: vi.fn(),
}))

vi.mock('../../src/features/candidate/candidate.api', () => ({
    getCandidateProfile: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)
const mockedGetCandidateProfile = vi.mocked(getCandidateProfile)

const candidateProfile: CandidateProfile = {
    id: 'candidate-profile-id',
    userId: 'candidate-user-id',
    headline: 'Senior TypeScript Developer',
    summary: 'Experienced backend and frontend developer.',
    location: 'Amsterdam',
    salaryMin: '5000',
    salaryMax: '7000',
    currency: 'EUR',
    remotePreference: 'HYBRID',
    availabilityDate: '2026-09-01',
    createdAt: '2026-01-01T12:00:00.000Z',
    updatedAt: '2026-08-25T12:00:00.000Z',
}

function renderProfilePage() {
    return render(
        <MemoryRouter>
            <ProfilePage />
        </MemoryRouter>,
    )
}

describe('ProfilePage', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockedGetCandidateProfile.mockResolvedValue(candidateProfile)
    })

    it('should display authenticated candidate account information', () => {
        mockedUseAuth.mockReturnValue({
            user: {
                id: 'candidate-user-id',
                email: 'candidate@example.com',
                role: 'CANDIDATE',
                status: 'ACTIVE',
            },
        } as ReturnType<typeof useAuth>)

        renderProfilePage()

        expect(
            screen.getByRole('heading', { name: 'Profile' }),
        ).toBeTruthy()

        expect(
            screen.getByText('candidate@example.com'),
        ).toBeTruthy()

        expect(
            screen.getByText('CANDIDATE'),
        ).toBeTruthy()

        expect(
            screen.getByText('ACTIVE'),
        ).toBeTruthy()
    })

    it('should load and display the candidate profile', async () => {
        mockedUseAuth.mockReturnValue({
            user: {
                id: 'candidate-user-id',
                email: 'candidate@example.com',
                role: 'CANDIDATE',
                status: 'ACTIVE',
            },
        } as ReturnType<typeof useAuth>)

        renderProfilePage()

        expect(
            screen.getByText('Loading candidate profile...'),
        ).toBeTruthy()

        await waitFor(() => {
            expect(
                screen.getByText('Senior TypeScript Developer'),
            ).toBeTruthy()

            expect(
                screen.getByText('Experienced backend and frontend developer.'),
            ).toBeTruthy()
        })

        expect(
            mockedGetCandidateProfile,
        ).toHaveBeenCalledTimes(1)
    })

    it('should display an error when the candidate profile cannot be loaded', async () => {
        mockedUseAuth.mockReturnValue({
            user: {
                id: 'candidate-user-id',
                email: 'candidate@example.com',
                role: 'CANDIDATE',
                status: 'ACTIVE',
            },
        } as ReturnType<typeof useAuth>)

        mockedGetCandidateProfile.mockRejectedValueOnce(
            new Error('Candidate profile not found'),
        )

        renderProfilePage()

        const alert = await waitFor(() =>
            screen.getByRole('alert'),
        )

        expect(alert).toBeTruthy()
        expect(alert.textContent).toBe(
            'Unable to load your candidate profile.',
        )
    })

    // Candidate Profile test
    it('should handle nullable candidate profile fields', async () => {
        mockedUseAuth.mockReturnValue({
            user: {
                id: 'candidate-user-id',
                email: 'candidate@example.com',
                role: 'CANDIDATE',
                status: 'ACTIVE',
            },
        } as ReturnType<typeof useAuth>)

        mockedGetCandidateProfile.mockResolvedValueOnce({
            ...candidateProfile,
            salaryMin: null,
            salaryMax: null,
            currency: null,
            availabilityDate: null,
        })

        renderProfilePage()

        await waitFor(() => {
            expect(
                screen.getAllByText('Not specified'),
            ).toHaveLength(2)
        })

        expect(
            screen.getByText('Senior TypeScript Developer'),
        ).toBeTruthy()

        expect(
            screen.getByText('Amsterdam'),
        ).toBeTruthy()

        expect(
            screen.getByText('HYBRID'),
        ).toBeTruthy()
    })


    // Recruiter-test
    it('should not load the candidate profile for a recruiter', async () => {
        mockedUseAuth.mockReturnValue({
            user: {
                id: 'recruiter-user-id',
                email: 'recruiter@example.com',
                role: 'RECRUITER',
                status: 'ACTIVE',
            },
        } as ReturnType<typeof useAuth>)

        renderProfilePage()

        expect(
            screen.getByText('recruiter@example.com'),
        ).toBeTruthy()

        expect(
            screen.queryByRole('heading', {
                name: 'Candidate profile',
            }),
        ).toBeNull()

        await waitFor(() => {
            expect(
                mockedGetCandidateProfile,
            ).not.toHaveBeenCalled()
        })
    })
})

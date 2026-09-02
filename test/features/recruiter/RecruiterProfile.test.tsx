import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RecruiterProfile from '../../../src/features/recruiter/RecruiterProfile'
import {
    getRecruiterProfile,
    updateRecruiterProfile,
} from '../../../src/features/recruiter/recruiter.api'

vi.mock('../../../src/features/recruiter/recruiter.api', () => ({
    getRecruiterProfile: vi.fn(),
    updateRecruiterProfile: vi.fn(),
}))

describe('RecruiterProfile', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading state', () => {
        vi.mocked(getRecruiterProfile).mockReturnValue(
            new Promise(() => undefined),
        )

        render(<RecruiterProfile />)

        expect(
            screen.getByText('Recruiterprofiel laden...'),
        ).toBeInTheDocument()
    })

    it('loads and displays recruiter profile', async () => {
        vi.mocked(getRecruiterProfile).mockResolvedValue({
            id: 'recruiter-1',
            userId: 'user-1',
            companyId: null,
            jobTitle: 'Senior Recruiter',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
        })

        render(<RecruiterProfile />)

        expect(await screen.findByDisplayValue('Senior Recruiter')).toBeInTheDocument()
        expect(getRecruiterProfile).toHaveBeenCalledOnce()
    })

    it('shows error when profile cannot be loaded', async () => {
        vi.mocked(getRecruiterProfile).mockRejectedValue(
            new Error('Request failed'),
        )

        render(<RecruiterProfile />)

        expect(
            await screen.findByText(
                'Recruiterprofiel kon niet worden geladen.',
            ),
        ).toBeInTheDocument()
    })

    it('updates recruiter job title', async () => {
        vi.mocked(getRecruiterProfile).mockResolvedValue({
            id: 'recruiter-1',
            userId: 'user-1',
            companyId: null,
            jobTitle: 'Recruiter',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
        })

        vi.mocked(updateRecruiterProfile).mockResolvedValue({
            id: 'recruiter-1',
            userId: 'user-1',
            companyId: null,
            jobTitle: 'Senior Recruiter',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-02',
        })

        render(<RecruiterProfile />)

        const input = await screen.findByDisplayValue('Recruiter')

        fireEvent.change(input, {
            target: { value: 'Senior Recruiter' },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

        await waitFor(() => {
            expect(updateRecruiterProfile).toHaveBeenCalledWith({
                jobTitle: 'Senior Recruiter',
            })
        })

        expect(
            await screen.findByText('Recruiterprofiel opgeslagen.'),
        ).toBeInTheDocument()
    })

    it('shows error when update fails', async () => {
        vi.mocked(getRecruiterProfile).mockResolvedValue({
            id: 'recruiter-1',
            userId: 'user-1',
            companyId: null,
            jobTitle: 'Recruiter',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
        })

        vi.mocked(updateRecruiterProfile).mockRejectedValue(
            new Error('Request failed'),
        )

        render(<RecruiterProfile />)

        const input = await screen.findByDisplayValue('Recruiter')

        fireEvent.change(input, {
            target: { value: 'Senior Recruiter' },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

        expect(
            await screen.findByText(
                'Recruiterprofiel kon niet worden opgeslagen.',
            ),
        ).toBeInTheDocument()
    })
})
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '../test-utils'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CandidateApplicationDetailsPage from '../../src/pages/CandidateApplicationDetailsPage'
import type { CandidateApplicationDetail } from '../../src/types/application'

const {
    getMyApplicationMock,
    withdrawApplicationMock,
} = vi.hoisted(() => ({
    getMyApplicationMock: vi.fn(),
    withdrawApplicationMock: vi.fn(),
}))

vi.mock('../../src/features/applications/applications.api', () => ({
    getMyApplication: getMyApplicationMock,
    withdrawApplication: withdrawApplicationMock,
}))

const baseApplication: CandidateApplicationDetail = {
    id: 'application-1',
    jobId: 'job-1',
    candidateId: 'candidate-1',
    status: 'PENDING',
    coverLetter: 'I am very interested in this position.',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-02T10:00:00.000Z',
    candidate: {
        id: 'candidate-1',
        firstName: 'John',
        lastName: 'Doe',
    },
    job: {
        id: 'job-1',
        title: 'Senior React Developer',
        location: 'Amsterdam',
        employmentType: 'FULL_TIME',
        workMode: 'HYBRID',
        company: {
            id: 'company-1',
            name: 'Tech Company',
        },
    },
}

function renderPage(applicationId = 'application-1') {
    return render(
        <MemoryRouter
            initialEntries={[
                `/applications/${applicationId}`,
            ]}
        >
            <Routes>
                <Route
                    path="/applications/:applicationId"
                    element={<CandidateApplicationDetailsPage />}
                />
            </Routes>
        </MemoryRouter>,
    )
}

describe('CandidateApplicationDetailsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading state while loading the application', () => {
        getMyApplicationMock.mockReturnValue(
            new Promise(() => undefined),
        )

        renderPage()

        expect(screen.getByRole('status')).toHaveTextContent(
            'Loading application...',
        )
    })

    it('renders application details', async () => {
        getMyApplicationMock.mockResolvedValue(baseApplication)

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Tech Company'),
        ).toBeInTheDocument()

        expect(
            screen.getAllByText('Pending').length,
        ).toBeGreaterThan(0)

        expect(
            screen.getByText(
                'I am very interested in this position.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Withdraw application',
            }),
        ).toBeInTheDocument()
    })

    it('withdraws a pending application', async () => {
        getMyApplicationMock
            .mockResolvedValueOnce(baseApplication)
            .mockResolvedValueOnce({
                ...baseApplication,
                status: 'WITHDRAWN',
            })

        withdrawApplicationMock.mockResolvedValue({
            ...baseApplication,
            status: 'WITHDRAWN',
        })

        vi.spyOn(window, 'confirm').mockReturnValue(true)

        renderPage()

        const withdrawButton =
            await screen.findByRole('button', {
                name: 'Withdraw application',
            })

        fireEvent.click(withdrawButton)

        await waitFor(() => {
            expect(withdrawApplicationMock).toHaveBeenCalledWith(
                'application-1',
            )
        })

        expect(
            await screen.findByText('Withdrawn', { selector: 'span' }),
        ).toBeInTheDocument()

        vi.restoreAllMocks()
    })

    it('does not withdraw when confirmation is cancelled', async () => {
        getMyApplicationMock.mockResolvedValue(baseApplication)

        vi.spyOn(window, 'confirm').mockReturnValue(false)

        renderPage()

        const withdrawButton =
            await screen.findByRole('button', {
                name: 'Withdraw application',
            })

        fireEvent.click(withdrawButton)

        expect(withdrawApplicationMock).not.toHaveBeenCalled()

        vi.restoreAllMocks()
    })

    it('does not show withdraw action for a withdrawn application', async () => {
        getMyApplicationMock.mockResolvedValue({
            ...baseApplication,
            status: 'WITHDRAWN',
        })

        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        expect(
            screen.queryByRole('button', {
                name: 'Withdraw application',
            }),
        ).not.toBeInTheDocument()
    })

    it('shows an error when loading the application fails', async () => {
        getMyApplicationMock.mockRejectedValue(
            new Error('API error'),
        )

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Unable to load application',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('link', {
                name: 'Back to applications',
            }),
        ).toBeInTheDocument()
    })

    it('shows access denied when loading is unauthorized', async () => {
        const { ApiError } = await import(
            '../../src/services/api/apiError'
        )

        getMyApplicationMock.mockRejectedValue(
            new ApiError(403, 'Forbidden'),
        )

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Access denied',
            }),
        ).toBeInTheDocument()
    })
})
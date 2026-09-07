import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import RecruiterApplicationDetailsPage from '../../src/pages/RecruiterApplicationDetailsPage'
import type { RecruiterApplicationDetail } from '../../src/types/application'

const {
    getRecruiterApplicationMock,
    updateApplicationStatusMock,
} = vi.hoisted(() => ({
    getRecruiterApplicationMock: vi.fn(),
    updateApplicationStatusMock: vi.fn(),
}))

vi.mock('../../src/features/applications/applications.api', () => ({
    getRecruiterApplication: getRecruiterApplicationMock,
    updateApplicationStatus: updateApplicationStatusMock,
}))

const baseApplication: RecruiterApplicationDetail = {
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
        workMode: 'HYBRID',
        employmentType: 'FULL_TIME',
        company: {
            id: 'company-1',
            name: 'Tech Company',
        },
    },
    company: {
        id: 'company-1',
        name: 'Tech Company',
    },
}

function renderPage(applicationId = 'application-1') {
    return render(
        <MemoryRouter
            initialEntries={[
                `/recruiter/applications/${applicationId}`,
            ]}
        >
            <Routes>
                <Route
                    path="/recruiter/applications/:applicationId"
                    element={<RecruiterApplicationDetailsPage />}
                />
            </Routes>
        </MemoryRouter>,
    )
}

describe('RecruiterApplicationDetailsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading state while loading the application', () => {
        getRecruiterApplicationMock.mockReturnValue(
            new Promise(() => undefined),
        )

        renderPage()

        expect(screen.getByRole('status')).toHaveTextContent(
            'Loading application...',
        )
    })

    it('renders application and candidate details', async () => {
        getRecruiterApplicationMock.mockResolvedValue(
            baseApplication,
        )

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        expect(screen.getAllByText('John Doe')).toHaveLength(2)
        expect(screen.getByRole('button', { name: 'Pending' })).toBeInTheDocument()

        expect(
            screen.getByText(
                'I am very interested in this position.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Accept',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Reject',
            }),
        ).toBeInTheDocument()
    })

    it('updates the application status', async () => {
        getRecruiterApplicationMock.mockResolvedValue(
            baseApplication,
        )

        const updatedApplication: RecruiterApplicationDetail = {
            ...baseApplication,
            status: 'ACCEPTED',
        }

        updateApplicationStatusMock.mockResolvedValue(
            updatedApplication,
        )

        renderPage()

        const acceptButton = await screen.findByRole('button', {
            name: 'Accept',
        })

        fireEvent.click(acceptButton)

        await waitFor(() => {
            expect(
                updateApplicationStatusMock,
            ).toHaveBeenCalledWith('application-1', {
                status: 'ACCEPTED',
            })
        })

        expect(
            await screen.findByText('Accepted'),
        ).toBeInTheDocument()
    })

    it('shows an API error when loading fails', async () => {
        getRecruiterApplicationMock.mockRejectedValue(
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
        getRecruiterApplicationMock.mockRejectedValue({
            status: 403,
        })

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Unable to load application',
            }),
        ).toBeInTheDocument()
    })

    it('shows an error when updating the status fails', async () => {
        getRecruiterApplicationMock.mockResolvedValue(
            baseApplication,
        )
        updateApplicationStatusMock.mockRejectedValue(
            new Error('API error'),
        )

        renderPage()

        const rejectButton = await screen.findByRole('button', {
            name: 'Reject',
        })

        fireEvent.click(rejectButton)

        expect(
            await screen.findByRole('alert'),
        ).toHaveTextContent(
            'Unable to update the application status.',
        )
    })

    it('does not show status actions for withdrawn applications', async () => {
        getRecruiterApplicationMock.mockResolvedValue({
            ...baseApplication,
            status: 'WITHDRAWN',
        })

        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        expect(
            screen.queryByRole('button', {
                name: 'Accept',
            }),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByRole('button', {
                name: 'Reject',
            }),
        ).not.toBeInTheDocument()
    })
})
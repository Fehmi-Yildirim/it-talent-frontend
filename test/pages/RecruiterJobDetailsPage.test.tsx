import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '../test-utils'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import RecruiterJobDetailsPage from '../../src/pages/RecruiterJobDetailsPage'
import type { Job } from '../../src/types/job'

const {
    getJobByIdMock,
    publishJobMock,
    pauseJobMock,
    resumeJobMock,
    closeJobMock,
    reopenJobMock,
} = vi.hoisted(() => ({
    getJobByIdMock: vi.fn(),
    publishJobMock: vi.fn(),
    pauseJobMock: vi.fn(),
    resumeJobMock: vi.fn(),
    closeJobMock: vi.fn(),
    reopenJobMock: vi.fn(),
}))

vi.mock('../../src/features/jobs/jobs.api', () => ({
    getJobById: getJobByIdMock,
    publishJob: publishJobMock,
    pauseJob: pauseJobMock,
    resumeJob: resumeJobMock,
    closeJob: closeJobMock,
    reopenJob: reopenJobMock,
}))

const baseJob: Job = {
    id: 'job-1',
    companyId: 'company-1',
    createdByRecruiterId: 'recruiter-1',
    title: 'Senior React Developer',
    description: 'Build and maintain modern React applications.',
    location: 'Amsterdam',
    employmentType: 'FULL_TIME',
    workMode: 'HYBRID',
    salaryMin: 5000,
    salaryMax: 7000,
    currency: 'EUR',
    expiresAt: '2026-12-31T00:00:00.000Z',
    status: 'DRAFT',
    publishedAt: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    requirements: [
        {
            id: 'requirement-1',
            jobId: 'job-1',
            skillId: 'skill-1',
            required: true,
            minimumLevel: 3,
            skill: {
                id: 'skill-1',
                name: 'React',
            },
        },
        {
            id: 'requirement-2',
            jobId: 'job-1',
            skillId: 'skill-2',
            required: false,
            minimumLevel: 2,
            skill: {
                id: 'skill-2',
                name: 'TypeScript',
            },
        },
    ],
}

function renderPage(jobId = 'job-1') {
    return render(
        <MemoryRouter initialEntries={[`/recruiter/jobs/${jobId}`]}>
            <Routes>
                <Route
                    path="/recruiter/jobs/:jobId"
                    element={<RecruiterJobDetailsPage />}
                />
            </Routes>
        </MemoryRouter>,
    )
}

describe('RecruiterJobDetailsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading state while loading the job', () => {
        getJobByIdMock.mockReturnValue(new Promise(() => undefined))

        renderPage()

        expect(screen.getByRole('status')).toHaveTextContent(
            'Loading job...',
        )
    })

    it('renders job details', async () => {
        getJobByIdMock.mockResolvedValue(baseJob)

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Build and maintain modern React applications.',
            ),
        ).toBeInTheDocument()

        expect(screen.getAllByText('Amsterdam').length).toBeGreaterThan(0)
        expect(screen.getByText('React')).toBeInTheDocument()
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
        expect(screen.getByText('Minimum level: 3')).toBeInTheDocument()
        expect(screen.getByText('Minimum level: 2')).toBeInTheDocument()

        expect(
            screen.getByRole('link', { name: 'Edit' }),
        ).toHaveAttribute(
            'href',
            '/recruiter/jobs/job-1/edit',
        )
    })

    it('publishes a draft job and refreshes the job', async () => {
        const publishedJob: Job = {
            ...baseJob,
            status: 'PUBLISHED',
            publishedAt: '2026-09-01T10:00:00.000Z',
        }

        getJobByIdMock
            .mockResolvedValueOnce(baseJob)
            .mockResolvedValueOnce(publishedJob)

        publishJobMock.mockResolvedValue(publishedJob)

        renderPage()

        const publishButton = await screen.findByRole('button', {
            name: 'Publish job',
        })

        fireEvent.click(publishButton)

        await waitFor(() => {
            expect(publishJobMock).toHaveBeenCalledWith('job-1')
        })

        await waitFor(() => {
            expect(getJobByIdMock).toHaveBeenCalledTimes(2)
        })

        expect(
            await screen.findByText('Job published successfully.'),
        ).toBeInTheDocument()

        expect(
            screen.getAllByText('Published').length,
        ).toBeGreaterThan(0)

        expect(
            screen.getByRole('button', {
                name: 'Pause job',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Close job',
            }),
        ).toBeInTheDocument()
    })

    it('pauses a published job and refreshes the job', async () => {
        const publishedJob: Job = {
            ...baseJob,
            status: 'PUBLISHED',
            publishedAt: '2026-09-01T10:00:00.000Z',
        }

        const pausedJob: Job = {
            ...publishedJob,
            status: 'PAUSED',
        }

        getJobByIdMock
            .mockResolvedValueOnce(publishedJob)
            .mockResolvedValueOnce(pausedJob)

        pauseJobMock.mockResolvedValue(pausedJob)

        renderPage()

        const pauseButton = await screen.findByRole('button', {
            name: 'Pause job',
        })

        fireEvent.click(pauseButton)

        await waitFor(() => {
            expect(pauseJobMock).toHaveBeenCalledWith('job-1')
        })

        await waitFor(() => {
            expect(getJobByIdMock).toHaveBeenCalledTimes(2)
        })

        expect(
            await screen.findByText('Job paused successfully.'),
        ).toBeInTheDocument()

        expect(screen.getByText('Paused')).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Resume job',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Close job',
            }),
        ).toBeInTheDocument()
    })

    it('resumes a paused job and refreshes the job', async () => {
        const pausedJob: Job = {
            ...baseJob,
            status: 'PAUSED',
            publishedAt: '2026-09-01T10:00:00.000Z',
        }

        const resumedJob: Job = {
            ...pausedJob,
            status: 'PUBLISHED',
        }

        getJobByIdMock
            .mockResolvedValueOnce(pausedJob)
            .mockResolvedValueOnce(resumedJob)

        resumeJobMock.mockResolvedValue(resumedJob)

        renderPage()

        const resumeButton = await screen.findByRole('button', {
            name: 'Resume job',
        })

        fireEvent.click(resumeButton)

        await waitFor(() => {
            expect(resumeJobMock).toHaveBeenCalledWith('job-1')
        })

        await waitFor(() => {
            expect(getJobByIdMock).toHaveBeenCalledTimes(2)
        })

        expect(
            await screen.findByText('Job resumed successfully.'),
        ).toBeInTheDocument()

        expect(
            screen.getAllByText('Published').length,
        ).toBeGreaterThan(0)

        expect(
            screen.getByRole('button', {
                name: 'Pause job',
            }),
        ).toBeInTheDocument()
    })

    it('closes a published job and refreshes the job', async () => {
        const publishedJob: Job = {
            ...baseJob,
            status: 'PUBLISHED',
            publishedAt: '2026-09-01T10:00:00.000Z',
        }

        const closedJob: Job = {
            ...publishedJob,
            status: 'CLOSED',
        }

        getJobByIdMock
            .mockResolvedValueOnce(publishedJob)
            .mockResolvedValueOnce(closedJob)

        closeJobMock.mockResolvedValue(closedJob)

        renderPage()

        const closeButton = await screen.findByRole('button', {
            name: 'Close job',
        })

        fireEvent.click(closeButton)

        await waitFor(() => {
            expect(closeJobMock).toHaveBeenCalledWith('job-1')
        })

        await waitFor(() => {
            expect(getJobByIdMock).toHaveBeenCalledTimes(2)
        })

        expect(
            await screen.findByText('Job closed successfully.'),
        ).toBeInTheDocument()

        expect(screen.getByText('Closed')).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Reopen job',
            }),
        ).toBeInTheDocument()
    })

    it('closes a paused job and refreshes the job', async () => {
        const pausedJob: Job = {
            ...baseJob,
            status: 'PAUSED',
            publishedAt: '2026-09-01T10:00:00.000Z',
        }

        const closedJob: Job = {
            ...pausedJob,
            status: 'CLOSED',
        }

        getJobByIdMock
            .mockResolvedValueOnce(pausedJob)
            .mockResolvedValueOnce(closedJob)

        closeJobMock.mockResolvedValue(closedJob)

        renderPage()

        const closeButton = await screen.findByRole('button', {
            name: 'Close job',
        })

        fireEvent.click(closeButton)

        await waitFor(() => {
            expect(closeJobMock).toHaveBeenCalledWith('job-1')
        })

        await waitFor(() => {
            expect(getJobByIdMock).toHaveBeenCalledTimes(2)
        })

        expect(
            await screen.findByText('Job closed successfully.'),
        ).toBeInTheDocument()

        expect(screen.getByText('Closed')).toBeInTheDocument()
    })

    it('reopens a closed job and refreshes the job', async () => {
        const closedJob: Job = {
            ...baseJob,
            status: 'CLOSED',
        }

        const reopenedJob: Job = {
            ...closedJob,
            status: 'DRAFT',
        }

        getJobByIdMock
            .mockResolvedValueOnce(closedJob)
            .mockResolvedValueOnce(reopenedJob)

        reopenJobMock.mockResolvedValue(reopenedJob)

        renderPage()

        const reopenButton = await screen.findByRole('button', {
            name: 'Reopen job',
        })

        fireEvent.click(reopenButton)

        await waitFor(() => {
            expect(reopenJobMock).toHaveBeenCalledWith('job-1')
        })

        await waitFor(() => {
            expect(getJobByIdMock).toHaveBeenCalledTimes(2)
        })

        expect(
            await screen.findByText('Job reopened successfully.'),
        ).toBeInTheDocument()

        expect(screen.getByText('Draft')).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Publish job',
            }),
        ).toBeInTheDocument()
    })

    it('handles a job without requirements', async () => {
        const jobWithoutRequirements: Job = {
            ...baseJob,
            requirements: undefined as unknown as Job['requirements'],
        }

        getJobByIdMock.mockResolvedValue(jobWithoutRequirements)

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('No requirements configured.'),
        ).toBeInTheDocument()
    })

    it('shows an API error when loading fails', async () => {
        getJobByIdMock.mockRejectedValue(new Error('API error'))

        renderPage()

        expect(
            await screen.findByText('Unable to load this job.'),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('link', { name: 'Back to jobs' }),
        ).toBeInTheDocument()
    })

    it('shows an API error when publishing fails', async () => {
        getJobByIdMock.mockResolvedValue(baseJob)
        publishJobMock.mockRejectedValue(new Error('API error'))

        renderPage()

        const publishButton = await screen.findByRole('button', {
            name: 'Publish job',
        })

        fireEvent.click(publishButton)

        expect(
            await screen.findByText(
                'Unable to publish this job. Please try again.',
            ),
        ).toBeInTheDocument()

        expect(getJobByIdMock).toHaveBeenCalledTimes(1)
    })

    it('shows an API error when pausing fails', async () => {
        const publishedJob: Job = {
            ...baseJob,
            status: 'PUBLISHED',
            publishedAt: '2026-09-01T10:00:00.000Z',
        }

        getJobByIdMock.mockResolvedValue(publishedJob)
        pauseJobMock.mockRejectedValue(new Error('API error'))

        renderPage()

        const pauseButton = await screen.findByRole('button', {
            name: 'Pause job',
        })

        fireEvent.click(pauseButton)

        expect(
            await screen.findByText(
                'Unable to pause this job. Please try again.',
            ),
        ).toBeInTheDocument()

        expect(getJobByIdMock).toHaveBeenCalledTimes(1)
    })

    it('shows an API error when resuming fails', async () => {
        const pausedJob: Job = {
            ...baseJob,
            status: 'PAUSED',
            publishedAt: '2026-09-01T10:00:00.000Z',
        }

        getJobByIdMock.mockResolvedValue(pausedJob)
        resumeJobMock.mockRejectedValue(new Error('API error'))

        renderPage()

        const resumeButton = await screen.findByRole('button', {
            name: 'Resume job',
        })

        fireEvent.click(resumeButton)

        expect(
            await screen.findByText(
                'Unable to resume this job. Please try again.',
            ),
        ).toBeInTheDocument()

        expect(getJobByIdMock).toHaveBeenCalledTimes(1)
    })

    it('shows an API error when closing fails', async () => {
        const publishedJob: Job = {
            ...baseJob,
            status: 'PUBLISHED',
            publishedAt: '2026-09-01T10:00:00.000Z',
        }

        getJobByIdMock.mockResolvedValue(publishedJob)
        closeJobMock.mockRejectedValue(new Error('API error'))

        renderPage()

        const closeButton = await screen.findByRole('button', {
            name: 'Close job',
        })

        fireEvent.click(closeButton)

        expect(
            await screen.findByText(
                'Unable to close this job. Please try again.',
            ),
        ).toBeInTheDocument()

        expect(getJobByIdMock).toHaveBeenCalledTimes(1)
    })

    it('shows an API error when reopening fails', async () => {
        const closedJob: Job = {
            ...baseJob,
            status: 'CLOSED',
        }

        getJobByIdMock.mockResolvedValue(closedJob)
        reopenJobMock.mockRejectedValue(new Error('API error'))

        renderPage()

        const reopenButton = await screen.findByRole('button', {
            name: 'Reopen job',
        })

        fireEvent.click(reopenButton)

        expect(
            await screen.findByText(
                'Unable to reopen this job. Please try again.',
            ),
        ).toBeInTheDocument()

        expect(getJobByIdMock).toHaveBeenCalledTimes(1)
    })
})
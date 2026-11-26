import { beforeEach, describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor, within } from '../test-utils'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import RecruiterJobDetailsPage from '../../src/pages/RecruiterJobDetailsPage'
import type { Job } from '../../src/types/job'
import type { RecruiterCandidateMatch } from '../../src/types/matching'

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

const { authUserMock } = vi.hoisted(() => ({
    authUserMock: {
        current: { isDemo: false as boolean },
    },
}))

vi.mock('../../src/features/auth/useAuth', () => ({
    useAuth: () => ({
        user: { isDemo: authUserMock.current.isDemo },
    }),
}))

vi.mock('../../src/features/jobs/jobs.api', () => ({
    getJobById: getJobByIdMock,
    publishJob: publishJobMock,
    pauseJob: pauseJobMock,
    resumeJob: resumeJobMock,
    closeJob: closeJobMock,
    reopenJob: reopenJobMock,
}))

const { getCandidatesForJobMock } = vi.hoisted(() => ({
    getCandidatesForJobMock: vi.fn(),
}))

vi.mock('../../src/features/matching/matching.api', () => ({
    getCandidatesForJob: getCandidatesForJobMock,
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

const publishedJob: Job = {
    ...baseJob,
    status: 'PUBLISHED',
    publishedAt: '2026-09-01T10:00:00.000Z',
}

const candidateMatch: RecruiterCandidateMatch = {
    id: 'match-1',
    candidateId: 'candidate-1',
    jobId: 'job-1',
    overallScore: 85,
    skillScore: 90,
    experienceScore: 80,
    locationScore: 100,
    salaryScore: null,
    availabilityScore: null,
    preferenceScore: null,
    calculatedAt: '2026-09-01T10:00:00.000Z',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    explanation: {
        algorithm: 'weighted-skill-v1',
        strengths: [
            {
                skill: 'React',
                candidateLevel: 4,
                requiredLevel: 3,
                required: true,
            },
        ],
        gaps: [
            {
                skill: 'TypeScript',
                candidateLevel: 1,
                requiredLevel: 2,
                required: false,
            },
        ],
        requirementsCount: 2,
    },
    candidate: {
        id: 'candidate-1',
        headline: 'Experienced Frontend Developer',
        summary: 'Frontend developer with React experience',
        location: 'Amsterdam',
        salaryMin: 5000,
        salaryMax: 7000,
        currency: 'EUR',
        availabilityDate: null,
        remotePreference: 'HYBRID',
        user: {
            firstName: 'Alex',
            lastName: 'Johnson',
        },
        candidateSkills: [
            {
                id: 'candidate-skill-1',
                skillId: 'skill-1',
                proficiencyLevel: 4,
                yearsOfExperience: 5,
                source: 'MANUAL',
                skill: {
                    name: 'React',
                },
            },
        ],
    },
}

const emptyMatchesResponse = {
    data: [],
    meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    },
}

const candidateMatchesResponse = {
    data: [candidateMatch],
    meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
    },
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

async function openMatchingTab(user: ReturnType<typeof userEvent.setup>) {
    await user.click(
        screen.getByRole('button', {
            name: 'Matching candidates',
        }),
    )
}

describe('RecruiterJobDetailsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        authUserMock.current.isDemo = false
        getCandidatesForJobMock.mockReset()
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

        // Matching wordt niet geladen zolang de matching-tab niet geopend is.
        expect(getCandidatesForJobMock).not.toHaveBeenCalled()
    })

    it('loads and displays matching candidates for a published job', async () => {
        const user = userEvent.setup()

        getJobByIdMock.mockResolvedValue(publishedJob)
        getCandidatesForJobMock.mockResolvedValue(
            candidateMatchesResponse,
        )

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        expect(getCandidatesForJobMock).not.toHaveBeenCalled()

        await openMatchingTab(user)

        expect(
            await screen.findByRole('heading', {
                name: 'Alex Johnson',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Experienced Frontend Developer'),
        ).toBeInTheDocument()

        // Open eerst de uitklapbare kandidaatdetails.
        await user.click(
            screen.getByRole('button', {
                name: 'View details',
            }),
        )

        expect(screen.getByText('React')).toBeInTheDocument()

        const skillGapsHeading = screen.getByText('Skill gaps')

        expect(
            within(skillGapsHeading.parentElement!).getByText(
                /TypeScript/,
            ),
        ).toBeInTheDocument()

        expect(getCandidatesForJobMock).toHaveBeenCalledWith(
            'job-1',
            { page: 1, limit: 5, scoreRange: 'all' },
        )
    })

    it('does not load matching candidates for an unpublished job', async () => {
        const user = userEvent.setup()

        getJobByIdMock.mockResolvedValue(baseJob)

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        await openMatchingTab(user)

        expect(
            screen.getByText(
                'Publish this job to view matching candidates.',
            ),
        ).toBeInTheDocument()

        expect(getCandidatesForJobMock).not.toHaveBeenCalled()
    })

    it('shows an empty state when no matching candidates exist', async () => {
        const user = userEvent.setup()

        getJobByIdMock.mockResolvedValue(publishedJob)
        getCandidatesForJobMock.mockResolvedValue(
            emptyMatchesResponse,
        )

        renderPage()

        // Wacht tot de vacature en de tabknoppen zichtbaar zijn.
        expect(
            await screen.findByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        await openMatchingTab(user)

        expect(
            await screen.findByText('No matching candidates found yet.'),
        ).toBeInTheDocument()
    })

    it('allows retrying when loading matching candidates fails', async () => {
        const user = userEvent.setup()

        getJobByIdMock.mockResolvedValue(publishedJob)
        getCandidatesForJobMock
            .mockRejectedValueOnce(new Error('API error'))
            .mockResolvedValueOnce(candidateMatchesResponse)

        renderPage()

        // Wacht tot de vacature en de tabknoppen zichtbaar zijn.
        expect(
            await screen.findByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        await openMatchingTab(user)

        expect(
            await screen.findByRole('alert'),
        ).toHaveTextContent('Matching candidates could not be loaded.')

        await user.click(
            screen.getByRole('button', { name: 'Try again' }),
        )

        expect(
            await screen.findByRole('heading', {
                name: 'Alex Johnson',
            }),
        ).toBeInTheDocument()

        expect(getCandidatesForJobMock).toHaveBeenCalledTimes(2)
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
                'Unable to publish this job. Try again.',
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
                'Unable to pause this job. Try again.',
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
                'Unable to resume this job. Try again.',
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
                'Unable to close this job. Try again.',
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
                'Unable to reopen this job. Try again.',
            ),
        ).toBeInTheDocument()

        expect(getJobByIdMock).toHaveBeenCalledTimes(1)
    })

    it('disables job management actions for demo accounts', async () => {
        authUserMock.current.isDemo = true
        getJobByIdMock.mockResolvedValue(baseJob)

        renderPage()

        const publishButton = await screen.findByRole('button', {
            name: 'Publish job',
        })

        expect(publishButton).toBeDisabled()

        const editLink = screen.getByRole('link', { name: 'Edit' })
        expect(editLink).toHaveAttribute('aria-disabled', 'true')

        fireEvent.click(publishButton)

        expect(publishJobMock).not.toHaveBeenCalled()
        expect(pauseJobMock).not.toHaveBeenCalled()
        expect(resumeJobMock).not.toHaveBeenCalled()
        expect(closeJobMock).not.toHaveBeenCalled()
        expect(reopenJobMock).not.toHaveBeenCalled()
    })
})

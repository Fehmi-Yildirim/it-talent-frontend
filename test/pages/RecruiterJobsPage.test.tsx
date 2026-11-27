import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '../test-utils'
import { MemoryRouter } from 'react-router-dom'
import RecruiterJobsPage from '../../src/pages/RecruiterJobsPage'
import type { Job } from '../../src/types/job'

const {
    getJobsMock,
    publishJobMock,
    pauseJobMock,
    resumeJobMock,
    closeJobMock,
    reopenJobMock,
    authUserMock,
} = vi.hoisted(() => ({
    getJobsMock: vi.fn(),
    publishJobMock: vi.fn(),
    pauseJobMock: vi.fn(),
    resumeJobMock: vi.fn(),
    closeJobMock: vi.fn(),
    reopenJobMock: vi.fn(),
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
    getJobs: getJobsMock,
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
    description: 'Build modern React applications.',
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
    requirements: [],
}

const publishedJob: Job = {
    ...baseJob,
    id: 'job-2',
    title: 'Frontend Engineer',
    location: 'Rotterdam',
    employmentType: 'CONTRACT',
    workMode: 'REMOTE',
    status: 'PUBLISHED',
    publishedAt: '2026-09-02T10:00:00.000Z',
    createdAt: '2026-09-02T00:00:00.000Z',
}

const pausedJob: Job = {
    ...baseJob,
    id: 'job-3',
    title: 'Backend Developer',
    location: 'Utrecht',
    employmentType: 'PART_TIME',
    workMode: 'ONSITE',
    status: 'PAUSED',
    createdAt: '2026-09-03T00:00:00.000Z',
}

const closedJob: Job = {
    ...baseJob,
    id: 'job-4',
    title: 'DevOps Engineer',
    location: 'Eindhoven',
    employmentType: 'FULL_TIME',
    workMode: 'REMOTE',
    status: 'CLOSED',
    createdAt: '2026-09-04T00:00:00.000Z',
}

const jobs = [baseJob, publishedJob, pausedJob, closedJob]

function renderPage() {
    return render(
        <MemoryRouter>
            <RecruiterJobsPage />
        </MemoryRouter>,
    )
}

function getControl(id: string): HTMLInputElement | HTMLSelectElement {
    const control = document.getElementById(id)

    if (
        !(control instanceof HTMLInputElement) &&
        !(control instanceof HTMLSelectElement)
    ) {
        throw new Error(`Control with id "${id}" was not found`)
    }

    return control
}

describe('RecruiterJobsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        authUserMock.current.isDemo = false

        getJobsMock.mockResolvedValue(jobs)
        publishJobMock.mockResolvedValue({
            ...baseJob,
            status: 'PUBLISHED',
            publishedAt: '2026-09-05T10:00:00.000Z',
        })
    })

    it('loads and displays the recruiter jobs', async () => {
        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('heading', {
                name: 'Frontend Engineer',
            }),
        ).toBeInTheDocument()

        expect(getJobsMock).toHaveBeenCalledTimes(1)
    })

    it('displays the job status summary', async () => {
        const { container } = renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        expect(
            container.querySelector('.recruiter-jobs-stat-total'),
        ).toBeInTheDocument()

        expect(
            container.querySelector('.recruiter-jobs-stat-draft'),
        ).toBeInTheDocument()

        expect(
            container.querySelector('.recruiter-jobs-stat-published'),
        ).toBeInTheDocument()

        expect(
            container.querySelector('.recruiter-jobs-stat-paused'),
        ).toBeInTheDocument()

        expect(
            container.querySelector('.recruiter-jobs-stat-closed'),
        ).toBeInTheDocument()
    })

    it('filters jobs by title', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.change(getControl('recruiter-jobs-search'), {
            target: { value: 'Frontend' },
        })

        expect(
            screen.getByRole('heading', {
                name: 'Frontend Engineer',
            }),
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).not.toBeInTheDocument()
    })

    it('filters jobs by location', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.change(getControl('recruiter-jobs-search'), {
            target: { value: 'Rotterdam' },
        })

        expect(
            screen.getByRole('heading', {
                name: 'Frontend Engineer',
            }),
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).not.toBeInTheDocument()
    })

    it('filters jobs by status', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.change(getControl('recruiter-jobs-status'), {
            target: { value: 'PUBLISHED' },
        })

        expect(
            screen.getByRole('heading', {
                name: 'Frontend Engineer',
            }),
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).not.toBeInTheDocument()
    })

    it('filters jobs by employment type', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.change(getControl('recruiter-jobs-employment'), {
            target: { value: 'CONTRACT' },
        })

        expect(
            screen.getByRole('heading', {
                name: 'Frontend Engineer',
            }),
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).not.toBeInTheDocument()
    })

    it('filters jobs by work mode', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.change(getControl('recruiter-jobs-workmode'), {
            target: { value: 'REMOTE' },
        })

        expect(
            screen.getByRole('heading', {
                name: 'Frontend Engineer',
            }),
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).not.toBeInTheDocument()
    })

    it('sorts jobs by title', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.change(getControl('recruiter-jobs-sort'), {
            target: { value: 'title' },
        })

        const titles = screen
            .getAllByRole('heading', { level: 2 })
            .map((heading) => heading.textContent)

        expect(titles[0]).toBe('Backend Developer')
        expect(titles[1]).toBe('DevOps Engineer')
    })

    it('clears the active filters', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.change(getControl('recruiter-jobs-search'), {
            target: { value: 'Frontend' },
        })

        expect(
            screen.queryByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).not.toBeInTheDocument()

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Clear filters',
            }),
        )

        expect(
            await screen.findByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        expect(getControl('recruiter-jobs-search')).toHaveValue('')
    })

    it('updates a job status successfully', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.change(
            screen.getByRole('combobox', {
                name: 'Senior React Developer status',
            }),
            {
                target: { value: 'PUBLISHED' },
            },
        )

        await waitFor(() => {
            expect(publishJobMock).toHaveBeenCalledWith('job-1')
        })

        expect(
            await screen.findByRole('status', {
                name: 'Status updated successfully',
            }),
        ).toBeInTheDocument()
    })

    it('does not allow demo users to change job status', async () => {
        authUserMock.current.isDemo = true

        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        expect(
            screen.getByRole('combobox', {
                name: 'Senior React Developer status',
            }),
        ).toBeDisabled()

        expect(publishJobMock).not.toHaveBeenCalled()
    })

    it('does not allow demo users to edit a job', async () => {
        authUserMock.current.isDemo = true

        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        const editButtons = screen.getAllByRole('button', {
            name: 'Edit',
        })

        expect(editButtons).toHaveLength(4)

        editButtons.forEach((button) => {
            expect(button).toBeDisabled()
            expect(button).toHaveAttribute(
                'title',
                'Editing jobs is disabled in demo mode.',
            )
        })
    })

    it('shows an empty state when no jobs are returned', async () => {
        getJobsMock.mockResolvedValue([])

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'No jobs yet',
            }),
        ).toBeInTheDocument()
    })

    it('shows an error when loading jobs fails', async () => {
        getJobsMock.mockRejectedValue(new Error('API error'))

        renderPage()

        expect(
            await screen.findByText(
                'Unable to load your jobs. Try again.',
            ),
        ).toBeInTheDocument()
    })
})

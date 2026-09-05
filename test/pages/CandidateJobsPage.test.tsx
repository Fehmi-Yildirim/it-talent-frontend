import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

import CandidateJobsPage from '../../src/pages/CandidateJobsPage'
import { ApiError } from '../../src/services/api/apiError'
import { getSkills } from '../../src/features/candidate/candidate.api'
import { getCandidateJobs } from '../../src/features/jobs/jobs.api'

vi.mock('../../src/features/jobs/jobs.api', () => ({
    getCandidateJobs: vi.fn(),
}))

vi.mock('../../src/features/candidate/candidate.api', () => ({
    getSkills: vi.fn(),
}))

const mockedGetCandidateJobs = vi.mocked(getCandidateJobs)
const mockedGetSkills = vi.mocked(getSkills)

const skills = [
    {
        id: 'skill-react',
        name: 'React',
        slug: 'react',
        category: 'Frontend',
        description: 'React development',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'skill-typescript',
        name: 'TypeScript',
        slug: 'typescript',
        category: 'Programming',
        description: 'TypeScript development',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
    },
]

const job = {
    id: 'job-1',
    companyId: 'company-1',
    createdByRecruiterId: 'recruiter-1',
    title: 'Senior React Developer',
    description: 'Build modern frontend applications.',
    location: 'Amsterdam',
    employmentType: 'FULL_TIME' as const,
    workMode: 'HYBRID' as const,
    salaryMin: '60000',
    salaryMax: '80000',
    currency: 'EUR',
    expiresAt: '2027-01-01T00:00:00.000Z',
    status: 'PUBLISHED' as const,
    publishedAt: '2026-09-01T00:00:00.000Z',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    company: {
        id: 'company-1',
        name: 'Acme Technologies',
        slug: 'acme-technologies',
        website: 'https://acme.example.com',
        description: 'Technology company.',
        location: 'Amsterdam',
    },
    requirements: [
        {
            id: 'requirement-1',
            jobId: 'job-1',
            skillId: 'skill-react',
            required: true,
            minimumLevel: 3,
            skill: {
                id: 'skill-react',
                name: 'React',
            },
        },
        {
            id: 'requirement-2',
            jobId: 'job-1',
            skillId: 'skill-typescript',
            required: false,
            minimumLevel: 2,
            skill: {
                id: 'skill-typescript',
                name: 'TypeScript',
            },
        },
    ],
}

const baseResponse = {
    items: [job],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
}

function renderPage() {
    return render(
        <MemoryRouter>
            <CandidateJobsPage />
        </MemoryRouter>,
    )
}

describe('CandidateJobsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockedGetSkills.mockResolvedValue(skills)
        mockedGetCandidateJobs.mockResolvedValue(baseResponse)
    })

    it('shows a loading state while jobs are loading', async () => {
        let resolveJobs:
            | ((value: typeof baseResponse) => void)
            | undefined

        const jobsPromise = new Promise<typeof baseResponse>((resolve) => {
            resolveJobs = resolve
        })

        mockedGetCandidateJobs.mockReturnValue(jobsPromise)

        renderPage()

        expect(screen.getByRole('status')).toBeInTheDocument()

        resolveJobs?.(baseResponse)

        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: 'Senior React Developer',
                }),
            ).toBeInTheDocument()
        })
    })

    it('renders jobs with company, metadata, salary, skills and publication date', async () => {
        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        expect(screen.getByText('Acme Technologies')).toBeInTheDocument()
        expect(screen.getByText('Amsterdam')).toBeInTheDocument()
        expect(screen.getByText('HYBRID')).toBeInTheDocument()
        expect(screen.getByText('FULL_TIME')).toBeInTheDocument()
        expect(screen.getByText('60000 - 80000 EUR')).toBeInTheDocument()

        const jobCard = screen
            .getByRole('heading', { name: 'Senior React Developer' })
            .closest('article')

        expect(jobCard).not.toBeNull()
        expect(jobCard).toHaveTextContent('React')
        expect(jobCard).toHaveTextContent('TypeScript')

        expect(
            screen.getByText(/Published Sep 1, 2026/i),
        ).toBeInTheDocument()

        expect(
            screen.getAllByRole('link', { name: /view job/i }),
        ).toHaveLength(1)
    })

    it('shows an empty state when no jobs are found', async () => {
        mockedGetCandidateJobs.mockResolvedValue({
            items: [],
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
        })

        renderPage()

        expect(
            await screen.findByRole('heading', { name: 'No jobs found' }),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'No published jobs match your current search and filters.',
            ),
        ).toBeInTheDocument()
    })

    it('sends the search query to the backend', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        const searchInput = screen.getByRole('searchbox', {
            name: 'Search',
        })

        fireEvent.change(searchInput, {
            target: {
                value: 'React developer',
            },
        })

        await waitFor(() => {
            expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    q: 'React developer',
                    page: 1,
                    limit: 20,
                }),
            )
        })
    })

    it('sends location, work mode and employment type filters to the backend', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.change(
            screen.getByRole('textbox', { name: 'Location' }),
            {
                target: {
                    value: 'Rotterdam',
                },
            },
        )

        fireEvent.change(
            screen.getByRole('combobox', { name: 'Work mode' }),
            {
                target: {
                    value: 'REMOTE',
                },
            },
        )

        fireEvent.change(
            screen.getByRole('combobox', {
                name: 'Employment type',
            }),
            {
                target: {
                    value: 'CONTRACT',
                },
            },
        )

        await waitFor(() => {
            expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    location: 'Rotterdam',
                    workMode: 'REMOTE',
                    employmentType: 'CONTRACT',
                    page: 1,
                }),
            )
        })
    })

    it('sends salary filters to the backend', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.change(
            screen.getByRole('spinbutton', {
                name: 'Minimum salary',
            }),
            {
                target: {
                    value: '50000',
                },
            },
        )

        fireEvent.change(
            screen.getByRole('spinbutton', {
                name: 'Maximum salary',
            }),
            {
                target: {
                    value: '90000',
                },
            },
        )

        await waitFor(() => {
            expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    salaryMin: 50000,
                    salaryMax: 90000,
                    page: 1,
                }),
            )
        })
    })

    it('sends selected skills to the backend', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.click(
            screen.getByRole('checkbox', {
                name: 'React',
            }),
        )

        fireEvent.click(
            screen.getByRole('checkbox', {
                name: 'TypeScript',
            }),
        )

        await waitFor(() => {
            expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    skillIds: ['skill-react', 'skill-typescript'],
                    page: 1,
                }),
            )
        })
    })

    it('sends the selected sort option to the backend', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.change(
            screen.getByRole('combobox', { name: 'Sort' }),
            {
                target: {
                    value: 'salary',
                },
            },
        )

        await waitFor(() => {
            expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    sort: 'salary',
                    page: 1,
                }),
            )
        })
    })

    it('paginates to the next page', async () => {
        mockedGetCandidateJobs
            .mockResolvedValueOnce({
                ...baseResponse,
                total: 21,
                totalPages: 2,
            })
            .mockResolvedValueOnce({
                ...baseResponse,
                page: 2,
                total: 21,
                totalPages: 2,
            })

        renderPage()

        expect(
            await screen.findByText('Page 1 of 2'),
        ).toBeInTheDocument()

        const nextButton = screen.getByRole('button', {
            name: 'Next',
        })

        expect(nextButton).toBeEnabled()

        fireEvent.click(nextButton)

        await waitFor(() => {
            expect(
                screen.getByText('Page 2 of 2'),
            ).toBeInTheDocument()
        })

        expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
            expect.objectContaining({
                page: 2,
                limit: 20,
            }),
        )
    })

    it('disables Previous on the first page and Next on the last page', async () => {
        mockedGetCandidateJobs.mockResolvedValue({
            ...baseResponse,
            total: 21,
            totalPages: 2,
        })

        renderPage()

        await screen.findByText('Page 1 of 2')

        expect(
            screen.getByRole('button', { name: 'Previous' }),
        ).toBeDisabled()

        expect(
            screen.getByRole('button', { name: 'Next' }),
        ).toBeEnabled()
    })

    it('resets filters when Clear filters is clicked', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        const searchInput = screen.getByRole('searchbox', {
            name: 'Search',
        })

        fireEvent.change(searchInput, {
            target: {
                value: 'React',
            },
        })

        fireEvent.change(
            screen.getByRole('textbox', { name: 'Location' }),
            {
                target: {
                    value: 'Amsterdam',
                },
            },
        )

        fireEvent.change(
            screen.getByRole('combobox', { name: 'Work mode' }),
            {
                target: {
                    value: 'REMOTE',
                },
            },
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Clear filters',
            }),
        )

        expect(searchInput).toHaveValue('')
        expect(
            screen.getByRole('textbox', { name: 'Location' }),
        ).toHaveValue('')

        expect(
            screen.getByRole('combobox', {
                name: 'Work mode',
            }),
        ).toHaveValue('')

        expect(
            screen.getByRole('combobox', {
                name: 'Employment type',
            }),
        ).toHaveValue('')

        expect(
            screen.getByRole('combobox', {
                name: 'Sort',
            }),
        ).toHaveValue('newest')

        await waitFor(() => {
            expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    q: undefined,
                    location: undefined,
                    workMode: undefined,
                    employmentType: undefined,
                    salaryMin: undefined,
                    salaryMax: undefined,
                    skillIds: undefined,
                    sort: 'newest',
                    page: 1,
                    limit: 20,
                }),
            )
        })
    })

    it('shows a backend validation error for a 400 response', async () => {
        const error = Object.create(ApiError.prototype) as ApiError

        Object.defineProperty(error, 'status', {
            value: 400,
            enumerable: true,
        })

        Object.defineProperty(error, 'message', {
            value: 'The search request is invalid. Please check your filters.',
            enumerable: true,
        })

        mockedGetCandidateJobs.mockRejectedValue(error)

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Unable to load jobs',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'The search request is invalid. Please check your filters.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Try again',
            }),
        ).toBeInTheDocument()
    })

    it('shows a generic API error and retries when Try again is clicked', async () => {
        mockedGetCandidateJobs
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce(baseResponse)

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Unable to load jobs',
            }),
        ).toBeInTheDocument()

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Try again',
            }),
        )

        expect(
            await screen.findByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        expect(mockedGetCandidateJobs).toHaveBeenCalledTimes(2)
    })

    it('loads available skills independently from the jobs list', async () => {
        renderPage()

        expect(
            await screen.findByRole('checkbox', {
                name: 'React',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('checkbox', {
                name: 'TypeScript',
            }),
        ).toBeInTheDocument()

        expect(mockedGetSkills).toHaveBeenCalledTimes(1)
    })
})
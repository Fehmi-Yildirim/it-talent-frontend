import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '../test-utils'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

import { CandidateJobsPage } from '../../src/pages/CandidateJobsPage'
import { getSkills } from '../../src/features/candidate/candidate.api'
import { getCandidateJobs } from '../../src/features/jobs/jobs.api'
import { ApiError } from '../../src/services/api/apiError'

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
        category: 'Frontend',
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
    publishedAt: '2026-08-01T00:00:00.000Z',
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
    totalPages: 1,
    limit: 20,
}

function renderPage() {
    return render(
        <MemoryRouter>
            <CandidateJobsPage />
        </MemoryRouter>,
    )
}

function getFilterDropdown(name: string) {
    const trigger = screen.getByRole('button', { name })

    const filter = trigger.closest(
        '.candidate-jobs-work-mode-filter',
    )

    expect(filter).not.toBeNull()

    return within(filter as HTMLElement)
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

        expect(screen.getByRole('status')).toHaveTextContent(/loading page/i)

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
        expect(screen.getByText('Hybrid')).toBeInTheDocument()
        expect(screen.getByText('Full-time')).toBeInTheDocument()
        expect(screen.getByText('60000 - 80000 EUR')).toBeInTheDocument()

        const jobCard = screen
            .getByRole('heading', {
                name: 'Senior React Developer',
            })
            .closest('article')

        expect(jobCard).not.toBeNull()
        expect(jobCard).toHaveTextContent('React')
        expect(jobCard).toHaveTextContent('TypeScript')

        expect(
            screen.getByText(/Published Aug 1, 2026/i),
        ).toBeInTheDocument()

        expect(
            screen.getAllByRole('link', {
                name: /view job/i,
            }),
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

        await waitFor(() => {
            expect(
                screen.getByText(/0\s+jobs found/i),
            ).toBeInTheDocument()
        })

        expect(
            screen.queryByRole('heading', {
                name: 'No jobs found',
            }),
        ).not.toBeInTheDocument()
    })

    it('sends the search query to the backend', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.change(
            screen.getByRole('searchbox', {
                name: 'Search',
            }),
            {
                target: {
                    value: 'React developer',
                },
            },
        )

        await waitFor(() => {
            expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    q: 'React developer',
                    page: 1,
                }),
            )
        })
    })

    it('sends the selected work mode to the backend', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        const workModeDropdown = getFilterDropdown('Work mode')

        fireEvent.click(
            workModeDropdown.getByRole('button', {
                name: 'Work mode',
            }),
        )

        fireEvent.click(
            workModeDropdown.getByRole('checkbox', {
                name: 'Remote',
            }),
        )

        fireEvent.click(
            workModeDropdown.getByRole('button', {
                name: 'Search',
            }),
        )

        await waitFor(() => {
            expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    workModes: ['REMOTE'],
                    page: 1,
                }),
            )
        })
    })

    it('sends multiple selected work modes to the backend', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        const workModeDropdown = getFilterDropdown('Work mode')

        fireEvent.click(
            workModeDropdown.getByRole('button', {
                name: 'Work mode',
            }),
        )

        fireEvent.click(
            workModeDropdown.getByRole('checkbox', {
                name: 'Remote',
            }),
        )

        fireEvent.click(
            workModeDropdown.getByRole('checkbox', {
                name: 'Hybrid',
            }),
        )

        expect(
            workModeDropdown.getByRole('checkbox', {
                name: 'Remote',
            }),
        ).toBeChecked()

        expect(
            workModeDropdown.getByRole('checkbox', {
                name: 'Hybrid',
            }),
        ).toBeChecked()

        fireEvent.click(
            workModeDropdown.getByRole('button', {
                name: 'Search',
            }),
        )

        await waitFor(() => {
            expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    workModes: ['REMOTE', 'HYBRID'],
                    page: 1,
                }),
            )
        })
    })

    it('sends a single selected employment type to the backend', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        const employmentTypeDropdown =
            getFilterDropdown('Employment type')

        fireEvent.click(
            employmentTypeDropdown.getByRole('button', {
                name: 'Employment type',
            }),
        )

        fireEvent.click(
            employmentTypeDropdown.getByRole('checkbox', {
                name: 'Contract',
            }),
        )

        fireEvent.click(
            employmentTypeDropdown.getByRole('button', {
                name: 'Search',
            }),
        )

        await waitFor(() => {
            expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    employmentTypes: ['CONTRACT'],
                    page: 1,
                }),
            )
        })
    })

    it('sends multiple selected employment types to the backend', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        const employmentTypeDropdown =
            getFilterDropdown('Employment type')

        fireEvent.click(
            employmentTypeDropdown.getByRole('button', {
                name: 'Employment type',
            }),
        )

        fireEvent.click(
            employmentTypeDropdown.getByRole('checkbox', {
                name: 'Full-time',
            }),
        )

        fireEvent.click(
            employmentTypeDropdown.getByRole('checkbox', {
                name: 'Part-time',
            }),
        )

        expect(
            employmentTypeDropdown.getByRole('checkbox', {
                name: 'Full-time',
            }),
        ).toBeChecked()

        expect(
            employmentTypeDropdown.getByRole('checkbox', {
                name: 'Part-time',
            }),
        ).toBeChecked()

        fireEvent.click(
            employmentTypeDropdown.getByRole('button', {
                name: 'Search',
            }),
        )

        await waitFor(() => {
            expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    employmentTypes: ['FULL_TIME', 'PART_TIME'],
                    page: 1,
                }),
            )
        })
    })

    it('keeps selected employment types checked before applying the filter', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        const employmentTypeDropdown =
            getFilterDropdown('Employment type')

        fireEvent.click(
            employmentTypeDropdown.getByRole('button', {
                name: 'Employment type',
            }),
        )

        const fullTimeCheckbox =
            employmentTypeDropdown.getByRole('checkbox', {
                name: 'Full-time',
            })

        const partTimeCheckbox =
            employmentTypeDropdown.getByRole('checkbox', {
                name: 'Part-time',
            })

        fireEvent.click(fullTimeCheckbox)
        fireEvent.click(partTimeCheckbox)

        expect(fullTimeCheckbox).toBeChecked()
        expect(partTimeCheckbox).toBeChecked()
    })

    it('removes an employment type when its checkbox is clicked again', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        const employmentTypeDropdown =
            getFilterDropdown('Employment type')

        fireEvent.click(
            employmentTypeDropdown.getByRole('button', {
                name: 'Employment type',
            }),
        )

        const fullTimeCheckbox =
            employmentTypeDropdown.getByRole('checkbox', {
                name: 'Full-time',
            })

        fireEvent.click(fullTimeCheckbox)

        expect(fullTimeCheckbox).toBeChecked()

        fireEvent.click(fullTimeCheckbox)

        expect(fullTimeCheckbox).not.toBeChecked()
    })

    it('applies selected employment types only after Search is clicked', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        const employmentTypeDropdown =
            getFilterDropdown('Employment type')

        fireEvent.click(
            employmentTypeDropdown.getByRole('button', {
                name: 'Employment type',
            }),
        )

        fireEvent.click(
            employmentTypeDropdown.getByRole('checkbox', {
                name: 'Full-time',
            }),
        )

        expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
            expect.objectContaining({
                employmentTypes: undefined,
            }),
        )

        fireEvent.click(
            employmentTypeDropdown.getByRole('button', {
                name: 'Search',
            }),
        )

        await waitFor(() => {
            expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    employmentTypes: ['FULL_TIME'],
                    page: 1,
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
            screen.getByRole('textbox', {
                name: 'Location',
            }),
            {
                target: {
                    value: 'Rotterdam',
                },
            },
        )

        const workModeDropdown = getFilterDropdown('Work mode')

        fireEvent.click(
            workModeDropdown.getByRole('button', {
                name: 'Work mode',
            }),
        )

        fireEvent.click(
            workModeDropdown.getByRole('checkbox', {
                name: 'Remote',
            }),
        )

        fireEvent.click(
            workModeDropdown.getByRole('button', {
                name: 'Search',
            }),
        )

        const employmentTypeDropdown =
            getFilterDropdown('Employment type')

        fireEvent.click(
            employmentTypeDropdown.getByRole('button', {
                name: 'Employment type',
            }),
        )

        fireEvent.click(
            employmentTypeDropdown.getByRole('checkbox', {
                name: 'Contract',
            }),
        )

        fireEvent.click(
            employmentTypeDropdown.getByRole('button', {
                name: 'Search',
            }),
        )

        await waitFor(() => {
            expect(mockedGetCandidateJobs).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    location: 'Rotterdam',
                    workModes: ['REMOTE'],
                    employmentTypes: ['CONTRACT'],
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

        const skillsDropdown = getFilterDropdown('Skills')

        fireEvent.click(
            skillsDropdown.getByRole('button', {
                name: 'Skills',
            }),
        )

        const reactCheckbox = await skillsDropdown.findByRole(
            'checkbox',
            {
                name: 'React',
            },
        )

        const typescriptCheckbox = await skillsDropdown.findByRole(
            'checkbox',
            {
                name: 'TypeScript',
            },
        )

        fireEvent.click(reactCheckbox)
        fireEvent.click(typescriptCheckbox)

        fireEvent.click(
            skillsDropdown.getByRole('button', {
                name: 'Search',
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
            screen.getByRole('combobox', {
                name: 'Sort',
            }),
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

    it('does not render pagination when only one page exists', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        expect(
            screen.queryByText(/Page 1 of 1/i),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByRole('button', {
                name: 'Previous',
            }),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByRole('button', {
                name: 'Next',
            }),
        ).not.toBeInTheDocument()
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
            screen.getByRole('textbox', {
                name: 'Location',
            }),
            {
                target: {
                    value: 'Amsterdam',
                },
            },
        )

        const workModeDropdown = getFilterDropdown('Work mode')

        fireEvent.click(
            workModeDropdown.getByRole('button', {
                name: 'Work mode',
            }),
        )

        fireEvent.click(
            workModeDropdown.getByRole('checkbox', {
                name: 'Remote',
            }),
        )

        fireEvent.click(
            workModeDropdown.getByRole('button', {
                name: 'Search',
            }),
        )

        const employmentTypeDropdown =
            getFilterDropdown('Employment type')

        fireEvent.click(
            employmentTypeDropdown.getByRole('button', {
                name: 'Employment type',
            }),
        )

        fireEvent.click(
            employmentTypeDropdown.getByRole('checkbox', {
                name: 'Contract',
            }),
        )

        fireEvent.click(
            employmentTypeDropdown.getByRole('button', {
                name: 'Search',
            }),
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Clear filters',
            }),
        )

        expect(searchInput).toHaveValue('')

        expect(
            screen.getByRole('textbox', {
                name: 'Location',
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
                    workModes: undefined,
                    employmentTypes: undefined,
                    salaryMin: undefined,
                    salaryMax: undefined,
                    skillIds: undefined,
                    sort: 'newest',
                    page: 1,
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

        mockedGetCandidateJobs.mockRejectedValue(error)

        renderPage()

        expect(
            await screen.findByText(
                'Unable to load jobs. Please try again.',
            ),
        ).toBeInTheDocument()
    })

    it('shows a generic API error', async () => {
        mockedGetCandidateJobs.mockRejectedValue(
            new Error('Network error'),
        )

        renderPage()

        expect(
            await screen.findByText(
                'Unable to load jobs. Please try again.',
            ),
        ).toBeInTheDocument()

        expect(mockedGetCandidateJobs).toHaveBeenCalledTimes(1)
    })

    it('loads available skills independently from the jobs list', async () => {
        renderPage()

        const skillsDropdown = getFilterDropdown('Skills')

        fireEvent.click(
            skillsDropdown.getByRole('button', {
                name: 'Skills',
            }),
        )

        expect(
            await skillsDropdown.findByRole('checkbox', {
                name: 'React',
            }),
        ).toBeInTheDocument()

        fireEvent.click(
            skillsDropdown.getByRole('checkbox', {
                name: 'React',
            }),
        )

        fireEvent.click(
            skillsDropdown.getByRole('checkbox', {
                name: 'TypeScript',
            }),
        )
    })
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

import CandidateJobDetailsPage from '../../src/pages/CandidateJobDetailsPage'
import { getCandidateJobById } from '../../src/features/jobs/jobs.api'
import { ApiError } from '../../src/services/api/apiError'

vi.mock('../../src/features/jobs/jobs.api', () => ({
    getCandidateJobById: vi.fn(),
}))

const mockedGetCandidateJobById = vi.mocked(getCandidateJobById)

const candidateJob = {
    id: 'job-1',
    companyId: 'company-1',
    createdByRecruiterId: 'recruiter-1',
    title: 'Senior React Developer',
    description:
        'Build modern frontend applications.\nWork closely with designers and backend engineers.',
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
        description: 'Technology company building useful products.',
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

function renderPage(jobId = 'job-1') {
    return render(
        <MemoryRouter initialEntries={[`/jobs/${jobId}`]}>
            <Routes>
                <Route
                    path="/jobs/:jobId"
                    element={<CandidateJobDetailsPage />}
                />
                <Route
                    path="/jobs"
                    element={<div>Jobs overview</div>}
                />
            </Routes>
        </MemoryRouter>,
    )
}

function createApiError(status: number, message = 'API error') {
    const error = Object.create(ApiError.prototype) as ApiError

    Object.defineProperty(error, 'message', {
        value: message,
        enumerable: true,
    })

    Object.defineProperty(error, 'status', {
        value: status,
        enumerable: true,
    })

    return error
}

describe('CandidateJobDetailsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockedGetCandidateJobById.mockResolvedValue(candidateJob)
    })

    it('shows a loading state while the job is loading', async () => {
        let resolveJob:
            | ((value: typeof candidateJob) => void)
            | undefined

        const jobPromise = new Promise<typeof candidateJob>((resolve) => {
            resolveJob = resolve
        })

        mockedGetCandidateJobById.mockReturnValue(jobPromise)

        renderPage()

        expect(screen.getByRole('status')).toBeInTheDocument()

        resolveJob?.(candidateJob)

        await waitFor(() => {
            expect(
                screen.getByRole('heading', {
                    name: 'Senior React Developer',
                }),
            ).toBeInTheDocument()
        })
    })

    it('renders the complete candidate job detail', async () => {
        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Acme Technologies', {
                selector: '.candidate-job-details-company',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Build modern frontend applications.'),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Work closely with designers and backend engineers.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Amsterdam', {
                selector: '.candidate-job-details-meta dd',
            }),
        ).toBeInTheDocument()

        expect(screen.getByText('HYBRID')).toBeInTheDocument()
        expect(screen.getByText('FULL_TIME')).toBeInTheDocument()
        expect(screen.getByText('60000 - 80000 EUR')).toBeInTheDocument()
    })

    it('renders required and preferred skills separately', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        expect(
            screen.getByRole('heading', {
                name: 'Required skills',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('heading', {
                name: 'Preferred skills',
            }),
        ).toBeInTheDocument()

        expect(screen.getByText('React')).toBeInTheDocument()
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
        expect(screen.getByText('Minimum level: 3')).toBeInTheDocument()
        expect(screen.getByText('Minimum level: 2')).toBeInTheDocument()
    })

    it('renders company information and website', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        expect(
            screen.getByRole('heading', {
                name: 'Company',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Technology company building useful products.',
            ),
        ).toBeInTheDocument()

        const websiteLink = screen.getByRole('link', {
            name: 'https://acme.example.com',
        })

        expect(websiteLink).toHaveAttribute(
            'href',
            'https://acme.example.com',
        )

        expect(websiteLink).toHaveAttribute('target', '_blank')
    })

    it('renders publication and expiration dates', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        expect(screen.getByText('Published')).toBeInTheDocument()
        expect(screen.getByText('September 1, 2026')).toBeInTheDocument()
        expect(screen.getByText('Expires')).toBeInTheDocument()
        expect(screen.getByText('January 1, 2027')).toBeInTheDocument()
    })

    it('shows a not-found state for a 404 response', async () => {
        mockedGetCandidateJobById.mockRejectedValue(
            createApiError(404, 'Job not found'),
        )

        renderPage('missing-job')

        expect(
            await screen.findByRole('heading', {
                name: 'Job not found',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'This job is no longer available or could not be found.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('button', {
                name: 'Try again',
            }),
        ).not.toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Back to jobs',
            }),
        ).toBeInTheDocument()
    })

    it('shows a generic API error with a retry action', async () => {
        mockedGetCandidateJobById.mockRejectedValue(
            createApiError(500, 'Server error'),
        )

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Unable to load job',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'Something went wrong while loading this job. Please try again.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: 'Try again',
            }),
        ).toBeInTheDocument()
    })

    it('retries after a general API error', async () => {
        mockedGetCandidateJobById
            .mockRejectedValueOnce(createApiError(500, 'Server error'))
            .mockResolvedValueOnce(candidateJob)

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Unable to load job',
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

        expect(mockedGetCandidateJobById).toHaveBeenCalledTimes(2)
    })

    it('navigates back to the jobs overview', async () => {
        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        fireEvent.click(
            screen.getByRole('link', {
                name: /back to jobs/i,
            }),
        )

        expect(
            await screen.findByText('Jobs overview'),
        ).toBeInTheDocument()
    })

    it('navigates back to the jobs overview from an error state', async () => {
        mockedGetCandidateJobById.mockRejectedValue(
            createApiError(404, 'Job not found'),
        )

        renderPage('missing-job')

        await screen.findByRole('heading', {
            name: 'Job not found',
        })

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Back to jobs',
            }),
        )

        expect(
            await screen.findByText('Jobs overview'),
        ).toBeInTheDocument()
    })

    it('shows fallback text when required or preferred skills are absent', async () => {
        mockedGetCandidateJobById.mockResolvedValue({
            ...candidateJob,
            requirements: [],
        })

        renderPage()

        await screen.findByRole('heading', {
            name: 'Senior React Developer',
        })

        expect(
            screen.getByText('No required skills specified.'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('No preferred skills specified.'),
        ).toBeInTheDocument()
    })
})
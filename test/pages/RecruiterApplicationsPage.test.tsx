import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, } from '../test-utils'
import { MemoryRouter } from 'react-router-dom'
import RecruiterApplicationsPage from '../../src/pages/RecruiterApplicationsPage'
import type { RecruiterApplication } from '../../src/types/application'

const { getRecruiterApplicationsMock } = vi.hoisted(() => ({
    getRecruiterApplicationsMock: vi.fn(),
}))

vi.mock('../../src/features/applications/applications.api', () => ({
    getRecruiterApplications: getRecruiterApplicationsMock,
}))

const applications: RecruiterApplication[] = [
    {
        id: 'application-1',
        jobId: 'job-1',
        candidateId: 'candidate-1',
        status: 'PENDING',
        coverLetter: 'I am interested.',
        createdAt: '2026-09-01T10:00:00.000Z',
        updatedAt: '2026-09-01T10:00:00.000Z',
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
    },
    {
        id: 'application-2',
        jobId: 'job-2',
        candidateId: 'candidate-2',
        status: 'ACCEPTED',
        coverLetter: '',
        createdAt: '2026-09-02T10:00:00.000Z',
        updatedAt: '2026-09-03T10:00:00.000Z',
        candidate: {
            id: 'candidate-2',
            firstName: 'Jane',
            lastName: 'Smith',
        },
        job: {
            id: 'job-2',
            title: 'Frontend Developer',
            location: 'Rotterdam',
            workMode: 'REMOTE',
            employmentType: 'FULL_TIME',
            company: {
                id: 'company-2',
                name: 'Another Company',
            },
        },
    },
]

function renderPage() {
    return render(
        <MemoryRouter>
            <RecruiterApplicationsPage />
        </MemoryRouter>,
    )
}

describe('RecruiterApplicationsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading state while loading applications', () => {
        getRecruiterApplicationsMock.mockReturnValue(
            new Promise(() => undefined),
        )

        renderPage()

        expect(screen.getByRole('status')).toHaveTextContent(
            'Loading applications...',
        )
    })

    it('renders applications', async () => {
        getRecruiterApplicationsMock.mockResolvedValue(applications)

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Applications',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('link', {
                name: 'Senior React Developer',
            }),
        ).toHaveAttribute(
            'href',
            '/recruiter/applications/application-1',
        )

        expect(
            screen.getByRole('link', {
                name: 'Frontend Developer',
            }),
        ).toHaveAttribute(
            'href',
            '/recruiter/applications/application-2',
        )

        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('Pending', { selector: 'span' })).toBeInTheDocument()
        expect(screen.getByText('Accepted', { selector: 'span' })).toBeInTheDocument()
        expect(
            screen.getByText('Cover letter included'),
        ).toBeInTheDocument()
    })

    it('shows empty state when there are no applications', async () => {
        getRecruiterApplicationsMock.mockResolvedValue([])

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'No applications found',
            }),
        ).toBeInTheDocument()
    })

    it('shows API error when loading fails', async () => {
        getRecruiterApplicationsMock.mockRejectedValue(
            new Error('API error'),
        )

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Unable to load applications',
            }),
        ).toBeInTheDocument()
    })

    it('renders job and status filters', async () => {
        getRecruiterApplicationsMock.mockResolvedValue(applications)

        renderPage()

        await screen.findByText('John Doe')

        expect(
            screen.getByRole('combobox', { name: 'Job' }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('combobox', { name: 'Status' }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('option', {
                name: 'Senior React Developer',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('option', {
                name: 'Frontend Developer',
            }),
        ).toBeInTheDocument()
    })
})
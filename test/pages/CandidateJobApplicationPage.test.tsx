import { fireEvent, render, screen, } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import CandidateJobApplicationPage from '../../src/pages/CandidateJobApplicationPage'
import { ApiError } from '../../src/services/api/apiError'
import type { CandidateJob } from '../../src/types/job'
import { getCandidateJobById } from '../../src/features/jobs/jobs.api'
import { getCandidateProfile } from '../../src/features/candidate/candidate.api'
import type { CandidateProfile } from '../../src/types/candidate'
import { I18nProvider } from '../../src/i18n/context'


vi.mock('../../src/features/jobs/jobs.api', () => ({
    getCandidateJobById: vi.fn(),
}))

vi.mock('../../src/features/candidate/candidate.api', () => ({
    getCandidateProfile: vi.fn(),
}))

const mockedGetCandidateJobById = vi.mocked(getCandidateJobById)
const mockedGetCandidateProfile = vi.mocked(getCandidateProfile)

beforeAll(() => {
    if (!Blob.prototype.text) {
        Object.defineProperty(Blob.prototype, 'text', {
            configurable: true,
            value: async function (this: Blob) {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onload = () => resolve(String(reader.result ?? ''))
                    reader.onerror = () => reject(reader.error)
                    reader.readAsText(this)
                })
            },
        })
    }
})

const candidateJob: CandidateJob = {
    id: 'job-1',
    companyId: 'company-1',
    createdByRecruiterId: 'recruiter-1',
    title: 'Frontend Developer',
    description: '<p>Build great frontend applications.</p>',
    location: 'Amsterdam',
    workMode: 'HYBRID',
    employmentType: 'FULL_TIME',
    salaryMin: 50000,
    salaryMax: 70000,
    company: {
        id: 'company-1',
        name: 'IT Talent',
        slug: 'it-talent',
        description: 'IT Talent company',
        location: 'Amsterdam',
        website: 'https://example.com',
    },
    requirements: [],
    status: 'PUBLISHED',
    publishedAt: '2026-01-01T00:00:00.000Z',
    expiresAt: '2026-12-31T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    currency: 'EUR',
}

const candidateProfile: CandidateProfile = {
    id: 'profile-1',
    userId: 'candidate-1',
    headline: null,
    summary: null,
    location: null,
    salaryMin: null,
    salaryMax: null,
    currency: null,
    availabilityDate: null,
    remotePreference: null,
    cvOriginalName: null,
    cvMimeType: null,
    cvSize: null,
    cvExpiresAt: null,
    cvRetentionConsent: false,
    cvConsentAt: null,
    cvUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderPage() {
    return render(
        <I18nProvider>
            <MemoryRouter initialEntries={['/jobs/job-1/apply']}>
                <Routes>
                    <Route path="/jobs/:jobId/apply" element={<CandidateJobApplicationPage />} />
                    <Route path="/jobs" element={<div>Jobs overview</div>} />
                    <Route path="/applications" element={<div>My applications</div>} />
                </Routes>
            </MemoryRouter>
        </I18nProvider>,
    )
}

beforeEach(() => {
    vi.clearAllMocks()

    mockedGetCandidateJobById.mockResolvedValue(candidateJob)
    mockedGetCandidateProfile.mockResolvedValue(candidateProfile)
})

describe('CandidateJobApplicationPage', () => {
    it('shows a loading state while the page data is loading', () => {
        mockedGetCandidateJobById.mockImplementation(
            () => new Promise(() => undefined),
        )

        renderPage()

        expect(
            screen.getByRole('status'),
        ).toHaveTextContent('Loading')
    })

    it('renders the application form for the selected job', async () => {
        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Apply for this job',
            }),
        ).toBeInTheDocument()

        expect(screen.getByRole('heading', { name: 'Frontend Developer' })).toBeInTheDocument()

        expect(
            screen.getByLabelText(/cover letter/i),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText(/choose file/i),
        ).toBeInTheDocument()
    })

    it('shows the existing CV when the candidate already has one', async () => {
        mockedGetCandidateProfile.mockResolvedValue({ ...candidateProfile, cvOriginalName: 'existing-cv.pdf', cvMimeType: 'application/pdf', cvRetentionConsent: true })

        renderPage()

        expect(
            await screen.findByText('existing-cv.pdf'),
        ).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /cv settings/i }))
        expect(screen.getByRole('button', { name: /replace cv/i })).toBeInTheDocument()
    })

    it('allows the candidate to start replacing an existing CV', async () => {
        mockedGetCandidateProfile.mockResolvedValue({ ...candidateProfile, cvOriginalName: 'existing-cv.pdf' })

        renderPage()

        await screen.findByText('existing-cv.pdf')

        fireEvent.click(screen.getByRole('button', { name: /cv settings/i }))
        fireEvent.click(screen.getByRole('button', { name: /replace cv/i }))

        expect(screen.queryByText('existing-cv.pdf')).not.toBeInTheDocument()
        expect(screen.getByLabelText(/choose file/i)).toBeInTheDocument()

        expect(
            screen.getByRole('button', {
                name: /cancel/i,
            }),
        ).toBeInTheDocument()
    })

    it('allows the candidate to cancel CV replacement', async () => {
        mockedGetCandidateProfile.mockResolvedValue({ ...candidateProfile, cvOriginalName: 'existing-cv.pdf' })

        renderPage()

        await screen.findByText('existing-cv.pdf')

        fireEvent.click(screen.getByRole('button', { name: /cv settings/i }))
        fireEvent.click(screen.getByRole('button', { name: /replace cv/i }))

        fireEvent.click(
            screen.getByRole('button', {
                name: /cancel/i,
            }),
        )

        expect(
            screen.getByRole('button', {
                name: /cv settings/i,
            }),
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('button', {
                name: /cancel cv replacement/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('accepts a valid CV and requires retention consent', async () => {
        renderPage()

        const input = await screen.findByLabelText(/choose file/i)
        const file = new File(
            ['%PDF-1.4 cv contents'],
            'new-cv.pdf',
            { type: 'application/pdf' },
        )

        fireEvent.change(input, {
            target: {
                files: [file],
            },
        })

        expect(
            screen.getByText(/new-cv\.pdf/i),
        ).toBeInTheDocument()

        const consent = screen.getByRole('checkbox')

        expect(consent).not.toBeDisabled()

        fireEvent.change(screen.getByLabelText(/cover letter/i), { target: { value: 'Consider my application.' } })
        fireEvent.click(screen.getByRole('button', { name: /continue/i }))

        expect(
            screen.getByRole('heading', { name: /review your application/i }),
        ).toBeInTheDocument()

    })

    it('rejects unsupported CV file types', async () => {
        renderPage()

        const input = await screen.findByLabelText(/choose file/i)
        const file = new File(
            ['not a CV'],
            'malware.exe',
            { type: 'application/octet-stream' },
        )

        fireEvent.change(input, {
            target: {
                files: [file],
            },
        })

        expect(
            await screen.findByRole('alert'),
        ).toHaveTextContent(
            'Select a valid PDF, DOC, or DOCX file.',
        )

        expect(
            screen.queryByText('malware.exe'),
        ).not.toBeInTheDocument()
    })

    it('shows the job not found state for a 404 response', async () => {
        mockedGetCandidateJobById.mockRejectedValue(
            new ApiError(404, 'Job not found'),
        )

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: /unable to load job/i,
            }),
        ).toBeInTheDocument()

        expect(screen.getByText(/no longer available or could not be found/i)).toBeInTheDocument()
    })

    it('allows retrying after a generic API error', async () => {
        mockedGetCandidateJobById
            .mockRejectedValueOnce(
                new ApiError(500, 'Server error'),
            )
            .mockResolvedValueOnce(candidateJob)

        renderPage()

        expect(
            await screen.findByRole('heading', {
                name: /unable to load/i,
            }),
        ).toBeInTheDocument()

        fireEvent.click(
            screen.getByRole('button', {
                name: /try again/i,
            }),
        )

        expect(
            await screen.findByRole('heading', {
                name: /apply for this job/i,
            }),
        ).toBeInTheDocument()

        expect(
            mockedGetCandidateJobById,
        ).toHaveBeenCalledTimes(2)
    })
})

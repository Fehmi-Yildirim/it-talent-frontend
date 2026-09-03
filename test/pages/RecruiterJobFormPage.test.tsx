import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RecruiterJobFormPage from '../../src/pages/RecruiterJobFormPage'

import {
    createJob,
    createJobRequirement,
    getJobById,
    getJobRequirements,
    removeJobRequirement,
    updateJob,
    updateJobRequirement,
} from '../../src/features/jobs/jobs.api'

import { getSkills } from '../../src/features/skills/skills.api'

vi.mock('../../src/features/jobs/jobs.api', () => ({
    createJob: vi.fn(),
    createJobRequirement: vi.fn(),
    getJobById: vi.fn(),
    getJobRequirements: vi.fn(),
    removeJobRequirement: vi.fn(),
    updateJob: vi.fn(),
    updateJobRequirement: vi.fn(),
}))

vi.mock('../../src/features/skills/skills.api', () => ({
    getSkills: vi.fn(),
}))

const jobId = '11111111-1111-4111-8111-111111111111'
const skillId = '22222222-2222-4222-8222-222222222222'
const skillId2 = '33333333-3333-4333-8333-333333333333'
const requirementId =
    '44444444-4444-4444-8444-444444444444'

const skills = [
    {
        id: skillId,
        name: 'React',
    },
    {
        id: skillId2,
        name: 'TypeScript',
    },
]

const requirement = {
    id: requirementId,
    jobId,
    skillId,
    required: true,
    minimumLevel: 3,
    skill: skills[0],
}

function renderPage(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route
                    path="/recruiter/jobs/new"
                    element={<RecruiterJobFormPage />}
                />

                <Route
                    path="/recruiter/jobs/:jobId/edit"
                    element={<RecruiterJobFormPage />}
                />

                <Route
                    path="/recruiter/jobs"
                    element={<div>Jobs page</div>}
                />
            </Routes>
        </MemoryRouter>,
    )
}

function mockSkills() {
    vi.mocked(getSkills).mockResolvedValue(skills)
}

function mockJob() {
    vi.mocked(getJobById).mockResolvedValue({
        id: jobId,
        companyId:
            '55555555-5555-4555-8555-555555555555',
        createdByRecruiterId:
            '66666666-6666-4666-8666-666666666666',
        title: 'Frontend Developer',
        description:
            'Build frontend applications.',
        location: 'Amsterdam',
        employmentType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 40000,
        salaryMax: 60000,
        currency: 'EUR',
        expiresAt: '2099-12-31',
        status: 'DRAFT',
        publishedAt: null,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        requirements: [],
    })
}

describe('RecruiterJobFormPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(getSkills).mockResolvedValue([])
        vi.mocked(getJobRequirements).mockResolvedValue([])
    })

    it('shows the create form', async () => {
        mockSkills()

        renderPage('/recruiter/jobs/new')

        expect(
            screen.getByRole('heading', {
                name: 'Create job',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText('Job title'),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText('Description'),
        ).toBeInTheDocument()

        await waitFor(() => {
            expect(getSkills).toHaveBeenCalledTimes(1)
        })
    })

    it('loads an existing job and its requirements in edit mode', async () => {
        mockSkills()
        mockJob()

        vi.mocked(getJobRequirements).mockResolvedValue([
            requirement,
        ])

        renderPage(
            `/recruiter/jobs/${jobId}/edit`,
        )

        await waitFor(() => {
            expect(
                screen.getByDisplayValue(
                    'Frontend Developer',
                ),
            ).toBeInTheDocument()
        })

        expect(getJobById).toHaveBeenCalledWith(
            jobId,
        )

        expect(
            getJobRequirements,
        ).toHaveBeenCalledWith(jobId)

        expect(
            screen.getByText('React', {
                selector: 'strong',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByDisplayValue('3'),
        ).toBeInTheDocument()
    })

    it('shows an empty requirements state', async () => {
        mockSkills()
        mockJob()

        vi.mocked(getJobRequirements).mockResolvedValue(
            [],
        )

        renderPage(
            `/recruiter/jobs/${jobId}/edit`,
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'No requirements have been added yet.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('adds a requirement through the API in edit mode', async () => {
        mockSkills()
        mockJob()

        vi.mocked(getJobRequirements).mockResolvedValue(
            [],
        )

        vi.mocked(
            createJobRequirement,
        ).mockResolvedValue(requirement)

        renderPage(
            `/recruiter/jobs/${jobId}/edit`,
        )

        await waitFor(() => {
            expect(
                screen.getByLabelText('Skill'),
            ).toBeInTheDocument()
        })

        fireEvent.change(
            screen.getByLabelText('Skill'),
            {
                target: {
                    value: skillId,
                },
            },
        )

        fireEvent.change(
            screen.getByLabelText(
                'Minimum level',
            ),
            {
                target: {
                    value: '3',
                },
            },
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Add requirement',
            }),
        )

        await waitFor(() => {
            expect(
                createJobRequirement,
            ).toHaveBeenCalledWith(jobId, {
                skillId,
                required: true,
                minimumLevel: 3,
            })
        })

        expect(
            screen.getByText('React', {
                selector: 'strong',
            }),
        ).toBeInTheDocument()
    })

    it('can add a preferred requirement', async () => {
        mockSkills()
        mockJob()

        vi.mocked(getJobRequirements).mockResolvedValue(
            [],
        )

        vi.mocked(
            createJobRequirement,
        ).mockResolvedValue({
            ...requirement,
            id: requirementId,
            skillId: skillId2,
            required: false,
            minimumLevel: 2,
            skill: skills[1],
        })

        renderPage(
            `/recruiter/jobs/${jobId}/edit`,
        )

        await waitFor(() => {
            expect(
                screen.getByLabelText('Skill'),
            ).toBeInTheDocument()
        })

        fireEvent.change(
            screen.getByLabelText('Skill'),
            {
                target: {
                    value: skillId2,
                },
            },
        )

        fireEvent.change(
            screen.getByLabelText(
                'Type',
            ),
            {
                target: {
                    value: 'preferred',
                },
            },
        )

        fireEvent.change(
            screen.getByLabelText(
                'Minimum level',
            ),
            {
                target: {
                    value: '2',
                },
            },
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Add requirement',
            }),
        )

        await waitFor(() => {
            expect(
                createJobRequirement,
            ).toHaveBeenCalledWith(jobId, {
                skillId: skillId2,
                required: false,
                minimumLevel: 2,
            })
        })
    })

    it('updates a requirement through the API', async () => {
        mockSkills()
        mockJob()

        vi.mocked(getJobRequirements).mockResolvedValue([
            requirement,
        ])

        vi.mocked(
            updateJobRequirement,
        ).mockResolvedValue({
            ...requirement,
            required: false,
            minimumLevel: 4,
        })

        renderPage(
            `/recruiter/jobs/${jobId}/edit`,
        )

        await waitFor(() => {
            expect(
                screen.getByText('React', {
                    selector: 'strong',
                }),
            ).toBeInTheDocument()
        })

        const typeSelects =
            screen.getAllByDisplayValue('Required')

        fireEvent.change(typeSelects[typeSelects.length - 1], {
            target: {
                value: 'preferred',
            },
        })

        await waitFor(() => {
            expect(
                updateJobRequirement,
            ).toHaveBeenCalledWith(
                jobId,
                requirementId,
                {
                    required: false,
                },
            )
        })
    })

    it('deletes a requirement through the API', async () => {
        mockSkills()
        mockJob()

        vi.mocked(getJobRequirements).mockResolvedValue([
            requirement,
        ])

        vi.mocked(
            removeJobRequirement,
        ).mockResolvedValue({
            message: 'Requirement removed',
        })

        renderPage(
            `/recruiter/jobs/${jobId}/edit`,
        )

        await waitFor(() => {
            expect(
                screen.getByText('React', {
                    selector: 'strong',
                }),
            ).toBeInTheDocument()
        })

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Delete',
            }),
        )

        await waitFor(() => {
            expect(
                removeJobRequirement,
            ).toHaveBeenCalledWith(
                jobId,
                skillId,
            )
        })

        await waitFor(() => {
            expect(
                screen.queryByText('React', {
                    selector: 'strong',
                }),
            ).not.toBeInTheDocument()
        })
    })

    it('creates a job and then creates pending requirements', async () => {
        mockSkills()

        vi.mocked(createJob).mockResolvedValue({
            id: jobId,
            companyId:
                '55555555-5555-4555-8555-555555555555',
            createdByRecruiterId:
                '66666666-6666-4666-8666-666666666666',
            title: 'React Developer',
            description:
                'Build React applications.',
            location: null,
            employmentType: 'FULL_TIME',
            workMode: 'REMOTE',
            salaryMin: null,
            salaryMax: null,
            currency: 'EUR',
            expiresAt: '2099-12-31',
            status: 'DRAFT',
            publishedAt: null,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
            requirements: [],
        })

        vi.mocked(
            createJobRequirement,
        ).mockResolvedValue(requirement)

        renderPage('/recruiter/jobs/new')

        await waitFor(() => {
            expect(
                screen.getByLabelText('Skill'),
            ).toBeInTheDocument()
        })

        fireEvent.change(
            screen.getByLabelText('Job title'),
            {
                target: {
                    value: 'React Developer',
                },
            },
        )

        fireEvent.change(
            screen.getByLabelText('Description'),
            {
                target: {
                    value:
                        'Build React applications.',
                },
            },
        )

        fireEvent.change(
            screen.getByLabelText('Skill'),
            {
                target: {
                    value: skillId,
                },
            },
        )

        fireEvent.change(
            screen.getByLabelText(
                'Minimum level',
            ),
            {
                target: {
                    value: '3',
                },
            },
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Add requirement',
            }),
        )

        expect(
            screen.getByText('React', {
                selector: 'strong',
            }),
        ).toBeInTheDocument()

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Create job',
            }),
        )

        await waitFor(() => {
            expect(createJob).toHaveBeenCalledWith({
                title: 'React Developer',
                description:
                    'Build React applications.',
                location: undefined,
                employmentType: 'FULL_TIME',
                workMode: 'ONSITE',
                salaryMin: undefined,
                salaryMax: undefined,
                currency: 'EUR',
                expiresAt:
                    expect.any(String),
            })
        })

        expect(
            createJobRequirement,
        ).toHaveBeenCalledWith(jobId, {
            skillId,
            required: true,
            minimumLevel: 3,
        })
    })

    it('rejects an empty title', async () => {
        mockSkills()

        renderPage('/recruiter/jobs/new')

        await waitFor(() => {
            expect(
                screen.getByRole('button', {
                    name: 'Create job',
                }),
            ).toBeInTheDocument()
        })

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Create job',
            }),
        )

        expect(
            screen.getByRole('alert'),
        ).toHaveTextContent(
            'Title is required.',
        )

        expect(createJob).not.toHaveBeenCalled()
    })

    it('rejects a salary range where minimum is greater than maximum', async () => {
        mockSkills()

        renderPage('/recruiter/jobs/new')

        fireEvent.change(
            screen.getByLabelText('Job title'),
            {
                target: {
                    value: 'Developer',
                },
            },
        )

        fireEvent.change(
            screen.getByLabelText('Description'),
            {
                target: {
                    value: 'Developer role.',
                },
            },
        )

        fireEvent.change(
            screen.getByLabelText(
                'Minimum salary',
            ),
            {
                target: {
                    value: '70000',
                },
            },
        )

        fireEvent.change(
            screen.getByLabelText(
                'Maximum salary',
            ),
            {
                target: {
                    value: '50000',
                },
            },
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Create job',
            }),
        )

        expect(
            screen.getByRole('alert'),
        ).toHaveTextContent(
            'Minimum salary cannot be greater than maximum salary.',
        )

        expect(createJob).not.toHaveBeenCalled()
    })

    it('shows an API error when adding a requirement fails', async () => {
        mockSkills()
        mockJob()

        vi.mocked(getJobRequirements).mockResolvedValue(
            [],
        )

        vi.mocked(
            createJobRequirement,
        ).mockRejectedValue(
            new Error('API error'),
        )

        renderPage(
            `/recruiter/jobs/${jobId}/edit`,
        )

        await waitFor(() => {
            expect(
                screen.getByLabelText('Skill'),
            ).toBeInTheDocument()
        })

        fireEvent.change(
            screen.getByLabelText('Skill'),
            {
                target: {
                    value: skillId,
                },
            },
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Add requirement',
            }),
        )

        await waitFor(() => {
            expect(
                screen.getByRole('alert'),
            ).toHaveTextContent(
                'Unable to add the requirement.',
            )
        })
    })

    it('shows an API error when requirements cannot be loaded', async () => {
        mockSkills()
        mockJob()

        vi.mocked(
            getJobRequirements,
        ).mockRejectedValue(
            new Error('API error'),
        )

        renderPage(
            `/recruiter/jobs/${jobId}/edit`,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('alert'),
            ).toHaveTextContent(
                'Unable to load job requirements.',
            )
        })
    })

    it('updates the job in edit mode', async () => {
        mockSkills()
        mockJob()

        vi.mocked(getJobRequirements).mockResolvedValue(
            [],
        )

        vi.mocked(updateJob).mockResolvedValue({
            ...await getJobById(jobId),
        })

        renderPage(
            `/recruiter/jobs/${jobId}/edit`,
        )

        await waitFor(() => {
            expect(
                screen.getByDisplayValue(
                    'Frontend Developer',
                ),
            ).toBeInTheDocument()
        })

        fireEvent.change(
            screen.getByLabelText('Job title'),
            {
                target: {
                    value: 'Senior Frontend Developer',
                },
            },
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Save changes',
            }),
        )

        await waitFor(() => {
            expect(updateJob).toHaveBeenCalledWith(
                jobId,
                expect.objectContaining({
                    title:
                        'Senior Frontend Developer',
                    description:
                        'Build frontend applications.',
                    employmentType:
                        'FULL_TIME',
                    workMode: 'HYBRID',
                }),
            )
        })
    })
})

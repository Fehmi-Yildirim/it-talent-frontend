import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '../test-utils'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import AdminSkillsPage from '../../src/pages/AdminSkillsPage'
import {
    createSkill,
    deleteSkill,
    getSkills,
    updateSkill,
} from '../../src/features/admin/skills.api'

vi.mock('../../src/features/admin/skills.api', () => ({
    createSkill: vi.fn(),
    deleteSkill: vi.fn(),
    getSkills: vi.fn(),
    updateSkill: vi.fn(),
}))

const mockedGetSkills = vi.mocked(getSkills)
const mockedCreateSkill = vi.mocked(createSkill)
const mockedUpdateSkill = vi.mocked(updateSkill)
const mockedDeleteSkill = vi.mocked(deleteSkill)

const skills = [
    {
        id: 'skill-1',
        name: 'React',
        slug: 'react',
        category: 'FRONTEND',
        description: 'React library',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'skill-2',
        name: 'Node.js',
        slug: 'node-js',
        category: 'BACKEND',
        description: 'Node.js runtime',
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
    },
]

function renderAdminSkillsPage() {
    render(
        <MemoryRouter>
            <AdminSkillsPage />
        </MemoryRouter>,
    )
}

describe('AdminSkillsPage', () => {
    beforeEach(() => {
        vi.resetAllMocks()

        mockedGetSkills.mockResolvedValue(skills)
        mockedCreateSkill.mockResolvedValue(skills[0])
        mockedUpdateSkill.mockResolvedValue(skills[0])
        mockedDeleteSkill.mockResolvedValue(undefined)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })


    it('loads and displays skills', async () => {
        renderAdminSkillsPage()

        expect(
            await screen.findByRole('heading', {
                name: 'Admin — Skills Management',
            }),
        ).toBeInTheDocument()

        expect(screen.getByText('React')).toBeInTheDocument()
        expect(screen.getByText('react')).toBeInTheDocument()
        expect(screen.getAllByText('Frontend')).toHaveLength(2)
        expect(screen.getByText('React library')).toBeInTheDocument()

        expect(screen.getByText('Node.js')).toBeInTheDocument()
        expect(screen.getByText('node-js')).toBeInTheDocument()
        expect(screen.getAllByText('Backend')).toHaveLength(2)

        expect(mockedGetSkills).toHaveBeenCalledTimes(1)
        expect(mockedGetSkills).toHaveBeenCalledWith('')
    })


    it('shows the loading state', async () => {
        let resolveSkills!: (value: typeof skills) => void

        mockedGetSkills.mockReturnValue(
            new Promise((resolve) => {
                resolveSkills = resolve
            }),
        )

        renderAdminSkillsPage()

        expect(screen.getByText('Loading skills...')).toBeInTheDocument()

        resolveSkills(skills)

        expect(await screen.findByText('React')).toBeInTheDocument()
    })

    it('shows an API error when loading skills fails', async () => {
        mockedGetSkills.mockRejectedValueOnce(new Error('Request failed'))

        renderAdminSkillsPage()

        expect(
            await screen.findByText('Failed to load skills.'),
        ).toBeInTheDocument()
    })

    it('shows the empty state when no skills exist', async () => {
        mockedGetSkills.mockResolvedValue([])

        renderAdminSkillsPage()

        expect(
            await screen.findByText('No skills found'),
        ).toBeInTheDocument()
    })

    it('searches for skills', async () => {
        mockedGetSkills
            .mockResolvedValueOnce(skills)
            .mockResolvedValueOnce([skills[0]])

        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()
        const searchInput = screen.getByPlaceholderText('Search skills...')

        await user.type(searchInput, 'React')
        await user.click(
            screen.getByRole('button', { name: 'Search' }),
        )

        await waitFor(() => {
            expect(mockedGetSkills).toHaveBeenLastCalledWith('React')
        })

        expect(screen.getByText('React')).toBeInTheDocument()
    })

    it('shows the no-match state after a search', async () => {
        mockedGetSkills
            .mockResolvedValueOnce(skills)
            .mockResolvedValueOnce([])

        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()
        const searchInput = screen.getByPlaceholderText('Search skills...')

        await user.type(searchInput, 'Angular')
        await user.click(
            screen.getByRole('button', { name: 'Search' }),
        )

        expect(
            await screen.findByText(
                'No skills match your search.',
            ),
        ).toBeInTheDocument()
    })

    it('creates a skill', async () => {
        const newSkill = {
            id: 'skill-3',
            name: 'Vue',
            slug: 'vue',
            category: 'FRONTEND',
            description: 'Vue.js framework',
            createdAt: '2026-01-03T00:00:00.000Z',
            updatedAt: '2026-01-03T00:00:00.000Z',
        }

        mockedCreateSkill.mockResolvedValue(newSkill)
        mockedGetSkills
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([newSkill])

        renderAdminSkillsPage()

        await screen.findByText('No skills found')

        const user = userEvent.setup()

        await user.type(
            screen.getByLabelText('Name'),
            'Vue',
        )
        await user.type(
            screen.getByLabelText('Slug'),
            'vue',
        )
        await user.selectOptions(
            screen.getByLabelText('Category'),
            'FRONTEND',
        )
        await user.type(
            screen.getByLabelText('Description'),
            'Vue.js framework',
        )

        await user.click(
            screen.getByRole('button', { name: 'Save' }),
        )

        await waitFor(() => {
            expect(mockedCreateSkill).toHaveBeenCalledWith({
                name: 'Vue',
                slug: 'vue',
                category: 'FRONTEND',
                description: 'Vue.js framework',
            })
        })

        expect(
            await screen.findByText('Vue'),
        ).toBeInTheDocument()
    })

    it('validates required fields before creating a skill', async () => {
        mockedGetSkills.mockResolvedValue([])

        renderAdminSkillsPage()

        await screen.findByText('No skills found')

        const user = userEvent.setup()

        // Name is required
        await user.click(
            screen.getByRole('button', { name: 'Save' }),
        )

        expect(
            screen.getByText('Name is required.'),
        ).toBeInTheDocument()

        // Slug is required after providing a name
        await user.type(
            screen.getByLabelText('Name'),
            'Vue',
        )

        await user.click(
            screen.getByRole('button', { name: 'Save' }),
        )

        expect(
            screen.getByText('Slug is required.'),
        ).toBeInTheDocument()

        // Category is required after providing name + slug
        await user.type(
            screen.getByLabelText('Slug'),
            'vue',
        )

        await user.click(
            screen.getByRole('button', { name: 'Save' }),
        )

        expect(
            screen.getByText('Category is required.'),
        ).toBeInTheDocument()

        expect(mockedCreateSkill).not.toHaveBeenCalled()
    })



    it('edits an existing skill', async () => {
        const updatedSkill = {
            ...skills[0],
            name: 'React.js',
            description: 'React library updated',
        }

        mockedUpdateSkill.mockResolvedValue(updatedSkill)

        mockedGetSkills
            .mockResolvedValueOnce(skills)
            .mockResolvedValueOnce([updatedSkill])

        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()

        const editButtons = screen.getAllByRole(
            'button',
            { name: 'Edit' },
        )

        await user.click(editButtons[0])

        const nameInput = screen.getByLabelText('Name')

        await user.clear(nameInput)
        await user.type(nameInput, 'React.js')

        await user.click(
            screen.getByRole('button', { name: 'Save' }),
        )

        await waitFor(() => {
            expect(mockedUpdateSkill).toHaveBeenCalledWith(
                'skill-1',
                {
                    name: 'React.js',
                    slug: 'react',
                    category: 'FRONTEND',
                    description: 'React library',
                },
            )
        })

        expect(
            await screen.findByText('React.js'),
        ).toBeInTheDocument()
    })

    it('deletes a skill after confirmation', async () => {
        mockedGetSkills
            .mockResolvedValueOnce(skills)
            .mockResolvedValueOnce([skills[1]])

        vi.spyOn(window, 'confirm').mockReturnValue(true)

        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()

        const deleteButtons = screen.getAllByRole(
            'button',
            { name: 'Delete' },
        )

        await user.click(deleteButtons[0])

        expect(window.confirm).toHaveBeenCalledWith(
            'Are you sure you want to delete this skill? React',
        )

        await waitFor(() => {
            expect(mockedDeleteSkill).toHaveBeenCalledWith(
                'skill-1',
            )
        })

        expect(
            await screen.findByText('Node.js'),
        ).toBeInTheDocument()
    })

    it('does not delete a skill when confirmation is cancelled', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(false)

        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()

        const deleteButtons = screen.getAllByRole(
            'button',
            { name: 'Delete' },
        )

        await user.click(deleteButtons[0])

        expect(mockedDeleteSkill).not.toHaveBeenCalled()
    })

    it('shows the duplicate slug error', async () => {
        mockedGetSkills.mockResolvedValue([])

        mockedCreateSkill.mockRejectedValueOnce(
            new Error('Skill with this slug already exists'),
        )

        renderAdminSkillsPage()

        await screen.findByText('No skills found')

        const user = userEvent.setup()

        await user.type(
            screen.getByLabelText('Name'),
            'React',
        )
        await user.type(
            screen.getByLabelText('Slug'),
            'react',
        )
        await user.selectOptions(
            screen.getByLabelText('Category'),
            'FRONTEND',
        )

        await user.click(
            screen.getByRole('button', { name: 'Save' }),
        )

        expect(
            await screen.findByText(
                'A skill with this slug already exists.',
            ),
        ).toBeInTheDocument()
    })

    it('allows refreshing the skills list', async () => {
        mockedGetSkills
            .mockResolvedValueOnce(skills)
            .mockResolvedValueOnce([skills[0]])

        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()

        await user.click(
            screen.getByRole('button', { name: 'Refresh' }),
        )

        await waitFor(() => {
            expect(mockedGetSkills).toHaveBeenCalledTimes(2)
        })

        expect(
            mockedGetSkills,
        ).toHaveBeenLastCalledWith('')
    })

    it('shows an error when creating a skill fails', async () => {
        mockedGetSkills.mockResolvedValue([])
        mockedCreateSkill.mockRejectedValueOnce(
            new Error('Create failed'),
        )

        renderAdminSkillsPage()

        await screen.findByText('No skills found')

        const user = userEvent.setup()

        await user.type(
            screen.getByLabelText('Name'),
            'Vue',
        )
        await user.type(
            screen.getByLabelText('Slug'),
            'vue',
        )
        await user.selectOptions(
            screen.getByLabelText('Category'),
            'FRONTEND',
        )

        await user.click(
            screen.getByRole('button', { name: 'Save' }),
        )

        expect(
            await screen.findByText(
                'Failed to create skill.',
            ),
        ).toBeInTheDocument()
    })

    it('shows an error when updating a skill fails', async () => {
        mockedUpdateSkill.mockRejectedValueOnce(
            new Error('Update failed'),
        )

        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()

        await user.click(
            screen.getAllByRole(
                'button',
                { name: 'Edit' },
            )[0],
        )

        await user.click(
            screen.getByRole('button', { name: 'Save' }),
        )

        expect(
            await screen.findByText(
                'Failed to update skill.',
            ),
        ).toBeInTheDocument()
    })

    it('shows an error when deleting a skill fails', async () => {
        mockedDeleteSkill.mockRejectedValueOnce(
            new Error('Delete failed'),
        )

        vi.spyOn(window, 'confirm').mockReturnValue(true)

        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()

        await user.click(
            screen.getAllByRole(
                'button',
                { name: 'Delete' },
            )[0],
        )

        expect(
            await screen.findByText(
                'Failed to delete skill.',
            ),
        ).toBeInTheDocument()
    })
})

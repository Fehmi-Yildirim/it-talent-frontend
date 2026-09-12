import '@testing-library/jest-dom/vitest'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '../test-utils'
import userEvent from '@testing-library/user-event'
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
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

async function openActionMenu(
    user: ReturnType<typeof userEvent.setup>,
    index = 0,
) {
    const actionButtons = screen.getAllByRole('button', {
        name: /Actions:/,
    })

    await user.click(actionButtons[index])
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
        expect(
            screen.getByText('React library'),
        ).toBeInTheDocument()

        expect(screen.getByText('Node.js')).toBeInTheDocument()
        expect(
            screen.getByText('Node.js runtime'),
        ).toBeInTheDocument()

        expect(
            screen.getAllByRole('columnheader'),
        ).toHaveLength(4)

        expect(
            screen.getByRole('columnheader', {
                name: 'Name',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('columnheader', {
                name: 'Category',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('columnheader', {
                name: 'Description',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('columnheader', {
                name: 'Actions',
            }),
        ).toBeInTheDocument()

        expect(mockedGetSkills).toHaveBeenCalledTimes(1)
        expect(mockedGetSkills).toHaveBeenCalledWith('')
    })

    it('does not display the slug in the skills table', async () => {
        renderAdminSkillsPage()

        await screen.findByText('React')

        const table = screen.getByRole('table')

        expect(table).not.toHaveTextContent('react')
        expect(table).not.toHaveTextContent('node-js')
    })

    it('shows the loading state', async () => {
        let resolveSkills!: (
            value: typeof skills,
        ) => void

        mockedGetSkills.mockReturnValue(
            new Promise((resolve) => {
                resolveSkills = resolve
            }),
        )

        renderAdminSkillsPage()

        expect(
            screen.getByText('Loading skills...'),
        ).toBeInTheDocument()

        resolveSkills(skills)

        expect(
            await screen.findByText('React'),
        ).toBeInTheDocument()
    })

    it('shows an API error when loading skills fails', async () => {
        mockedGetSkills.mockRejectedValueOnce(
            new Error('Request failed'),
        )

        renderAdminSkillsPage()

        expect(
            await screen.findByText(
                'Failed to load skills.',
            ),
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

        const searchInput =
            screen.getByPlaceholderText(
                'Search skills...',
            )

        await user.type(searchInput, 'React')

        await user.click(
            screen.getByRole('button', {
                name: 'Search',
            }),
        )

        await waitFor(() => {
            expect(mockedGetSkills).toHaveBeenLastCalledWith(
                'React',
            )
        })

        expect(
            screen.getByText('React'),
        ).toBeInTheDocument()
    })

    it('shows the no-match state after a search', async () => {
        mockedGetSkills
            .mockResolvedValueOnce(skills)
            .mockResolvedValueOnce([])

        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()

        const searchInput =
            screen.getByPlaceholderText(
                'Search skills...',
            )

        await user.type(searchInput, 'Angular')

        await user.click(
            screen.getByRole('button', {
                name: 'Search',
            }),
        )

        expect(
            await screen.findByText(
                'No skills match your search.',
            ),
        ).toBeInTheDocument()
    })

    it('opens the create drawer', async () => {
        mockedGetSkills.mockResolvedValue([])

        renderAdminSkillsPage()

        await screen.findByText('No skills found')

        const user = userEvent.setup()

        await user.click(
            screen.getByRole('button', {
                name: 'Create skill',
            }),
        )

        expect(
            screen.getByRole('dialog'),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('heading', {
                name: 'Create skill',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText('Name'),
        ).toBeInTheDocument()

        expect(
            screen.queryByLabelText('Slug'),
        ).not.toBeInTheDocument()

        expect(
            screen.getByLabelText('Category'),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText('Description'),
        ).toBeInTheDocument()
    })

    it('creates a skill without sending a slug', async () => {
        const newSkill = {
            id: 'skill-3',
            name: 'Vue',
            slug: 'vue',
            category: 'FRONTEND',
            description: 'Vue.js framework',
            createdAt: '2026-01-03T00:00:00.000Z',
            updatedAt: '2026-01-03T00:00:00.000Z',
        }

        mockedGetSkills.mockResolvedValue([])
        mockedCreateSkill.mockResolvedValue(newSkill)

        renderAdminSkillsPage()

        await screen.findByText('No skills found')

        const user = userEvent.setup()

        await user.click(
            screen.getByRole('button', {
                name: 'Create skill',
            }),
        )

        fireEvent.change(
            screen.getByLabelText('Name'),
            {
                target: {
                    value: 'Vue',
                },
            },
        )

        await user.selectOptions(
            screen.getByLabelText('Category'),
            'FRONTEND',
        )

        fireEvent.change(
            screen.getByLabelText('Description'),
            {
                target: {
                    value: 'Vue.js framework',
                },
            },
        )

        expect(
            screen.getByLabelText('Name'),
        ).toHaveValue('Vue')

        expect(
            screen.getByLabelText('Description'),
        ).toHaveValue('Vue.js framework')

        await user.click(
            screen.getByRole('button', {
                name: 'Save',
            }),
        )

        await waitFor(() => {
            expect(
                mockedCreateSkill,
            ).toHaveBeenCalledWith({
                name: 'Vue',
                category: 'FRONTEND',
                description: 'Vue.js framework',
            })
        })

        expect(
            screen.getByText('Vue'),
        ).toBeInTheDocument()

        expect(
            screen.queryByRole('dialog'),
        ).not.toBeInTheDocument()
    })

    it('creates a skill without sending a slug', async () => {
        mockedGetSkills.mockResolvedValue([])

        renderAdminSkillsPage()

        await screen.findByText('No skills found')

        const user = userEvent.setup()

        await user.click(
            screen.getByRole('button', {
                name: 'Create skill',
            }),
        )

        fireEvent.change(
            screen.getByLabelText('Name'),
            {
                target: {
                    value: 'React Native',
                },
            },
        )

        await user.selectOptions(
            screen.getByLabelText('Category'),
            'FRONTEND',
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Save',
            }),
        )

        await waitFor(() => {
            expect(
                mockedCreateSkill,
            ).toHaveBeenCalledWith({
                name: 'React Native',
                category: 'FRONTEND',
                description: null,
            })
        })
    })

    it('validates required fields before creating a skill', async () => {
        mockedGetSkills.mockResolvedValue([])

        renderAdminSkillsPage()

        await screen.findByText('No skills found')

        const user = userEvent.setup()

        await user.click(
            screen.getByRole('button', {
                name: 'Create skill',
            }),
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Save',
            }),
        )

        expect(
            screen.getByText(
                'Name is required.',
            ),
        ).toBeInTheDocument()

        fireEvent.change(
            screen.getByLabelText('Name'),
            {
                target: {
                    value: 'Vue',
                },
            },
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Save',
            }),
        )

        expect(
            screen.getByText(
                'Category is required.',
            ),
        ).toBeInTheDocument()

        expect(
            mockedCreateSkill,
        ).not.toHaveBeenCalled()
    })

    it('opens the edit drawer through the action menu', async () => {
        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()

        await openActionMenu(user)

        expect(
            screen.getByRole('menu'),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('menuitem', {
                name: 'Edit',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('menuitem', {
                name: 'Delete',
            }),
        ).toBeInTheDocument()

        await user.click(
            screen.getByRole('menuitem', {
                name: 'Edit',
            }),
        )

        expect(
            screen.getByRole('dialog'),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('heading', {
                name: 'Edit skill',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText('Name'),
        ).toHaveValue('React')

        expect(
            screen.queryByLabelText('Slug'),
        ).not.toBeInTheDocument()

        expect(
            screen.getByLabelText('Category'),
        ).toHaveValue('FRONTEND')

        expect(
            screen.getByLabelText('Description'),
        ).toHaveValue('React library')
    })

    it('edits an existing skill without sending a slug', async () => {
        const updatedSkill = {
            ...skills[0],
            name: 'React.js',
            description: 'React library updated',
        }

        mockedUpdateSkill.mockResolvedValue(
            updatedSkill,
        )

        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()

        await openActionMenu(user)

        await user.click(
            screen.getByRole('menuitem', {
                name: 'Edit',
            }),
        )

        const nameInput =
            screen.getByLabelText('Name')

        fireEvent.change(nameInput, {
            target: {
                value: 'React.js',
            },
        })

        expect(nameInput).toHaveValue('React.js')

        await user.click(
            screen.getByRole('button', {
                name: 'Save',
            }),
        )

        await waitFor(() => {
            expect(
                mockedUpdateSkill,
            ).toHaveBeenCalledWith(
                'skill-1',
                {
                    name: 'React.js',
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
        vi.spyOn(window, 'confirm').mockReturnValue(
            true,
        )

        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()

        await openActionMenu(user)

        await user.click(
            screen.getByRole('menuitem', {
                name: 'Delete',
            }),
        )

        expect(
            window.confirm,
        ).toHaveBeenCalledWith(
            'Are you sure you want to delete this skill? React',
        )

        await waitFor(() => {
            expect(
                mockedDeleteSkill,
            ).toHaveBeenCalledWith('skill-1')
        })

        expect(
            screen.queryByText('React'),
        ).not.toBeInTheDocument()

        expect(
            screen.getByText('Node.js'),
        ).toBeInTheDocument()
    })

    it('does not delete a skill when confirmation is cancelled', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(
            false,
        )

        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()

        await openActionMenu(user)

        await user.click(
            screen.getByRole('menuitem', {
                name: 'Delete',
            }),
        )

        expect(
            window.confirm,
        ).toHaveBeenCalledWith(
            'Are you sure you want to delete this skill? React',
        )

        expect(
            mockedDeleteSkill,
        ).not.toHaveBeenCalled()
    })

    it('shows the duplicate slug error', async () => {
        mockedGetSkills.mockResolvedValue([])

        mockedCreateSkill.mockRejectedValueOnce(
            new Error(
                'Skill with this slug already exists',
            ),
        )

        renderAdminSkillsPage()

        await screen.findByText('No skills found')

        const user = userEvent.setup()

        await user.click(
            screen.getByRole('button', {
                name: 'Create skill',
            }),
        )

        fireEvent.change(
            screen.getByLabelText('Name'),
            {
                target: {
                    value: 'React',
                },
            },
        )

        await user.selectOptions(
            screen.getByLabelText('Category'),
            'FRONTEND',
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Save',
            }),
        )

        expect(
            await screen.findByText(
                'A skill with this slug already exists.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('dialog'),
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
            screen.getByRole('button', {
                name: 'Refresh',
            }),
        )

        await waitFor(() => {
            expect(
                mockedGetSkills,
            ).toHaveBeenCalledTimes(2)
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

        await user.click(
            screen.getByRole('button', {
                name: 'Create skill',
            }),
        )

        fireEvent.change(
            screen.getByLabelText('Name'),
            {
                target: {
                    value: 'Vue',
                },
            },
        )

        await user.selectOptions(
            screen.getByLabelText('Category'),
            'FRONTEND',
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Save',
            }),
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

        await openActionMenu(user)

        await user.click(
            screen.getByRole('menuitem', {
                name: 'Edit',
            }),
        )

        await user.click(
            screen.getByRole('button', {
                name: 'Save',
            }),
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

        vi.spyOn(window, 'confirm').mockReturnValue(
            true,
        )

        renderAdminSkillsPage()

        await screen.findByText('React')

        const user = userEvent.setup()

        await openActionMenu(user)

        await user.click(
            screen.getByRole('menuitem', {
                name: 'Delete',
            }),
        )

        expect(
            await screen.findByText(
                'Failed to delete skill.',
            ),
        ).toBeInTheDocument()
    })
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CandidateSkills from '../../../src/features/candidate/CandidateSkills'
import {
    createCandidateSkill,
    deleteCandidateSkill,
    getCandidateSkills,
    getSkills,
    updateCandidateSkill,
} from '../../../src/features/candidate/candidate.api'
import { ApiError } from '../../../src/services/api/apiError'

vi.mock('../../../src/features/candidate/candidate.api', () => ({
    createCandidateSkill: vi.fn(),
    deleteCandidateSkill: vi.fn(),
    getCandidateSkills: vi.fn(),
    getSkills: vi.fn(),
    updateCandidateSkill: vi.fn(),
}))

const mockedGetCandidateSkills = vi.mocked(getCandidateSkills)
const mockedGetSkills = vi.mocked(getSkills)
const mockedCreateCandidateSkill = vi.mocked(createCandidateSkill)
const mockedUpdateCandidateSkill = vi.mocked(updateCandidateSkill)
const mockedDeleteCandidateSkill = vi.mocked(deleteCandidateSkill)

const reactSkill = {
    id: 'skill-react',
    name: 'React',
    slug: 'react',
    category: 'FRONTEND',
    description: 'React development',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
}

const typescriptSkill = {
    id: 'skill-typescript',
    name: 'TypeScript',
    slug: 'typescript',
    category: 'LANGUAGE',
    description: 'TypeScript development',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
}

const candidateReactSkill = {
    id: 'candidate-skill-react',
    skillId: reactSkill.id,
    proficiencyLevel: 4,
    yearsOfExperience: 3,
    source: 'SELF_REPORTED',
    skill: {
        id: reactSkill.id,
        name: reactSkill.name,
        slug: reactSkill.slug,
        category: reactSkill.category,
        description: reactSkill.description,
    },
}

function renderSkills() {
    return render(<CandidateSkills />)
}

describe('CandidateSkills', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockedGetCandidateSkills.mockResolvedValue([candidateReactSkill])
        mockedGetSkills.mockResolvedValue([reactSkill, typescriptSkill])
        mockedCreateCandidateSkill.mockResolvedValue(candidateReactSkill)
        mockedUpdateCandidateSkill.mockResolvedValue(candidateReactSkill)
        mockedDeleteCandidateSkill.mockResolvedValue(undefined)
    })

    it('loads and displays candidate skills', async () => {
        renderSkills()

        expect(screen.getByText('Loading skills...')).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getByText('React')).toBeInTheDocument()
            expect(screen.getByText('Proficiency: 4/5')).toBeInTheDocument()
            expect(screen.getByText('Experience: 3 years')).toBeInTheDocument()
        })

        expect(mockedGetCandidateSkills).toHaveBeenCalledTimes(1)
        expect(mockedGetSkills).toHaveBeenCalledTimes(1)
    })

    it('shows an empty state when no skills exist', async () => {
        mockedGetCandidateSkills.mockResolvedValueOnce([])

        renderSkills()

        await waitFor(() => {
            expect(screen.getByText('No skills added yet.')).toBeInTheDocument()
        })
    })

    it('adds a skill', async () => {
        const createdSkill = {
            ...candidateReactSkill,
            id: 'candidate-skill-typescript',
            skillId: typescriptSkill.id,
            skill: {
                id: typescriptSkill.id,
                name: typescriptSkill.name,
                slug: typescriptSkill.slug,
                category: typescriptSkill.category,
                description: typescriptSkill.description,
            },
            proficiencyLevel: 5,
            yearsOfExperience: 2,
        }

        mockedCreateCandidateSkill.mockResolvedValueOnce(createdSkill)

        renderSkills()

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'TypeScript' })).toBeInTheDocument()
        })

        fireEvent.change(screen.getByLabelText('Skill'), {
            target: { value: typescriptSkill.id },
        })

        fireEvent.change(screen.getByLabelText('Proficiency level'), {
            target: { value: '5' },
        })

        fireEvent.change(screen.getByLabelText('Years of experience'), {
            target: { value: '2' },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Add skill' }))

        await waitFor(() => {
            expect(mockedCreateCandidateSkill).toHaveBeenCalledWith({
                skillId: typescriptSkill.id,
                proficiencyLevel: 5,
                yearsOfExperience: 2,
            })
        })

        expect(screen.getByText('Skill added successfully.')).toBeInTheDocument()
        expect(screen.getAllByText('TypeScript').length).toBeGreaterThan(0)
    })

    it('updates a skill', async () => {
        mockedUpdateCandidateSkill.mockResolvedValueOnce({
            ...candidateReactSkill,
            proficiencyLevel: 5,
            yearsOfExperience: 4,
        })

        renderSkills()

        await waitFor(() => {
            expect(screen.getByText('React')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

        const proficiencyInputs = screen.getAllByLabelText('Proficiency level')
        const experienceInputs = screen.getAllByLabelText('Years of experience')

        fireEvent.change(proficiencyInputs[1], {
            target: { value: '5' },
        })

        fireEvent.change(experienceInputs[1], {
            target: { value: '4' },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(mockedUpdateCandidateSkill).toHaveBeenCalledWith(
                candidateReactSkill.id,
                {
                    proficiencyLevel: 5,
                    yearsOfExperience: 4,
                },
            )
        })

        expect(screen.getByText('Skill updated successfully.')).toBeInTheDocument()
    })

    it('removes a skill after confirmation', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true)

        renderSkills()

        await waitFor(() => {
            expect(screen.getByText('React')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

        await waitFor(() => {
            expect(mockedDeleteCandidateSkill).toHaveBeenCalledWith(
                candidateReactSkill.id,
            )
        })

        expect(screen.queryByText('Proficiency: 4/5')).not.toBeInTheDocument()
        expect(screen.getByText('Skill removed successfully.')).toBeInTheDocument()
    })

    it('does not remove a skill when confirmation is cancelled', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(false)

        renderSkills()

        await waitFor(() => {
            expect(screen.getByText('React')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

        expect(mockedDeleteCandidateSkill).not.toHaveBeenCalled()
    })

    it('handles duplicate skill errors', async () => {
        mockedCreateCandidateSkill.mockRejectedValueOnce(
            new ApiError(409, 'Duplicate skill'),
        )

        renderSkills()

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'TypeScript' })).toBeInTheDocument()
        })

        fireEvent.change(screen.getByLabelText('Skill'), {
            target: { value: typescriptSkill.id },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Add skill' }))

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(
                'You already added this skill.',
            )
        })
    })

    it('handles invalid skill errors', async () => {
        mockedCreateCandidateSkill.mockRejectedValueOnce(
            new ApiError(404, 'Skill not found'),
        )

        renderSkills()

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'TypeScript' })).toBeInTheDocument()
        })

        fireEvent.change(screen.getByLabelText('Skill'), {
            target: { value: typescriptSkill.id },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Add skill' }))

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(
                'The selected skill could not be found.',
            )
        })
    })

    it('handles loading errors', async () => {
        mockedGetCandidateSkills.mockRejectedValueOnce(
            new ApiError(500, 'Server error'),
        )

        renderSkills()

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(
                'Unable to load your skills.',
            )
        })
    })
})

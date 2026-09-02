import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CompanyManagement from '../../../src/features/recruiter/CompanyManagement'
import { apiClient } from '../../../src/services/api/apiClient'

vi.mock('../../../src/services/api/apiClient', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
    },
}))

const company = {
    id: 'company-1',
    name: 'Tech Company',
    slug: 'tech-company',
    website: null,
    description: 'Een IT-bedrijf',
    location: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
}

describe('CompanyManagement', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows loading state', () => {
        vi.mocked(apiClient.get).mockReturnValue(
            new Promise(() => undefined),
        )

        render(<CompanyManagement />)

        expect(
            screen.getByText('Bedrijfsgegevens laden...'),
        ).toBeInTheDocument()
    })

    it('displays existing company', async () => {
        vi.mocked(apiClient.get).mockResolvedValue(company)

        render(<CompanyManagement />)

        expect(await screen.findByDisplayValue('Tech Company')).toBeInTheDocument()
        expect(
            screen.getByDisplayValue('Een IT-bedrijf'),
        ).toBeInTheDocument()

        expect(apiClient.get).toHaveBeenCalledWith('/companies/me')
    })

    it('shows create option when recruiter has no company', async () => {
        vi.mocked(apiClient.get).mockRejectedValue(
            new Error('Company not found'),
        )

        render(<CompanyManagement />)

        expect(
            await screen.findByText(
                'Je bent nog niet gekoppeld aan een bedrijf.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Bedrijf aanmaken' }),
        ).toBeInTheDocument()
    })

    it('shows create form', async () => {
        vi.mocked(apiClient.get).mockRejectedValue(
            new Error('Company not found'),
        )

        render(<CompanyManagement />)

        fireEvent.click(
            await screen.findByRole('button', { name: 'Bedrijf aanmaken' }),
        )

        expect(
            screen.getByRole('heading', { name: 'Bedrijf aanmaken' }),
        ).toBeInTheDocument()

        expect(screen.getByLabelText('Bedrijfsnaam')).toBeInTheDocument()
        expect(screen.getByLabelText('Beschrijving')).toBeInTheDocument()
    })

    it('creates a company', async () => {
        vi.mocked(apiClient.get).mockRejectedValue(
            new Error('Company not found'),
        )

        vi.mocked(apiClient.post).mockResolvedValue(company)

        render(<CompanyManagement />)

        fireEvent.click(
            await screen.findByRole('button', { name: 'Bedrijf aanmaken' }),
        )

        fireEvent.change(screen.getByLabelText('Bedrijfsnaam'), {
            target: { value: 'Tech Company' },
        })

        fireEvent.change(screen.getByLabelText('Beschrijving'), {
            target: { value: 'Een IT-bedrijf' },
        })

        fireEvent.click(
            screen.getByRole('button', { name: 'Bedrijf aanmaken' }),
        )

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith('/companies', {
                name: 'Tech Company',
                description: 'Een IT-bedrijf',
            })
        })

        expect(
            await screen.findByText('Bedrijf succesvol aangemaakt.'),
        ).toBeInTheDocument()
    })

    it('updates an existing company', async () => {
        vi.mocked(apiClient.get).mockResolvedValue(company)

        vi.mocked(apiClient.patch).mockResolvedValue({
            ...company,
            name: 'Updated Company',
            description: 'Nieuwe beschrijving',
        })

        render(<CompanyManagement />)

        const nameInput = await screen.findByDisplayValue('Tech Company')
        const descriptionInput = screen.getByDisplayValue('Een IT-bedrijf')

        fireEvent.change(nameInput, {
            target: { value: 'Updated Company' },
        })

        fireEvent.change(descriptionInput, {
            target: { value: 'Nieuwe beschrijving' },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

        await waitFor(() => {
            expect(apiClient.patch).toHaveBeenCalledWith('/companies/me', {
                name: 'Updated Company',
                description: 'Nieuwe beschrijving',
            })
        })

        expect(
            await screen.findByText('Bedrijfsgegevens opgeslagen.'),
        ).toBeInTheDocument()
    })

    it('shows error when company update fails', async () => {
        vi.mocked(apiClient.get).mockResolvedValue(company)
        vi.mocked(apiClient.patch).mockRejectedValue(
            new Error('Request failed'),
        )

        render(<CompanyManagement />)

        const nameInput = await screen.findByDisplayValue('Tech Company')

        fireEvent.change(nameInput, {
            target: { value: 'Updated Company' },
        })

        fireEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

        expect(
            await screen.findByText(
                'Bedrijfsgegevens konden niet worden opgeslagen.',
            ),
        ).toBeInTheDocument()
    })
})
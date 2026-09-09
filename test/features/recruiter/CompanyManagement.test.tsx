import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '../../test-utils'
import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'
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
    description: 'An IT company',
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
            screen.getByText('Loading company information...'),
        ).toBeInTheDocument()
    })

    it('displays existing company', async () => {
        vi.mocked(apiClient.get).mockResolvedValue(company)

        render(<CompanyManagement />)

        expect(
            await screen.findByDisplayValue('Tech Company'),
        ).toBeInTheDocument()

        expect(
            screen.getByDisplayValue('An IT company'),
        ).toBeInTheDocument()

        expect(apiClient.get).toHaveBeenCalledWith('/companies/me')
    })

    it('shows create option when recruiter has no company', async () => {
        vi.mocked(apiClient.get).mockRejectedValue(
            new Error('Company not found'),
        )

        render(<CompanyManagement />)

        expect(
            await screen.findByRole('heading', {
                name: 'Company information unavailable',
            }),
        ).toBeInTheDocument()

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Unable to load company information.',
        )

        expect(
            screen.getByRole('button', { name: 'Try again' }),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Create company' }),
        ).toBeInTheDocument()
    })

    it('shows create form', async () => {
        vi.mocked(apiClient.get).mockRejectedValue(
            new Error('Company not found'),
        )

        render(<CompanyManagement />)

        fireEvent.click(
            await screen.findByRole('button', {
                name: 'Create company',
            }),
        )

        expect(
            screen.getByRole('heading', {
                name: 'Create company',
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText('Company name'),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText('Description'),
        ).toBeInTheDocument()
    })

    it('creates a company', async () => {
        vi.mocked(apiClient.get).mockRejectedValue(
            new Error('Company not found'),
        )

        vi.mocked(apiClient.post).mockResolvedValue(company)

        render(<CompanyManagement />)

        fireEvent.click(
            await screen.findByRole('button', {
                name: 'Create company',
            }),
        )

        fireEvent.change(
            screen.getByLabelText('Company name'),
            {
                target: { value: 'Tech Company' },
            },
        )

        fireEvent.change(
            screen.getByLabelText('Description'),
            {
                target: { value: 'An IT company' },
            },
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Create company',
            }),
        )

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith(
                '/companies',
                {
                    name: 'Tech Company',
                    description: 'An IT company',
                },
            )
        })

        expect(
            await screen.findByText(
                'Company created successfully.',
            ),
        ).toBeInTheDocument()
    })

    it('updates an existing company', async () => {
        vi.mocked(apiClient.get).mockResolvedValue(company)

        vi.mocked(apiClient.patch).mockResolvedValue({
            ...company,
            name: 'Updated Company',
            description: 'New description',
        })

        render(<CompanyManagement />)

        const nameInput =
            await screen.findByDisplayValue('Tech Company')

        const descriptionInput =
            screen.getByDisplayValue('An IT company')

        fireEvent.change(nameInput, {
            target: { value: 'Updated Company' },
        })

        fireEvent.change(descriptionInput, {
            target: { value: 'New description' },
        })

        fireEvent.click(
            screen.getByRole('button', { name: 'Save' }),
        )

        await waitFor(() => {
            expect(apiClient.patch).toHaveBeenCalledWith(
                '/companies/me',
                {
                    name: 'Updated Company',
                    description: 'New description',
                },
            )
        })

        expect(
            await screen.findByText(
                'Company information saved successfully.',
            ),
        ).toBeInTheDocument()
    })

    it('shows error when company update fails', async () => {
        vi.mocked(apiClient.get).mockResolvedValue(company)

        vi.mocked(apiClient.patch).mockRejectedValue(
            new Error('Request failed'),
        )

        render(<CompanyManagement />)

        const nameInput =
            await screen.findByDisplayValue('Tech Company')

        fireEvent.change(nameInput, {
            target: { value: 'Updated Company' },
        })

        fireEvent.click(
            screen.getByRole('button', { name: 'Save' }),
        )

        expect(
            await screen.findByRole('alert'),
        ).toHaveTextContent(
            'Unable to save company information.',
        )
    })
})

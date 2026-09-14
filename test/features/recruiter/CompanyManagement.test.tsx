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
    website: 'https://example.com',
    description: 'An IT company',
    location: 'Amsterdam',
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

        expect(
            screen.getByDisplayValue('https://example.com'),
        ).toBeInTheDocument()

        expect(
            screen.getByDisplayValue('Amsterdam'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('01/01/2026'),
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

        expect(
            screen.getByLabelText('Website'),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText('Location'),
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

        fireEvent.change(
            screen.getByLabelText('Website'),
            {
                target: { value: 'https://example.com' },
            },
        )

        fireEvent.change(
            screen.getByLabelText('Location'),
            {
                target: { value: 'Amsterdam' },
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
                    website: 'https://example.com',
                    location: 'Amsterdam',
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
            website: 'https://updated-example.com',
            location: 'Rotterdam',
        })

        render(<CompanyManagement />)

        const nameInput =
            await screen.findByDisplayValue('Tech Company')

        const descriptionInput =
            screen.getByDisplayValue('An IT company')

        const websiteInput =
            screen.getByDisplayValue('https://example.com')

        const locationInput =
            screen.getByDisplayValue('Amsterdam')

        fireEvent.change(nameInput, {
            target: { value: 'Updated Company' },
        })

        fireEvent.change(descriptionInput, {
            target: { value: 'New description' },
        })

        fireEvent.change(websiteInput, {
            target: { value: 'https://updated-example.com' },
        })

        fireEvent.change(locationInput, {
            target: { value: 'Rotterdam' },
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
                    website: 'https://updated-example.com',
                    location: 'Rotterdam',
                },
            )
        })

        expect(
            await screen.findByText(
                'Company information saved successfully.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByDisplayValue('Updated Company'),
        ).toBeInTheDocument()

        expect(
            screen.getByDisplayValue('New description'),
        ).toBeInTheDocument()

        expect(
            screen.getByDisplayValue(
                'https://updated-example.com',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByDisplayValue('Rotterdam'),
        ).toBeInTheDocument()
    })

    it('handles empty website and location', async () => {
        vi.mocked(apiClient.get).mockResolvedValue({
            ...company,
            website: null,
            location: null,
        })

        render(<CompanyManagement />)

        expect(
            await screen.findByDisplayValue('Tech Company'),
        ).toBeInTheDocument()

        expect(
            screen.getByLabelText('Website'),
        ).toHaveValue('')

        expect(
            screen.getByLabelText('Location'),
        ).toHaveValue('')

        expect(
            screen.getByText('01/01/2026'),
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
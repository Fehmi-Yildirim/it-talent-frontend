import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '../test-utils'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import AdminContentNewPage from '../../src/features/admin/content/AdminContentNewPage'
import { createContentPage } from '../../src/features/admin/content.api'
import { ApiError } from '../../src/services/api/apiError'
import type { JSONContent } from '@tiptap/core'

vi.mock('../../src/features/admin/content.api', () => ({
    createContentPage: vi.fn(),
}))

vi.mock('../../src/features/admin/content/CmsRichTextEditor', () => ({
    default: ({
        value,
        onChange,
        disabled,
    }: {
        value: JSONContent
        onChange: (value: JSONContent) => void
        disabled?: boolean
    }) => (
        <div>
            <label htmlFor="mock-rich-text-editor">Content</label>
            <textarea
                id="mock-rich-text-editor"
                aria-label="Content"
                value={value.content?.[0]?.content?.[0]?.text ?? ''}
                disabled={disabled}
                onChange={(event) =>
                    onChange({
                        type: 'doc',
                        content: [
                            {
                                type: 'paragraph',
                                content: [
                                    {
                                        type: 'text',
                                        text: event.target.value,
                                    },
                                ],
                            },
                        ],
                    })
                }
            />
        </div>
    ),
}))

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>()

    return {
        ...actual,
        useNavigate: vi.fn(),
    }
})

const mockedCreateContentPage = vi.mocked(createContentPage)
const mockedNavigate = vi.mocked(useNavigate)
const navigateMock = vi.fn()

function renderAdminContentNewPage() {
    return render(
        <MemoryRouter>
            <AdminContentNewPage />
        </MemoryRouter>,
    )
}

describe('AdminContentNewPage', () => {
    beforeEach(() => {
        vi.resetAllMocks()
        mockedNavigate.mockReturnValue(navigateMock)
        mockedCreateContentPage.mockResolvedValue({
            id: 'page-1',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
        })
    })

    it('renders the page creation form', () => {
        renderAdminContentNewPage()

        expect(
            screen.getByRole('heading', { name: 'New page' }),
        ).toBeInTheDocument()

        expect(screen.getByLabelText(/content language/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
        expect(screen.getByLabelText('Content')).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: /create page/i }),
        ).toBeDisabled()

        expect(
            screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument()
    })

    it('uses the default language from the current interface', () => {
        renderAdminContentNewPage()

        expect(screen.getByLabelText(/content language/i)).toHaveValue('en')
    })

    it('allows selecting English as the content language', async () => {
        const user = userEvent.setup()
        renderAdminContentNewPage()

        await user.selectOptions(
            screen.getByLabelText(/content language/i),
            'en',
        )

        expect(screen.getByLabelText(/content language/i)).toHaveValue('en')
    })

    it('keeps the create button disabled until title and content are provided', async () => {
        const user = userEvent.setup()
        renderAdminContentNewPage()

        const createButton = screen.getByRole('button', {
            name: /create page/i,
        })

        expect(createButton).toBeDisabled()

        await user.type(screen.getByLabelText(/title/i), 'About us')

        expect(createButton).toBeDisabled()

        await user.type(screen.getByLabelText('Content'), 'Page introduction')

        expect(createButton).toBeEnabled()
    })

    it('creates a page with its title, locale and initial content', async () => {
        const user = userEvent.setup()
        renderAdminContentNewPage()

        await user.selectOptions(
            screen.getByLabelText(/content language/i),
            'en',
        )

        await user.type(screen.getByLabelText(/title/i), 'About us')
        await user.type(screen.getByLabelText('Content'), 'Welcome to our website.')

        await user.click(
            screen.getByRole('button', { name: /create page/i }),
        )

        await waitFor(() => {
            expect(mockedCreateContentPage).toHaveBeenCalledWith({
                title: 'About us',
                locale: 'en',
                draftContent: {
                    type: 'doc',
                    content: [
                        {
                            type: 'paragraph',
                            content: [
                                {
                                    type: 'text',
                                    text: 'Welcome to our website.',
                                },
                            ],
                        },
                    ],
                },
            })
        })

        expect(navigateMock).toHaveBeenCalledWith('/admin/content')
    })

    it('trims whitespace from the title before creating a page', async () => {
        const user = userEvent.setup()
        renderAdminContentNewPage()

        await user.type(screen.getByLabelText(/title/i), '  About us  ')
        await user.type(screen.getByLabelText('Content'), 'Introduction')

        await user.click(
            screen.getByRole('button', { name: /create page/i }),
        )

        await waitFor(() => {
            expect(mockedCreateContentPage).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'About us',
                }),
            )
        })
    })

    it('does not create a page when the title contains only whitespace', async () => {
        const user = userEvent.setup()
        renderAdminContentNewPage()

        await user.type(screen.getByLabelText(/title/i), '   ')
        await user.type(screen.getByLabelText('Content'), 'Introduction')

        expect(
            screen.getByRole('button', { name: /create page/i }),
        ).toBeDisabled()

        expect(mockedCreateContentPage).not.toHaveBeenCalled()
    })

    it('does not create a page when the content is empty', async () => {
        const user = userEvent.setup()
        renderAdminContentNewPage()

        await user.type(screen.getByLabelText(/title/i), 'About us')

        expect(
            screen.getByRole('button', { name: /create page/i }),
        ).toBeDisabled()

        expect(mockedCreateContentPage).not.toHaveBeenCalled()
    })

    it('shows an error when the API request fails', async () => {
        mockedCreateContentPage.mockRejectedValueOnce(
            new ApiError(500, 'Internal Server Error'),
        )

        const user = userEvent.setup()
        renderAdminContentNewPage()

        await user.type(screen.getByLabelText(/title/i), 'About us')
        await user.type(screen.getByLabelText('Content'), 'Introduction')

        await user.click(
            screen.getByRole('button', { name: /create page/i }),
        )

        expect(await screen.findByRole('alert')).toBeInTheDocument()
        expect(navigateMock).not.toHaveBeenCalled()
    })

    it('shows a duplicate slug error when the API returns a conflict', async () => {
        mockedCreateContentPage.mockRejectedValueOnce({
            status: 409,
        })

        const user = userEvent.setup()
        renderAdminContentNewPage()

        await user.type(screen.getByLabelText(/title/i), 'About us')
        await user.type(screen.getByLabelText('Content'), 'Introduction')

        await user.click(
            screen.getByRole('button', { name: /create page/i }),
        )

        expect(await screen.findByRole('alert')).toBeInTheDocument()
        expect(navigateMock).not.toHaveBeenCalled()
    })

    it('navigates back when cancel is clicked', async () => {
        const user = userEvent.setup()
        renderAdminContentNewPage()

        await user.click(
            screen.getByRole('button', { name: /cancel/i }),
        )

        expect(navigateMock).toHaveBeenCalledWith('/admin/content')
        expect(mockedCreateContentPage).not.toHaveBeenCalled()
    })

    it('disables form controls while the page is being created', async () => {
        let resolveRequest!: (value: {
            id: string
            createdAt: string
            updatedAt: string
        }) => void

        mockedCreateContentPage.mockReturnValue(
            new Promise((resolve) => {
                resolveRequest = resolve
            }),
        )

        const user = userEvent.setup()
        renderAdminContentNewPage()

        await user.type(screen.getByLabelText(/title/i), 'About us')
        await user.type(screen.getByLabelText('Content'), 'Introduction')

        await user.click(
            screen.getByRole('button', { name: /create page/i }),
        )

        expect(
            screen.getByRole('button', { name: /creating/i }),
        ).toBeDisabled()

        expect(screen.getByLabelText(/title/i)).toBeDisabled()
        expect(screen.getByLabelText(/content language/i)).toBeDisabled()
        expect(screen.getByLabelText('Content')).toBeDisabled()

        resolveRequest({
            id: 'page-1',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
        })

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith('/admin/content')
        })
    })
})
